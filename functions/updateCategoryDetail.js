const { Client } = require('pg');
const crypto = require('crypto'); // Node.js built-in module for hashing

// Helper to hash passwords (must match loginUser.js and deleteFile.js)
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
    // Destructure all updatable fields, now including username and password for authentication
    const { id, detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password, username, password } = JSON.parse(event.body);

    if (!id || !detail_name || !detail_url || !username || !password) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Property ID, detail name, URL, username, and password are required for update." })
      };
    }

    // 1. Authenticate the user trying to perform the update
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

    // 2. Perform the update if authentication is successful
    const queryText = `
      UPDATE property_category_details
      SET
        detail_name = $1,
        detail_url = $2,
        detail_description = $3,
        detail_logo_url = $4,
        detail_username = $5,
        detail_password = $6,
        created_at = NOW()       -- Update timestamp to reflect modification
      WHERE id = $7
      RETURNING id, detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password, created_at;
    `;
    const result = await client.query(queryText, [
        detail_name,
        detail_url,
        detail_description || null,
        detail_logo_url || null,
        detail_username || null,
        detail_password || null,
        id
    ]);

    if (result.rows.length === 0) {
        return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Category detail not found." })
        };
    }

    const updatedDetail = result.rows[0];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Category detail updated successfully!", updatedDetail: updatedDetail })
    };
  } catch (error) {
    console.error("Error updating category detail in Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to update category detail", details: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
