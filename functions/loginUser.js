// netlify/functions/loginUser.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    // Fallback secret ONLY for development - never use in production
    const JWT_SECRET = process.env.JWT_SECRET || 'dummy-secret-1234567890abcdefghijklmnopqrstuv';

    // Security warning if using fallback
    if (!process.env.JWT_SECRET) {
        console.warn("⚠️ WARNING: Using fallback JWT secret - THIS IS INSECURE FOR PRODUCTION");
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Allow": "POST", "Access-Control-Allow-Origin": "*" }, // Re-added CORS header
            body: "Method Not Allowed"
        };
    }

    // Ensure DATABASE_URL is set (good to have this check at the top)
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
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }, // Re-added CORS header
                body: JSON.stringify({ message: "Username and password required" })
            };
        }

        const queryText = 'SELECT id, username, password_hash, confirmed, foreign_approved, domestic_approved FROM users WHERE username = $1'; // Added foreign_approved, domestic_approved back
        const result = await client.query(queryText, [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // --- SYNTAX FIX HERE ---
            if (bcrypt.compareSync(password, user.password_hash)) {
                // Ensure user is confirmed (this logic was missing from your latest snippet)
                if (user.confirmed === true) {
                    const token = jwt.sign(
                        {
                            userId: user.id,
                            username: user.username,
                            foreign_approved: user.foreign_approved, // Include in token payload
                            domestic_approved: user.domestic_approved // Include in token payload
                        },
                        JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    return {
                        statusCode: 200,
                        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }, // Re-added CORS header
                        body: JSON.stringify({
                            token,
                            message: "Login successful",
                            username: user.username, // Include username for convenience on frontend
                            foreign_approved: user.foreign_approved, // Return approval statuses
                            domestic_approved: user.domestic_approved // Return approval statuses
                        })
                    };
                } else {
                    // User not confirmed logic (re-added)
                    return {
                        statusCode: 403,
                        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                        body: JSON.stringify({ message: "Account not confirmed. Please contact support." })
                    };
                }
            } else {
                // Password does not match
                return {
                    statusCode: 401,
                    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                    body: JSON.stringify({ message: "Invalid credentials" })
                };
            }
        } else {
            // No user found
            return {
                statusCode: 401,
                headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Invalid credentials" })
            };
        }

    } catch (error) {
        console.error("Login error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }, // Re-added CORS header
            body: JSON.stringify({ error: "Server error", details: error.message }) // Added details for debugging
        };
    } finally {
        if (client) { // Ensure client exists before trying to end
            await client.end();
        }
    }
};
