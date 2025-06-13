// netlify/functions/moveFiles.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // For comparing hashed passwords

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only POST requests are accepted.' }),
            headers: { 'Allow': 'POST' }
        };
    }

    let client;
    try {
        const { file_ids, folder_id, folder_name, username, password, property_id } = JSON.parse(event.body);

        // Input validation
        if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0 || !property_id || !folder_id || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields.',
                    details: 'file_ids (array), property_id, folder_id, username, and password are all mandatory.'
                }),
            };
        }

        // Initialize PostgreSQL Pool
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false, // Required for Neon DB connections
            },
        });
        client = await pool.connect();

        // 1. Authenticate user: Check username and password against the 'users' table
        const authResult = await client.query(
            'SELECT password_hash, is_foreign_approved, is_domestic_approved FROM users WHERE username = $1',
            [username]
        );
        const user = authResult.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authentication failed. Invalid username or password.' }),
            };
        }

        // 2. Authorize user: Check if the user has permission to modify this property based on its 'is_foreign' status
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

        if (property.is_foreign && !user.is_foreign_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to manage foreign properties.' }),
            };
        }
        if (!property.is_foreign && !user.is_domestic_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to manage domestic properties.' }),
            };
        }

        // Start a transaction for atomicity
        await client.query('BEGIN');

        // 3. Update files in the 'files' table
        // We'll update files belonging to the specified property_id and whose IDs are in the file_ids array.
        // The folder_name can be optional from the client, so default to folder_id if not provided.
        const effectiveFolderName = folder_name && folder_name.trim() !== '' ? folder_name : folder_id;

        const updatePromises = file_ids.map(fileId =>
            client.query(
                `UPDATE files
                 SET folder_id = $1, folder_name = $2
                 WHERE id = $3 AND property_id = $4 RETURNING id`,
                [folder_id, effectiveFolderName, fileId, property_id]
            )
        );

        const updatedFiles = await Promise.all(updatePromises);

        // Check if all files were actually updated (e.g., if a file_id didn't exist for that property)
        if (updatedFiles.some(res => res.rowCount === 0)) {
             await client.query('ROLLBACK'); // Rollback if any file wasn't found/updated
             return {
                statusCode: 404,
                body: JSON.stringify({ message: 'One or more files not found or not associated with this property.', updatedCount: updatedFiles.filter(r => r.rowCount > 0).length }),
             };
        }

        await client.query('COMMIT');

        // Optional: If your Cloudinary setup relies on folder prefixes in public_ids
        // and you want to actually rename them in Cloudinary, this is where you'd add that logic.
        // This is complex and depends on your Cloudinary public_id structure.
        // For example, if you have 'property_X/old_folder_Y/image.jpg' and want to change to 'property_X/new_folder_Z/image.jpg'
        // You would fetch existing public_ids from Cloudinary via your DB, then use cloudinary.uploader.rename
        // Example (requires 'cloudinary' package and config):
        /*
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Fetch current public_ids if needed for renaming in Cloudinary
        const filesPublicIds = (await client.query('SELECT public_id FROM files WHERE id = ANY($1::int[])', [file_ids])).rows;
        const cloudinaryRenames = filesPublicIds.map(file => {
            const oldPublicId = file.public_id;
            // You'll need custom logic here to derive the new public ID path
            // For example, if public_id is 'property_123/old_folder_abc/my_image',
            // you'd parse 'my_image' and create 'property_123/new_folder_xyz/my_image'
            const newPublicId = `property_${property_id}/${folder_id}/${oldPublicId.split('/').pop()}`; // Simplified example
            return cloudinary.uploader.rename(oldPublicId, newPublicId, { overwrite: true });
        });
        await Promise.allSettled(cloudinaryRenames); // Use Promise.allSettled to continue even if one rename fails
        */

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Successfully moved ${file_ids.length} file(s) to folder "${effectiveFolderName}".` }),
        };

    } catch (error) {
        console.error('Error in moveFiles function:', error);
        if (client) {
            await client.query('ROLLBACK'); // Rollback transaction on error
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to move files.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
