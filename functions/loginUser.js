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
            headers: { "Allow": "POST" },
            body: "Method Not Allowed"
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
                body: JSON.stringify({ message: "Username and password required" })
            };
        }

        const result = await client.query(
            'SELECT id, username, password_hash, confirmed FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            
            if (bcrypt.compareSync(password, user.password_hash) {
                const token = jwt.sign(
                    {
                        userId: user.id,
                        username: user.username
                    },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                );

                return {
                    statusCode: 200,
                    body: JSON.stringify({ 
                        token,
                        message: "Login successful" 
                    })
                };
            }
        }

        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid credentials" })
        };

    } catch (error) {
        console.error("Login error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server error" })
        };
    } finally {
        await client.end();
    }
};
