const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');
const crypto = require('crypto');

// Configure Cloudinary (from Netlify Environment Variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to hash passwords (must match loginUser.js)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.handler = async function(event, context) {
  console.log("uploadFile function invoked."); // Log start of function

  if (event.httpMethod !== "POST") {
    console.log(`Received non-POST method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers: { "Allow": "POST", "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed"
    };
  }

  // Check for essential environment variables
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
    console.log("Successfully connected to database.");

    const { property_id, filename, file_data_base64, uploaded_by_username, username, password } = JSON.parse(event.body);

    console.log(`Received upload request for property_id: ${property_id}, filename: "${filename}", uploaded_by_username: "${uploaded_by_username}"`);
    // DO NOT LOG file_data_base64 or raw password in production! For debugging only.
    // console.log(`Received file_data_base64 (first 50 chars): ${file_data_base64.substring(0, 50)}...`);
    // console.log(`Received raw password (for debugging): "${password}"`);


    // Validate incoming data
    if (!property_id || !filename || !file_data_base64 || !uploaded_by_username || !username || !password) {
      console.error("Missing required fields in upload request.");
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required fields: property_id, filename, file_data_base64, uploaded_by_username, username, or password." })
      };
    }

    // 1. Authenticate the user trying to upload
    const hashedPassword = hashPassword(password);
    const authQuery = 'SELECT id, password_hash FROM users WHERE username = $1';
    const authResult = await client.query(authQuery, [username]);

    if (authResult.rows.length === 0 || authResult.rows[0].password_hash !== hashedPassword) {
      console.warn("Authentication failed for upload. Invalid username or password.");
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Authentication failed. Invalid username or password." })
      };
    }
    console.log("User authenticated for upload.");

    // Determine the resource type for Cloudinary based on common extensions, default to 'auto'
    let resource_type = 'auto'; // Cloudinary will try to infer
    const fileExtension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      resource_type = 'image';
    } else if (['mp4', 'mov', 'avi'].includes(fileExtension)) {
      resource_type = 'video';
    } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(fileExtension)) {
      resource_type = 'raw'; // Documents are generally 'raw' type in Cloudinary
    }
    console.log(`Determined Cloudinary resource_type: ${resource_type} for extension: ${fileExtension}`);

    let uploadResult;
    try {
        // Upload to Cloudinary
        uploadResult = await cloudinary.uploader.upload(`data:;base64,${file_data_base64}`, {
          resource_type: resource_type,
          folder: `property_files/${property_id}`, // Organize uploads by property ID
          public_id: filename.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_.]/g, ''), // Sanitize filename for public ID
          overwrite: false, // Don't overwrite if file with same public_id exists
          invalidate: true // Invalidate CDN cache for old version if overwrite was true
        });
        console.log("File uploaded to Cloudinary successfully. Result:", JSON.stringify(uploadResult));

    } catch (cloudinaryError) {
        console.error("Cloudinary upload failed:", cloudinaryError);
        const cloudinaryErrorMessage = cloudinaryError.error && cloudinaryError.error.message ? cloudinaryError.error.message : cloudinaryError.message;
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Failed to upload file to Cloudinary", details: cloudinaryErrorMessage })
        };
    }

    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id; // Store Cloudinary's public ID for deletion
    console.log(`Cloudinary URL: ${fileUrl}, Public ID: ${publicId}`);

    // Save file metadata to Neon DB
    const queryText = `
      INSERT INTO property_files(property_id, filename, file_url, uploaded_by_username, cloudinary_public_id, uploaded_at)
      VALUES($1, $2, $3, $4, $5, NOW())
      RETURNING id, filename, file_url, uploaded_by_username, uploaded_at, cloudinary_public_id;
    `;
    console.log(`Attempting to insert into DB with property_id: ${property_id}, filename: "${filename}", file_url: "${fileUrl}", uploaded_by_username: "${uploaded_by_username}", cloudinary_public_id: "${publicId}"`);

    const result = await client.query(queryText, [property_id, filename, fileUrl, uploaded_by_username, publicId]);
    const newFile = result.rows[0];
    console.log("File metadata saved to DB successfully. New record:", JSON.stringify(newFile));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ message: "File uploaded and saved successfully!", file: newFile })
    };

  } catch (error) {
    console.error("Error in uploadFile function:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error during file upload process", details: error.message })
    };
  } finally {
    if (client) {
      console.log("Closing database connection.");
      await client.end();
    }
  }
};
