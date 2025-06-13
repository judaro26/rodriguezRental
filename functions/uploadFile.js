// netlify/functions/uploadFile.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2; // Make sure to install this: npm install cloudinary

// Configure Cloudinary (ensure these are set as Netlify Environment Variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        const { property_id, filename, file_data_base64, uploaded_by_username, username, password } = JSON.parse(event.body);

        if (!property_id || !filename || !file_data_base64 || !uploaded_by_username || !username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields.', details: 'property_id, filename, file_data_base64, uploaded_by_username, username, and password are all mandatory.' }),
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

        // 3. Upload file to Cloudinary
        // Use a folder structure to organize files per property
        const cloudinaryFolder = `property_files/${property_id}`;

        const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file_data_base64}`, { // Default to image/jpeg for example, your client sends actual mime type
            folder: cloudinaryFolder,
            public_id: filename.replace(/\.[^/.]+$/, ""), // Use filename (without extension) as public_id
            resource_type: 'auto', // Auto-detect image, video, raw (for PDFs)
            overwrite: false, // Don't overwrite if file with same public_id exists
        });

        const fileUrl = uploadResult.secure_url;
        const fileSize = uploadResult.bytes; // Size in bytes from Cloudinary

        // 4. Save file metadata to your database
        await client.query('BEGIN'); // Start transaction

        const insertResult = await client.query(
            `INSERT INTO property_files (property_id, filename, file_url, size, uploaded_by_username)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`, // Corrected table name
            [property_id, filename, fileUrl, fileSize, uploaded_by_username]
        );

        await client.query('COMMIT'); // Commit transaction

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: 'File uploaded and saved successfully!', file: insertResult.rows[0] }),
        };

    } catch (error) {
        console.error('Error in uploadFile function:', error);
        if (client) {
            await client.query('ROLLBACK'); // Rollback transaction on error
        }
        // Cloudinary upload errors might be more specific
        const details = error.http_code ? `Cloudinary Error: ${error.message} (Code: ${error.http_code})` : error.message;

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to upload file.', details: details }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
