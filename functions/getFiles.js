// netlify/functions/getFiles.js
const { Pool } = require('pg');

exports.handler = async (event) => {
    // Add this line at the very top of your handler
    console.log('Incoming event object:', JSON.stringify(event, null, 2));

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only GET requests are accepted.' }),
            headers: { 'Allow': 'GET' }
        };
    }

    // THIS IS THE CRITICAL CHANGE FROM YOUR ORIGINAL CODE
    const property_id = event.pathParameters ? event.pathParameters.property_id : null; 

    if (!property_id) {
        // This is the error you're getting
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required field: property_id in path.', details: 'property_id is required as a path parameter, e.g., /api/properties/{id}/files.' }),
        };
    }

    let client;
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });
        client = await pool.connect();

        const result = await client.query(
            `SELECT id, filename, file_url, size, uploaded_at, folder_id, folder_name, uploaded_by_username
             FROM property_files
             WHERE property_id = $1
             ORDER BY uploaded_at DESC`,
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
        console.error('Error in getFiles function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve files.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
