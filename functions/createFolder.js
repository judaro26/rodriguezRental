// netlify/functions/createFolder.js
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
        const { property_id, folder_name, username, password } = JSON.parse(event.body);

        // Input validation
        if (!property_id || !folder_name || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields.',
                    details: 'property_id, folder_name, username, and password are all mandatory.'
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

        // 1. Authenticate user
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

        // 2. Authorize user (same logic as moveFiles)
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

        // 3. Create folder (generate a simple ID, consider UUID for production)
        const folder_id = folder_name.trim().toLowerCase().replace(/\s+/g, '-');

        // Assuming a 'folders' table: CREATE TABLE folders (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, property_id INT NOT NULL);
        // Add a unique constraint to ensure unique folder names per property:
        // ALTER TABLE folders ADD CONSTRAINT unique_folder_name_per_property UNIQUE (name, property_id);
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
        // Check for specific unique constraint violation for better error message
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
