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

    // `folderId` from queryStringParameters will indicate the current parent folder to view.
    // Assuming 'parent_folder_id' column for folders if they can be nested.
    // If your 'folders' table doesn't have parent_folder_id, and only stores top-level folders for a property,
    // then this 'folderId' parameter might only filter files, not folders hierarchy.
    const current_view_folder_id = event.queryStringParameters ? event.queryStringParameters.folderId : null;
    console.log(`Resolved property_id: ${property_id}, current_view_folder_id: ${current_view_folder_id}`);

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

        // --- Fetch Files from 'property_files' table ---
        let filesQuery;
        let filesQueryParams;

        if (current_view_folder_id) {
            // Fetch files whose folder_id matches the current_view_folder_id
            filesQuery = `
                SELECT id, filename, file_url, size, uploaded_at, folder_id, folder_name, uploaded_by_username
                FROM property_files
                WHERE property_id = $1 AND folder_id = $2
                ORDER BY uploaded_at DESC
            `;
            filesQueryParams = [numeric_property_id, current_view_folder_id];
        } else {
            // Fetch files that are NOT in any subfolder (root files)
            filesQuery = `
                SELECT id, filename, file_url, size, uploaded_at, folder_id, folder_name, uploaded_by_username
                FROM property_files
                WHERE property_id = $1 AND folder_id IS NULL
                ORDER BY uploaded_at DESC
            `;
            filesQueryParams = [numeric_property_id];
        }
        const filesResult = await client.query(filesQuery, filesQueryParams);
        const files = filesResult.rows;


        // --- Fetch Folders from your 'folders' table ---
        // This is the CRUCIAL change. You have a 'folders' table.
        // Assuming your 'folders' table stores top-level folders for a property,
        // and doesn't have a parent_folder_id for nesting folders *within* the 'folders' table itself.
        // If your folders table also has parent_folder_id for nested folders, adjust this query.

        let foldersQuery;
        let foldersQueryParams;

        // If current_view_folder_id is provided, it means we are trying to view *inside* a folder.
        // If your 'folders' table only contains top-level folders, then you'd only query for
        // folders where property_id matches and there's no parent link.
        // If 'folders' table *also* supports nesting (e.g., with a 'parent_id' column), then adjust below.
        
        // For now, let's assume 'folders' table only contains top-level folders per property,
        // or that 'current_view_folder_id' is only for filtering *files* within a folder.
        // If 'folders' table has a 'parent_folder_id' column, then use this:
        // foldersQuery = `SELECT id, name FROM folders WHERE property_id = $1 AND parent_folder_id = $2 ORDER BY name ASC`;
        // foldersQueryParams = [numeric_property_id, current_view_folder_id];

        // Based on your columns: "id", "name", "property_id", "property"
        // It sounds like your 'folders' table stores *top-level* folders for a property.
        // So, we fetch all folders for the given property. If a folder can have sub-folders defined in this table,
        // you'd need a 'parent_id' or similar column in the 'folders' table itself.
        // Given just "property_id", it sounds like all folders fetched are direct children of the property.
        // The `current_view_folder_id` only filters files, not folders hierarchy *within the folders table itself*.

        // Let's assume for now your 'folders' table only holds direct children of a property (no nested folders in the 'folders' table itself)
        // If it DOES have nesting, you'll need a 'parent_id' column in your 'folders' table.
        
        foldersQuery = `
            SELECT id, name
            FROM folders
            WHERE property_id = $1
            ORDER BY name ASC
        `;
        foldersQueryParams = [numeric_property_id];
        
        const foldersResult = await client.query(foldersQuery, foldersQueryParams);
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
        // Log the specific error for debugging on Netlify
        console.error('Database query error details:', error.message, error.stack);
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
