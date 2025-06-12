const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (from Netlify Environment Variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Allow": "POST", "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed"
    };
  }

  if (!process.env.DATABASE_URL || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing environment variables for DB or Cloudinary.");
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server configuration error: Missing API keys." })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Parse the multipart/form-data for file upload
    // Netlify Functions support body parsing, but often it's raw binary for files.
    // For simplicity, we'll assume the client sends Base64 encoded file data
    // in a JSON payload, or use a library for multipart form data.
    // For a simple browser upload, sending as Base64 is often easier for the client.
    const { property_id, filename, file_data, uploaded_by_username } = JSON.parse(event.body);

    if (!property_id || !filename || !file_data || !uploaded_by_username) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required fields: property_id, filename, file_data, uploaded_by_username." })
      };
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file_data}`, {
      resource_type: "auto", // Automatically detect file type
      folder: `property_docs/${property_id}`, // Organize uploads by property ID
      public_id: filename.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_.]/g, ''), // Sanitize filename for public ID
    });

    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id; // Store Cloudinary's public ID for deletion

    // Save file metadata to Neon DB
    const queryText = `
      INSERT INTO property_files(property_id, filename, file_url, uploaded_by_username, cloudinary_public_id, uploaded_at)
      VALUES($1, $2, $3, $4, $5, NOW())
      RETURNING id, filename, file_url, uploaded_by_username, uploaded_at;
    `;
    const result = await client.query(queryText, [property_id, filename, fileUrl, uploaded_by_username, publicId]);
    const newFile = result.rows[0];

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ message: "File uploaded and saved successfully!", file: newFile })
    };

  } catch (error) {
    console.error("Error uploading file or saving to DB:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to upload file", details: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
