// netlify/functions/deleteFiles.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2; // Make sure to install this

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

        // 3. Get public_ids from database for deletion in Cloudinary
        const filesToDeleteResult = await client.query(
            `SELECT file_url, filename FROM property_files WHERE id = ANY($1::int[]) AND property_id = $2`, // Corrected table name
            [file_ids, property_id]
        );

        const cloudinaryPublicIds = filesToDeleteResult.rows.map(file => {
            // Extract public_id from Cloudinary URL (e.g., 'property_files/1/image_name_without_extension')
            const parts = file.file_url.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex > -1 && parts.length > uploadIndex + 2) {
                 // Check for version number (v123456789)
                const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
                const publicIdParts = publicIdWithVersion.split('.'); // Remove file extension
                return publicIdParts[0].split('/').slice(0, -1).join('/') + '/' + publicIdParts[0].split('/').pop().split('v')[0];
            }
            return null;
        }).filter(Boolean); // Filter out any nulls

        console.log("Public IDs to delete from Cloudinary:", cloudinaryPublicIds);

        // 4. Delete files from Cloudinary
        if (cloudinaryPublicIds.length > 0) {
            const deleteResult = await cloudinary.api.delete_resources(cloudinaryPublicIds, {
                invalidate: true, // Invalidate CDN cache
                resource_type: 'image' // Assuming mostly images, 'raw' for PDFs
                                       // NOTE: Cloudinary delete_resources does not support mixed resource_types directly.
                                       // You might need to make separate calls for 'image' and 'raw' types,
                                       // or determine resource_type per public_id if you have mixed files.
                                       // For simplicity, this assumes primarily images. If PDFs fail to delete from Cloudinary,
                                       // this is where you'd need to refine.
            });
            console.log('Cloudinary delete result:', deleteResult);
            // Check deleteResult.deleted for successful deletions
        }

        // 5. Delete file records from your database
        const deleteDbResult = await client.query(
            `DELETE FROM property_files WHERE id = ANY($1::int[]) AND property_id = $2 RETURNING id`, // Corrected table name
            [file_ids, property_id]
        );

        if (deleteDbResult.rowCount !== file_ids.length) {
            await client.query('ROLLBACK'); // Rollback if not all requested files were deleted from DB
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Some files could not be found or deleted from the database.', deletedCount: deleteDbResult.rowCount }),
            };
        }

        await client.query('COMMIT'); // Commit transaction

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
