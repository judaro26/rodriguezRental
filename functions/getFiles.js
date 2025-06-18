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

    let property_id = null;

    // 1. Try to get property_id from pathParameters (for /api/properties/:id/files URLs with rewrite)
    if (event.pathParameters && event.pathParameters.property_id) {
        property_id = event.pathParameters.property_id;
    }

    // 2. If not found in pathParameters, try to get it from queryStringParameters
    if (!property_id && event.queryStringParameters && event.queryStringParameters.property_id) {
        property_id = event.queryStringParameters.property_id;
    }

    // 3. Fallback: Extract property_id from the raw path string (if rewrite fails to populate pathParameters)
    if (!property_id && event.path) {
        const pathSegments = event.path.split('/');
        // Assuming path is like /api/properties/3/files, '3' would be at index 3 (0-indexed)
        if (pathSegments.length >= 4 && pathSegments[2] === 'properties' && pathSegments[4] === 'files') {
            property_id = pathSegments[3];
        }
    }

    const folderId = event.queryStringParameters ? event.queryStringParameters.folderId : null;
    console.log(`Resolved property_id: ${property_id}, folderId: ${folderId}`);


    if (!property_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required field: property_id.', details: 'Could not extract property_id from path parameters, query parameters, or URL path segments.' }),
        };
    }

    const numeric_property_id = parseInt(property_id, 10);
    if (isNaN(numeric_property_id)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid property_id.', details: 'property_id must be a valid number.' }),
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

        // --- Fetch Files ---
        let filesResult;
        if (folderId) {
            filesResult = await client.query(
                `SELECT id, filename, file_url, size, uploaded_at, folder_id, folder_name, uploaded_by_username
                 FROM property_files
                 WHERE property_id = $1 AND folder_id = $2
                 ORDER BY uploaded_at DESC`,
                [numeric_property_id, folderId]
            );
        } else {
            // Fetch files that are NOT in a subfolder (root files)
            filesResult = await client.query(
                `SELECT id, filename, file_url, size, uploaded_at, folder_id, folder_name, uploaded_by_username
                 FROM property_files
                 WHERE property_id = $1 AND folder_id IS NULL
                 ORDER BY uploaded_at DESC`,
                [numeric_property_id]
            );
        }
        const files = filesResult.rows;

        // --- Fetch Folders ---
        // Assuming you have a 'folders' table or similar for folder structure
        // If folders are also in 'property_files' but distinguished by type, adjust query.
        // For now, assuming a separate 'property_folders' table or similar.
        // You might need to adapt this query based on your actual folders table schema.
        let foldersResult;
        if (folderId) {
            // Fetch subfolders of the current folder
            foldersResult = await client.query(
                `SELECT id, name, parent_folder_id FROM property_folders
                 WHERE property_id = $1 AND parent_folder_id = $2
                 ORDER BY name ASC`,
                [numeric_property_id, folderId]
            );
        } else {
            // Fetch root-level folders for this property
            foldersResult = await client.query(
                `SELECT id, name, parent_folder_id FROM property_folders
                 WHERE property_id = $1 AND parent_folder_id IS NULL
                 ORDER BY name ASC`,
                [numeric_property_id]
            );
        }
        const folders = foldersResult.rows;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ files, folders }), // Return both files AND folders
        };

    } catch (error) {
        console.error('Error in getFiles function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve files and folders.', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
