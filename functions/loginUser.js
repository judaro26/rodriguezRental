const { Client } = require('pg');
const crypto = require('crypto'); // Node.js built-in module for hashing

// Helper to hash passwords (for demo; use bcrypt in production!)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.handler = async function(event, context) {
  console.log("loginUser function invoked."); // Log start of function

  if (event.httpMethod !== "POST") {
    console.log(`Received non-POST method: ${event.httpMethod}`);
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
  console.log("DATABASE_URL environment variable is set."); // Confirm env var is present

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon connections on Netlify
  });

  try {
    console.log("Attempting to connect to database...");
    await client.connect(); // Connect to the database
    console.log("Successfully connected to database.");

    const { username, password } = JSON.parse(event.body);
    console.log(`Received login attempt for username: "${username}"`);
    // DO NOT LOG RAW PASSWORD IN PRODUCTION! For debugging only.
    console.log(`Received raw password (for debugging): "${password}"`);

    if (!username || !password) {
      console.log("Missing username or password in request body.");
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Username and password are required." })
      };
    }

    const hashedPassword = hashPassword(password); // Hash the provided password
    console.log(`Hashed password (client input): "${hashedPassword}"`);

    // Modified query to also select the 'confirmed' and 'domestic_approved' status
    const queryText = 'SELECT id, username, password_hash, confirmed, foreign_approved, domestic_approved FROM users WHERE username = $1';
    console.log(`Executing query: "${queryText}" with username: "${username}"`);
    const result = await client.query(queryText, [username]);
    console.log(`Query result rows: ${JSON.stringify(result.rows)}`);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`User found: ${JSON.stringify(user)}`);
      console.log(`Stored password hash from DB: "${user.password_hash}"`);
      console.log(`User confirmed status from DB: "${user.confirmed}"`);
      console.log(`User foreign_approved status from DB: "${user.foreign_approved}"`);
      console.log(`User domestic_approved status from DB: "${user.domestic_approved}"`); // Log new domestic_approved status

      if (user.password_hash === hashedPassword) { // Compare hashed passwords
        if (user.confirmed === true) { // Check if user is confirmed
          console.log("Password hashes MATCH and user is CONFIRMED. Login successful.");
          return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Login successful!",
                username: user.username,
                foreign_approved: user.foreign_approved,
                domestic_approved: user.domestic_approved // Return domestic_approved status
            })
          };
        } else {
          console.log("User found, password matches, but user is NOT confirmed.");
          return {
            statusCode: 403, // Forbidden
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Account not confirmed. Please contact support." })
          };
        }
      } else {
        console.log("Password hashes DO NOT match. Invalid credentials.");
        return {
          statusCode: 401,
          headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Invalid username or password." })
        };
      }
    } else {
      console.log("No user found with that username.");
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Invalid username or password." })
      };
    }
  } catch (error) {
    console.error("Caught an error during login process:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error during login", details: error.message })
    };
  } finally {
    if (client) {
      console.log("Closing database connection.");
      await client.end(); // Close the database connection
    }
  }
};
