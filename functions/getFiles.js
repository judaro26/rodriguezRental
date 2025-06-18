// netlify/functions/getFiles.js
const { Pool } = require('pg');

exports.handler = async (event) => {
    console.log('--- Incoming Event Object ---');
    console.log(JSON.stringify(event, null, 2));
    console.log('--- End Event Object ---');

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only GET requests are accepted.' }),
            headers: { 'Allow': 'GET' }
        };
    }

    // TEMPORARY CHANGE FOR DEBUGGING: Use queryStringParameters
    const { property_id } = event.queryStringParameters; 

    if (!property_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required field: property_id in query string. For debugging, use ?property_id=X' }),
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
