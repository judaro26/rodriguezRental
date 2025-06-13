// netlify/functions/createFolder.js
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
        const { property_id, folder_name, username, password } = JSON.parse(event.body);

        if (!property_id || !folder_name || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'property_id, folder_name, username, and password are all mandatory.' }),
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

        // Generate a simple folder_id (kebab-case) from the folder_name
        const folderId = folder_name.toLowerCase().replace(/\s+/g, '-');

        await client.query('BEGIN'); // Start transaction

        // Insert or ignore if folder already exists
        const insertResult = await client.query(
            `INSERT INTO folders (id, property_id, name)
             VALUES ($1, $2, $3)
             ON CONFLICT (property_id, name) DO NOTHING RETURNING *`,
            [folderId, property_id, folder_name]
        );

        await client.query('COMMIT'); // Commit transaction

        if (insertResult.rowCount === 0) {
            return {
                statusCode: 409, // Conflict
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: `Folder "${folder_name}" already exists for this property.` }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: `Folder "${folder_name}" created successfully!`, folder: insertResult.rows[0] }),
        };

    } catch (error) {
        console.error('Error in createFolder function:', error);
        if (client) {
            await client.query('ROLLBACK'); // Rollback transaction on error
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create folder.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
