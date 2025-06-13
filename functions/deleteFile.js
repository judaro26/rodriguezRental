// netlify/functions/deleteFiles.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only POST requests are accepted.' }),
            headers: { 'Allow': 'POST' }
        };
    }

    let client;
    try {
        const { file_ids, property_id, username, password } = JSON.parse(event.body);

        if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0 || !property_id || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'file_ids (array), property_id, username, and password are all mandatory.' }),
            };
        }

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });
        client = await pool.connect();

        // 1. Authenticate user
        const authResult = await client.query(
            'SELECT password_hash, foreign_approved, domestic_approved FROM users WHERE username = $1',
            [username]
        );
        const user = authResult.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authentication failed. Invalid username or password.' }),
            };
        }

        // 2. Authorize user for the property
        const propertyResult = await client.query(
            'SELECT is_foreign FROM properties WHERE id = $1',
            [property_id]
        );
        const property = propertyResult.rows[0];

        if (!property) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Property not found.', details: `Property with ID ${property_id} does not exist.` }),
            };
        }

        if (property.is_foreign && !user.foreign_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to manage foreign properties.' }),
            };
        }
        if (!property.is_foreign && !user.domestic_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to manage domestic properties.' }),
            };
        }

        await client.query('BEGIN'); // Start transaction

        // 3. Get file_url and filename (to derive public_id) from database for deletion in Cloudinary
        const filesToDeleteResult = await client.query(
            `SELECT file_url, filename FROM property_files WHERE id = ANY($1::int[]) AND property_id = $2`,
            [file_ids, property_id]
        );

        const cloudinaryPublicIds = filesToDeleteResult.rows.map(file => {
            // Attempt to derive Cloudinary public_id from the stored file_url
            // This assumes the Cloudinary public_id is part of the URL path after '/upload/'
            const urlParts = file.file_url.split('/upload/');
            if (urlParts.length > 1) {
                const pathAfterUpload = urlParts[1];
                // Remove version number (e.g., /v123456789/) and file extension
                const publicIdWithPotentialVersionAndExtension = pathAfterUpload.split('/').slice(1).join('/');
                return publicIdWithPotentialVersionAndExtension.split('.')[0]; // Get only the public ID part
            }
            return null;
        }).filter(Boolean); // Filter out any nulls

        console.log("Derived Public IDs to delete from Cloudinary:", cloudinaryPublicIds);

        // 4. Delete files from Cloudinary
        if (cloudinaryPublicIds.length > 0) {
            // Cloudinary's destroy method attempts to auto-detect resource type if not specified.
            // For batch deletion, it's safer to specify 'image' if most are images,
            // or iterate and determine resource_type per file if highly mixed (e.g., pdfs are 'raw').
            // Using 'image' as a common default. If PDFs fail, this is the area to investigate.
            const deleteResult = await cloudinary.uploader.destroy(cloudinaryPublicIds, {
                invalidate: true // Invalidate CDN cache
            });
            console.log('Cloudinary delete result:', deleteResult);
            // deleteResult.result will be 'ok' or 'not found' for each public_id
        }

        // 5. Delete file records from your database
        const deleteDbResult = await client.query(
            `DELETE FROM property_files WHERE id = ANY($1::int[]) AND property_id = $2 RETURNING id`,
            [file_ids, property_id]
        );

        if (deleteDbResult.rowCount !== file_ids.length) {
            await client.query('ROLLBACK');
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Some files could not be found or deleted from the database.', deletedCount: deleteDbResult.rowCount }),
            };
        }

        await client.query('COMMIT');

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: `Successfully deleted ${deleteDbResult.rowCount} file(s).` }),
        };

    } catch (error) {
        console.error('Error in deleteFiles function:', error);
        if (client) {
            await client.query('ROLLBACK');
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete files.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
