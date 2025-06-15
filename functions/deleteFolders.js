// netlify/functions/deleteFolders.js
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
        const { folder_ids, property_id, username, password } = JSON.parse(event.body);

        if (!folder_ids || !Array.isArray(folder_ids) || folder_ids.length === 0 || !property_id || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'folder_ids (array), property_id, username, and password are all mandatory.' }),
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

        // 3. Get all files associated with the folders to be deleted
        const filesInFoldersResult = await client.query(
            `SELECT id, cloudinary_public_id, file_mime_type FROM property_files WHERE folder_id = ANY($1::text[]) AND property_id = $2`,
            [folder_ids, property_id]
        );

        // Categorize public IDs by resource_type for Cloudinary deletion
        const publicIdsByType = {
            image: [],
            raw: [],
            video: []
        };
        const filesMissingPublicId = [];

        filesInFoldersResult.rows.forEach(file => {
            const publicId = file.cloudinary_public_id;
            const mimeType = file.file_mime_type;

            if (typeof publicId === 'string' && publicId.trim() !== '') {
                if (mimeType && mimeType.startsWith('image/')) {
                    publicIdsByType.image.push(publicId);
                } else if (mimeType && mimeType.startsWith('video/')) {
                    publicIdsByType.video.push(publicId);
                } else {
                    publicIdsByType.raw.push(publicId);
                }
            } else {
                filesMissingPublicId.push(file.id); // Collect IDs of files that won't be deleted from Cloudinary
            }
        });

        if (filesMissingPublicId.length > 0) {
            console.warn(`Skipping Cloudinary deletion for ${filesMissingPublicId.length} file(s) within deleted folders due to missing/invalid public_id. Their DB records will still be deleted. File IDs:`, filesMissingPublicId);
        }
        console.log("Files in folders categorized for deletion:", publicIdsByType);


        // 4. Delete files from Cloudinary for each resource type
        const cloudinaryDeletionPromises = [];

        if (publicIdsByType.image.length > 0) {
            cloudinaryDeletionPromises.push(cloudinary.api.delete_resources(publicIdsByType.image, {
                invalidate: true,
                resource_type: 'image'
            }));
        }
        if (publicIdsByType.raw.length > 0) {
            cloudinaryDeletionPromises.push(cloudinary.api.delete_resources(publicIdsByType.raw, {
                invalidate: true,
                resource_type: 'raw'
            }));
        }
        if (publicIdsByType.video.length > 0) {
            cloudinaryDeletionPromises.push(cloudinary.api.delete_resources(publicIdsByType.video, {
                invalidate: true,
                resource_type: 'video'
            }));
        }

        // Wait for Cloudinary deletions to complete, but don't block DB deletion if Cloudinary fails
        const cloudinaryDeleteResults = await Promise.allSettled(cloudinaryDeletionPromises);
        cloudinaryDeleteResults.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log('Cloudinary folder content delete result (fulfilled):', result.value);
            } else {
                console.error('Cloudinary folder content delete failed (rejected):', result.reason);
            }
        });

        // 5. Delete file records from the database that belong to the deleted folders
        const deletedFileIds = filesInFoldersResult.rows.map(file => file.id);
        if (deletedFileIds.length > 0) {
            const deleteFilesInDbResult = await client.query(
                `DELETE FROM property_files WHERE id = ANY($1::int[]) AND property_id = $2 RETURNING id`,
                [deletedFileIds, property_id]
            );
            console.log(`Deleted ${deleteFilesInDbResult.rowCount} file records from DB.`);
        }

        // 6. Delete folder records from the database
        const deleteFoldersDbResult = await client.query(
            `DELETE FROM folders WHERE id = ANY($1::text[]) AND property_id = $2 RETURNING id`,
            [folder_ids, property_id]
        );

        if (deleteFoldersDbResult.rowCount !== folder_ids.length) {
            await client.query('ROLLBACK');
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Some folders could not be found or deleted from the database.', deletedCount: deleteFoldersDbResult.rowCount }),
            };
        }

        await client.query('COMMIT');

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: `Successfully deleted ${deleteFoldersDbResult.rowCount} folder(s) and their contents.` }),
        };

    } catch (error) {
        console.error('Error in deleteFolders function:', error);
        if (client) {
            await client.query('ROLLBACK');
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete folders.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
