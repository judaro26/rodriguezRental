// netlify/functions/registerUser.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs'); // <--- Use bcryptjs instead of crypto

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

        // --- IMPORTANT CHANGE: Use bcrypt.hashSync for hashing ---
        // bcrypt is asynchronous by default, but sync version is fine for Netlify functions
        // The '10' is the number of salt rounds, a common and secure value.
        const hashedPassword = bcrypt.hashSync(password, 10); // <--- Hashing with bcrypt

        // Check if user already exists
        const checkUserQuery = 'SELECT id FROM users WHERE username = $1';
        const existingUser = await client.query(checkUserQuery, [username]);
        if (existingUser.rows.length > 0) {
            return {
                statusCode: 409, // Conflict
                headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Username already exists." })
            };
        }

        const insertUserQuery = `
            INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username;
        `;
        const result = await client.query(insertUserQuery, [username, hashedPassword]);
        const newUser = result.rows[0];

        return {
            statusCode: 201, // Created
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Registration successful!", user: { id: newUser.id, username: newUser.username } })
        };
    } catch (error) {
        console.error("Error during registration:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Server error during registration", details: error.message })
        };
    } finally {
        await client.end();
    }
};
