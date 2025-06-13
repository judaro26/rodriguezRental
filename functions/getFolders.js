// netlify/functions/getFolders.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
    // This function will now be a POST request to send username/password
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only POST requests are accepted.' }),
            headers: { 'Allow': 'POST' }
        };
    }

    let client;
    try {
        const { property_id, username, password } = JSON.parse(event.body);

        if (!property_id || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields: property_id, username, and password are required.' }),
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

        // 2. Authorize user for the specific property
        const propertyResult = await client.query(
            'SELECT is_foreign FROM properties WHERE id = $1',
            [property_id]
        );
        const property = propertyResult.rows[0];

        if (!property) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Property not found.' }),
            };
        }

        if (property.is_foreign && !user.foreign_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to view foreign properties.' }),
            };
        }
        if (!property.is_foreign && !user.domestic_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: You are not authorized to view domestic properties.' }),
            };
        }

        // 3. Fetch all folders for the given property_id
        const foldersResult = await client.query(
            'SELECT id, name FROM folders WHERE property_id = $1 ORDER BY name ASC',
            [property_id]
        );

        return {
            statusCode: 200,
            body: JSON.stringify(foldersResult.rows),
        };

    } catch (error) {
        console.error('Error in getFolders function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve folders.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
