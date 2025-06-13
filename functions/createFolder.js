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
                body: JSON.stringify({
                    message: 'Missing required fields.',
                    details: 'property_id, folder_name, username, and password are all mandatory.'
                }),
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
            'SELECT password_hash, foreign_approved, domestic_approved FROM users WHERE username = $1', // <-- CORRECTED COLUMN NAMES
            [username]
        );
        const user = authResult.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authentication failed. Invalid username or password.' }),
            };
        }

        // 2. Authorize user: Corrected property access here
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

        if (property.is_foreign && !user.foreign_approved) { // <-- CORRECTED PROPERTY ACCESS
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to manage foreign properties.' }),
            };
        }
        if (!property.is_foreign && !user.domestic_approved) { // <-- CORRECTED PROPERTY ACCESS
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to manage domestic properties.' }),
            };
        }

        const folder_id = folder_name.trim().toLowerCase().replace(/\s+/g, '-');

        await client.query(
            'INSERT INTO folders (id, name, property_id) VALUES ($1, $2, $3) ON CONFLICT (id, property_id) DO NOTHING',
            [folder_id, folder_name.trim(), property_id]
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Folder "${folder_name}" created successfully.`, folder: { id: folder_id, name: folder_name.trim() } }),
        };

    } catch (error) {
        console.error('Error in createFolder function:', error);
        if (error.code === '23505' && error.constraint === 'unique_folder_name_per_property') {
             return {
                statusCode: 409, // Conflict
                body: JSON.stringify({ message: 'Folder with this name already exists for this property.', details: error.message }),
            };
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
