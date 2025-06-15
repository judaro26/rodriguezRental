// netlify/functions/updateFolder.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { property_id, folder_id, new_folder_name, username, password } = JSON.parse(event.body);

    if (!property_id || !folder_id || !new_folder_name || !username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields: property_id, folder_id, new_folder_name, username, password' }),
        };
    }

    const client = await pool.connect();
    try {
        // Authenticate user
        const userAuthQuery = 'SELECT id, is_admin, foreign_approved, domestic_approved FROM users WHERE username = $1 AND password = crypt($2, password)';
        const userAuthResult = await client.query(userAuthQuery, [username, password]);

        if (userAuthResult.rows.length === 0) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid credentials. Folder rename denied.' }),
            };
        }
        const user = userAuthResult.rows[0];

        // Authorize: Only admin or approved users can rename folders
        // You might want more granular control, e.g., only users who can access the property
        // For simplicity, let's assume if they can log in, they can manage folders on properties they have access to.
        // A more robust system would check property ownership/access rights.

        // Check if the property exists and is accessible to the user (optional, but good practice)
        const propertyCheckQuery = 'SELECT id, is_foreign FROM properties WHERE id = $1';
        const propertyCheckResult = await client.query(propertyCheckQuery, [property_id]);

        if (propertyCheckResult.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Property not found.' }),
            };
        }
        const property = propertyCheckResult.rows[0];

        // Enforce foreign/domestic property permissions if applicable
        if (property.is_foreign && !user.foreign_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'User not approved to manage foreign properties.' }),
            };
        }
        if (!property.is_foreign && !user.domestic_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'User not approved to manage domestic properties.' }),
            };
        }

        // Generate new folder ID (kebab-case from new name)
        const new_folder_id = new_folder_name.toLowerCase().replace(/\s+/g, '-');

        // Check for duplicate new folder name within the property
        const duplicateCheckQuery = 'SELECT id FROM folders WHERE property_id = $1 AND id = $2 AND id != $3';
        const duplicateCheckResult = await client.query(duplicateCheckQuery, [property_id, new_folder_id, folder_id]);
        if (duplicateCheckResult.rows.length > 0) {
            return {
                statusCode: 409, // Conflict
                body: JSON.stringify({ message: `A folder with the name "${new_folder_name}" already exists for this property.` }),
            };
        }

        // Start a transaction to ensure atomicity
        await client.query('BEGIN');

        // Update the folder entry in the 'folders' table
        const updateFolderQuery = 'UPDATE folders SET name = $1, id = $2 WHERE property_id = $3 AND id = $4 RETURNING *';
        const updateFolderResult = await client.query(updateFolderQuery, [new_folder_name, new_folder_id, property_id, folder_id]);

        if (updateFolderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Folder not found for this property.' }),
            };
        }

        // Update all files that were associated with the old folder_id to the new_folder_id
        const updateFilesQuery = 'UPDATE files SET folder_id = $1, folder_name = $2 WHERE property_id = $3 AND folder_id = $4 RETURNING *';
        await client.query(updateFilesQuery, [new_folder_id, new_folder_name, property_id, folder_id]);

        await client.query('COMMIT');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Folder "${oldFolderName}" renamed to "${new_folder_name}" successfully!` }),
        };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating folder:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to rename folder.', details: error.message }),
        };
    } finally {
        client.release();
    }
};
