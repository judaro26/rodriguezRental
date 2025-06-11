const { Client } = require('pg');
const crypto = require('crypto'); // Node.js built-in module for hashing

// Helper to hash passwords (for demo; use bcrypt in production!)
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
    console.error("DATABASE_URL environment variable is not set.");
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
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Username and password are required." })
      };
    }

    const hashedPassword = hashPassword(password); // Hash the provided password

    const queryText = 'SELECT id, username, password_hash FROM users WHERE username = $1';
    const result = await client.query(queryText, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.password_hash === hashedPassword) { // Compare hashed passwords
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Login successful!", username: user.username })
        };
      } else {
        return {
          statusCode: 401,
          headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Invalid username or password." })
        };
      }
    } else {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Invalid username or password." })
      };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error during login", details: error.message })
    };
  } finally {
    await client.end();
  }
};
