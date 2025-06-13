// netlify/functions/getFolders.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // Needed for authentication

exports.handler = async (event) => {
    // This function can accept GET for simplicity, but if you pass auth, POST is safer
    if (event.httpMethod !== 'POST') { // Your client-side calls this with POST, so let's stick to POST
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
                body: JSON.stringify({ message: 'Missing required fields.', details: 'property_id, username, and password are all mandatory.' }),
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


        // Fetch distinct folder_id and folder_name from property_files table
        // Only include folders that actually have files in them (folder_id IS NOT NULL)
        // You might consider querying a separate 'folders' table if you created one,
        // but this approach directly reflects existing file folders.
        const result = await client.query(
            `SELECT DISTINCT folder_id as id, folder_name as name
             FROM property_files
             WHERE property_id = $1 AND folder_id IS NOT NULL
             ORDER BY name`,
            [property_id]
        );

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(result.rows),
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
