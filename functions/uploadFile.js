const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');
const crypto = require('crypto');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Allow": "POST", "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed"
    };
  }

  // Check for essential environment variables
  if (!process.env.DATABASE_URL || !process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
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

    const { property_id, filename, file_data_base64, uploaded_by_username, username, password } = JSON.parse(event.body);

    // Validate incoming data
    if (!property_id || !filename || !file_data_base64 || !uploaded_by_username || !username || !password) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required fields." })
      };
    }

    // Authenticate the user
    const hashedPassword = hashPassword(password);
    const authQuery = 'SELECT id, password_hash FROM users WHERE username = $1';
    const authResult = await client.query(authQuery, [username]);

    if (authResult.rows.length === 0 || authResult.rows[0].password_hash !== hashedPassword) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Authentication failed." })
      };
    }

    // Determine resource type based on file extension
    const fileExtension = filename.split('.').pop().toLowerCase();
    let resource_type = 'auto';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'];
    
    if (imageExtensions.includes(fileExtension)) {
      resource_type = 'image';
    } else if (videoExtensions.includes(fileExtension)) {
      resource_type = 'video';
    } else {
      resource_type = 'raw'; // For all other file types
    }

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(
        `data:application/octet-stream;base64,${file_data_base64}`, {
          resource_type: resource_type,
          folder: `property_files/${property_id}`,
          public_id: filename.replace(/\.[^/.]+$/, ""), // Remove extension
          overwrite: false,
          invalidate: true,
          filename_override: filename,
          use_filename: true,
          unique_filename: false
        }
      );
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError);
      let errorMessage = cloudinaryError.message;
      
      // Handle specific Cloudinary errors
      if (errorMessage.includes('Raw file upload is not allowed')) {
        errorMessage = "Your Cloudinary plan doesn't support raw file uploads (PDF, DOC, etc.). Please upgrade your plan or try an image/video file.";
      }
      
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "Failed to upload file to Cloudinary",
          details: errorMessage,
          suggestion: resource_type === 'raw' ? "Try uploading an image or video file instead." : ""
        })
      };
    }

    // Save file metadata to database
    const queryText = `
      INSERT INTO property_files(
        property_id, 
        filename, 
        file_url, 
        uploaded_by_username, 
        cloudinary_public_id, 
        file_size,
        file_type,
        uploaded_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, filename, file_url, uploaded_by_username, uploaded_at, cloudinary_public_id;
    `;

    const result = await client.query(queryText, [
      property_id,
      filename,
      uploadResult.secure_url,
      uploaded_by_username,
      uploadResult.public_id,
      uploadResult.bytes,
      uploadResult.format || fileExtension
    ]);

    const newFile = result.rows[0];

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: "File uploaded successfully!",
        file: newFile,
        cloudinaryData: {
          resource_type: uploadResult.resource_type,
          format: uploadResult.format,
          bytes: uploadResult.bytes
        }
      })
    };

  } catch (error) {
    console.error("Error in uploadFile function:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: "Server error during file upload",
        details: error.message 
      })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
