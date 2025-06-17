// netlify/functions/loginUser.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <--- ADD THIS LINE

exports.handler = async function(event, context) {
    console.log("loginUser function invoked.");

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
    console.log("DATABASE_URL environment variable is set.");

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing");
      return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error" }) };
    }
    
    // Generate token with expiration
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        foreign_approved: user.foreign_approved,
        domestic_approved: user.domestic_approved
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' } // Shorter expiration for security
    );


    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Attempting to connect to database...");
        await client.connect();
        console.log("Successfully connected to database.");

        const { username, password } = JSON.parse(event.body);
        console.log(`Received login attempt for username: "${username}"`);

        if (!username || !password) {
            console.log("Missing username or password in request body.");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Username and password are required." })
            };
        }

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
            console.log(`User domestic_approved status from DB: "${user.domestic_approved}"`);

            if (bcrypt.compareSync(password, user.password_hash)) {
                if (user.confirmed === true) {
                    console.log("Password matches and user is CONFIRMED. Generating JWT...");

                    // --- GENERATE JWT ---
                    // The payload should contain minimal, non-sensitive user information
                    // that you might need to access on the client-side without another DB query.
                    // DO NOT include password_hash or other sensitive data.
                    const tokenPayload = {
                        userId: user.id,
                        username: user.username,
                        foreign_approved: user.foreign_approved,
                        domestic_approved: user.domestic_approved
                    };
                    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
                    console.log("JWT generated successfully.");

                    return {
                        statusCode: 200,
                        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                        body: JSON.stringify({
                            message: "Login successful!",
                            username: user.username,
                            foreign_approved: user.foreign_approved,
                            domestic_approved: user.domestic_approved,
                            token: token // <--- CRITICAL: RETURN THE TOKEN HERE
                        })
                    };
                } else {
                    console.log("User found, password matches, but user is NOT confirmed.");
                    return {
                        statusCode: 403,
                        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                        body: JSON.stringify({ message: "Account not confirmed. Please contact support." })
                    };
                }
            } else {
                console.log("Password comparison FAILED. Invalid credentials.");
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
            await client.end();
        }
    }
};
