const { Client } = require('pg');
const crypto = require('crypto'); // Node.js built-in module for hashing

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

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is NOT set.");
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Database connection string missing." })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const { username, password, detail_id_to_delete } = JSON.parse(event.body);

    if (!username || !password || !detail_id_to_delete) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Username, password, and detail_id_to_delete are required." })
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

    // 2. Delete the category detail
    const deleteDetailQuery = `
      DELETE FROM property_category_details
      WHERE id = $1
      RETURNING id;
    `;
    const deleteResult = await client.query(deleteDetailQuery, [detail_id_to_delete]);

    if (deleteResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" , "Content-Type": "application/json"},
        body: JSON.stringify({ message: "Category detail not found or already deleted." })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Category detail deleted successfully!", deletedId: deleteResult.rows[0].id })
    };

  } catch (error) {
    console.error("Error deleting category detail:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error during category detail deletion", details: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
