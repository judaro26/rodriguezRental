// netlify/functions/getFolders.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
    // This function expects a POST request from the client to include authentication details.
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only POST requests are accepted for this endpoint.' }),
            headers: { 'Allow': 'POST' }
        };
    }

    let client; // Declare client variable outside try-catch for finally block access
    try {
        const { property_id, username, password } = JSON.parse(event.body);

        // Basic validation for required fields in the request body
        if (!property_id || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'property_id, username, and password are all mandatory in the request body.' }),
            };
        }

        // Initialize PostgreSQL connection pool
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false, // Required for Neon DB connections via Netlify
            },
        });
        client = await pool.connect(); // Get a client from the pool

        // 1. Authenticate user credentials
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

        // 2. Authorize user access to the specific property
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

        // Check user's approval status against property type
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

        // --- CORE LOGIC: Fetch folders from the 'folders' table ---
        // Selecting 'id' as 'id' and 'name' as 'name' as per your 'folders' table schema.
        // The 'id' column in your 'folders' table acts as the folder_id for the files.
        const result = await client.query(
            `SELECT id, name
             FROM folders
             WHERE property_id = $1
             ORDER BY name`,
            [property_id]
        );

        // Return the fetched folders
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(result.rows),
        };

    } catch (error) {
        // Log the full error details for debugging in Netlify logs
        console.error('Error in getFolders function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to retrieve folders.',
                details: error.message // Provide the specific error message from the database/Node.js
            }),
        };
    } finally {
        // Ensure the database client is released back to the pool
        if (client) {
            client.release();
        }
    }
};
