// netlify/functions/moveFiles.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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
        const { file_ids, folder_id, folder_name, username, password, property_id } = JSON.parse(event.body);

        if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0 || !property_id || !folder_id || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'file_ids (array), property_id, folder_id, username, and password are all mandatory.' }),
            };
        }

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });
        client = await pool.connect();

        // 1. Authenticate user: Corrected column names here
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

        // 2. Authorize user
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

        await client.query('BEGIN');

        // Determine the folder_name to store, falling back to folder_id if name is empty
        const effectiveFolderName = folder_name && folder_name.trim() !== '' ? folder_name.trim() : folder_id;

        const updatePromises = file_ids.map(fileId =>
            client.query(
                `UPDATE property_files -- Corrected table name here
                 SET folder_id = $1, folder_name = $2
                 WHERE id = $3 AND property_id = $4 RETURNING id`,
                [folder_id, effectiveFolderName, fileId, property_id]
            )
        );

        const updatedFiles = await Promise.all(updatePromises);

        // Check if all files were found and updated
        if (updatedFiles.some(res => res.rowCount === 0)) {
            await client.query('ROLLBACK');
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'One or more files not found or not associated with this property.',
                    updatedCount: updatedFiles.filter(r => r.rowCount > 0).length
                }),
            };
        }

        await client.query('COMMIT');

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: `Successfully moved ${file_ids.length} file(s) to folder "${effectiveFolderName}".` }),
        };

    } catch (error) {
        console.error('Error in moveFiles function:', error);
        if (client) {
            await client.query('ROLLBACK');
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
