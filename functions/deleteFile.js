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
    const { username, password, file_id_to_delete } = JSON.parse(event.body);

    if (!username || !password || !file_id_to_delete) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Username, password, and file_id_to_delete are required." })
      };
    }

    // 1. Authenticate the user
    const hashedPassword = hashPassword(password);
    const authQuery = 'SELECT id, password_hash FROM users WHERE username = $1';
    const authResult = await client.query(authQuery, [username]);

    if (authResult.rows.length === 0 || authResult.rows[0].password_hash !== hashedPassword) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" , "Content-Type": "application/json"},
        body: JSON.stringify({ message: "Authentication failed. Invalid username or password." })
      };
    }

    // 2. Get file_url and cloudinary_public_id from DB before deleting
    const getFileQuery = 'SELECT file_url, cloudinary_public_id FROM property_files WHERE id = $1';
    const fileResult = await client.query(getFileQuery, [file_id_to_delete]);

    if (fileResult.rows.length === 0) {
        return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "File not found." })
        };
    }

    const fileToDelete = fileResult.rows[0];
    const cloudinaryPublicId = fileToDelete.cloudinary_public_id;

    // 3. Delete file from Cloudinary
    // Cloudinary destroy takes the public ID, not the full URL.
    // resource_type 'raw' for non-image files, 'image' for images, 'video' for video.
    // If you always upload specific types, set resource_type accordingly. 'auto' from upload covers it.
    // Assuming 'auto' detection during upload, 'image' might work for most docs.
    // For broader file types, Cloudinary uses 'raw' resource type. We'll try 'auto' for destroy
    // to match the upload, or you might need to infer from file extension if stored.
    // For simplicity here, assuming it's usually images or generic docs that work with 'raw'.
    // If you need more specific resource type handling, store it in your DB during upload.
    try {
        await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: 'raw' });
        console.log(`Successfully deleted file from Cloudinary: ${cloudinaryPublicId}`);
    } catch (cloudinaryError) {
        // Log Cloudinary deletion error but continue to delete DB record
        console.error(`Failed to delete from Cloudinary: ${cloudinaryPublicId}`, cloudinaryError);
        // If Cloudinary file already gone, or problem with delete. Still remove from our DB.
    }

    // 4. Delete record from Neon DB
    const deleteRecordQuery = `
      DELETE FROM property_files
      WHERE id = $1
      RETURNING id;
    `;
    const deleteRecordResult = await client.query(deleteRecordQuery, [file_id_to_delete]);

    if (deleteRecordResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "File record not found or already deleted in DB." })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "File deleted successfully!", deletedFileId: deleteRecordResult.rows[0].id })
    };

  } catch (error) {
    console.error("Error deleting file or DB record:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error during file deletion", details: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
