// netlify/functions/uploadFile.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2; // Import Cloudinary library

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
    // Ensure the request method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed', details: 'Only POST requests are accepted.' }),
            headers: { 'Allow': 'POST' }
        };
    }

    let client; // Declare client variable to ensure it's accessible in finally block
    try {
        // Parse the request body to get necessary data
        const { property_id, filename, file_data_base64, uploaded_by_username, username, password } = JSON.parse(event.body);

        // Validate required fields
        if (!property_id || !filename || !file_data_base64 || !uploaded_by_username || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'property_id, filename, file_data_base64, uploaded_by_username, username, and password are all mandatory.' }),
            };
        }

        // Initialize PostgreSQL connection pool
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false, // Required for secure connection to Neon DB
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

        // Check user's approval status against property type (domestic/foreign)
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

        // 3. Upload file to Cloudinary
        // Organize files in Cloudinary by property_id
        const cloudinaryFolder = `property_files/${property_id}`;

        // Create a unique public_id for the file in Cloudinary to prevent overwrites and allow same filenames
        // We append a timestamp to the original filename (without extension)
        const baseFilename = filename.split('.').slice(0, -1).join('.'); // Get filename without extension
        const publicId = `${baseFilename}_${Date.now()}`;

        // Upload to Cloudinary using the base64 data
        // resource_type: 'auto' allows Cloudinary to detect image, video, or raw (for documents)
        const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file_data_base64}`, { // NOTE: The `data:image/jpeg;base64,` prefix is an example. The actual prefix should come from client's FileReader result.
            folder: cloudinaryFolder,
            public_id: publicId,
            resource_type: 'auto', // Automatically detect file type (image, video, raw)
            overwrite: false, // Do not overwrite existing assets
        });

        const fileUrl = uploadResult.secure_url; // Get the secure URL of the uploaded file
        const fileSize = uploadResult.bytes;    // Get the file size in bytes from Cloudinary

        // 4. Save file metadata to your database
        await client.query('BEGIN'); // Start a database transaction

        const insertResult = await client.query(
            `INSERT INTO property_files (property_id, filename, file_url, size, uploaded_by_username)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`, // Insert into property_files table
            [property_id, filename, fileUrl, fileSize, uploaded_by_username]
        );

        await client.query('COMMIT'); // Commit the transaction if everything was successful

        // Return a success response
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: 'File uploaded and saved successfully!', file: insertResult.rows[0] }),
        };

    } catch (error) {
        // Log the error for debugging purposes in Netlify logs
        console.error('Error in uploadFile function:', error);
        if (client) {
            await client.query('ROLLBACK'); // Rollback the transaction on any error
        }

        // Provide a more descriptive error based on the error type
        let errorMessage = 'Failed to upload file.';
        if (error.http_code) { // Cloudinary-specific error
            errorMessage = `Cloudinary Error: ${error.message} (Code: ${error.http_code})`;
            // You can add more specific checks here for Cloudinary free tier limits for 'raw' files
            if (error.message && error.message.includes('Raw file upload is not allowed')) {
                errorMessage = `Upload failed: Your Cloudinary plan might not support this file type (e.g., PDF, DOC, XLS). Please try an image file (JPG, PNG).`;
            }
        } else if (error.message) { // General Node.js or PG error
            errorMessage = `Error details: ${error.message}`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: errorMessage, details: error.message }),
        };
    } finally {
        // Ensure the database client connection is released back to the pool
        if (client) {
            client.release();
        }
    }
};
