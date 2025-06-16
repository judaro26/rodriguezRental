// netlify/functions/deleteFolder.js
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

    const { property_id, folder_id, username, password } = JSON.parse(event.body);

    if (!property_id || !folder_id || !username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields: property_id, folder_id, username, password' }),
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
                body: JSON.stringify({ message: 'Invalid credentials. Folder deletion denied.' }),
            };
        }
        const user = userAuthResult.rows[0];

        // Authorize: Only admin or approved users can delete folders
        const propertyCheckQuery = 'SELECT id, is_foreign FROM properties WHERE id = $1';
        const propertyCheckResult = await client.query(propertyCheckQuery, [property_id]);

        if (propertyCheckResult.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Property not found.' }),
            };
        }
        const property = propertyCheckResult.rows[0];

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

        // Start a transaction to ensure atomicity
        await client.query('BEGIN');

        // IMPORTANT: Decide if you want to delete files or reassign them
        // Option 1: Reassign files to no folder (folder_id = NULL)
        const updateFilesQuery = 'UPDATE files SET folder_id = NULL, folder_name = NULL WHERE property_id = $1 AND folder_id = $2';
        await client.query(updateFilesQuery, [property_id, folder_id]);
        const filesAffected = client.queryResult.rowCount; // Get count of files affected

        // Option 2: Delete all files within the folder (uncomment this and remove Option 1 if preferred)
        // const deleteFilesQuery = 'DELETE FROM files WHERE property_id = $1 AND folder_id = $2';
        // await client.query(deleteFilesQuery, [property_id, folder_id]);
        // const filesAffected = client.queryResult.rowCount;

        // Delete the folder entry itself
        const deleteFolderQuery = 'DELETE FROM folders WHERE property_id = $1 AND id = $2 RETURNING *';
        const deleteFolderResult = await client.query(deleteFolderQuery, [property_id, folder_id]);

        if (deleteFolderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Folder not found for this property.' }),
            };
        }

        await client.query('COMMIT');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Folder "${folderName}" and its ${filesAffected} files (reassigned) deleted successfully!` }),
        };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting folder:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete folder.', details: error.message }),
        };
    } finally {
        client.release();
    }
};
