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

        // 3. Get `cloudinary_public_id` and `file_mime_type` for deletion from database
        // This query now explicitly selects `file_mime_type`. Ensure this column exists in your DB.
        const filesToDeleteResult = await client.query(
            `SELECT cloudinary_public_id, file_mime_type FROM property_files WHERE id = ANY($1::int[]) AND property_id = $2`,
            [file_ids, property_id]
        );

        // Categorize public IDs by resource_type
        const publicIdsByType = {
            image: [],
            raw: [],
            video: []
        };
        const filesWithoutPublicId = [];

        filesToDeleteResult.rows.forEach(file => {
            const publicId = file.cloudinary_public_id;
            const mimeType = file.file_mime_type; // This will now be available from the DB query

            if (typeof publicId === 'string' && publicId.trim() !== '') {
                if (mimeType && mimeType.startsWith('image/')) { // Check mimeType is not null/undefined
                    publicIdsByType.image.push(publicId);
                } else if (mimeType && mimeType.startsWith('video/')) { // Check mimeType is not null/undefined
                    publicIdsByType.video.push(publicId);
                } else {
                    // Treat all other document types (pdf, doc, xls etc.) as 'raw'
                    publicIdsByType.raw.push(publicId);
                }
            } else {
                filesWithoutPublicId.push(file); // Collect files missing valid public ID
            }
        });

        // Log any files that won't be deleted from Cloudinary
        if (filesWithoutPublicId.length > 0) {
            console.warn(`Skipping Cloudinary deletion for ${filesWithoutPublicId.length} file(s) missing a valid public_id:`, filesWithoutPublicId);
        }

        console.log("Public IDs categorized for deletion:", publicIdsByType);

        // 4. Delete files from Cloudinary for each resource type
        const deletionPromises = [];

        if (publicIdsByType.image.length > 0) {
            deletionPromises.push(cloudinary.api.delete_resources(publicIdsByType.image, {
                invalidate: true,
                resource_type: 'image'
            }));
        }
        if (publicIdsByType.raw.length > 0) {
            deletionPromises.push(cloudinary.api.delete_resources(publicIdsByType.raw, {
                invalidate: true,
                resource_type: 'raw'
            }));
        }
        if (publicIdsByType.video.length > 0) {
            deletionPromises.push(cloudinary.api.delete_resources(publicIdsByType.video, {
                invalidate: true,
                resource_type: 'video'
            }));
        }

        // Wait for all Cloudinary deletions to complete
        const deleteResults = await Promise.allSettled(deletionPromises);
        deleteResults.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log('Cloudinary delete result (fulfilled):', result.value);
            } else {
                console.error('Cloudinary delete failed (rejected):', result.reason);
                // Optionally, you might decide to return an error here or continue
                // and just log if Cloudinary deletion fails but DB deletion proceeds.
                // For now, we'll let the DB deletion proceed.
            }
        });

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
