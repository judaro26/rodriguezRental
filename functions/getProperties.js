const { Client } = require('pg');

exports.handler = async function(event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Allow": "GET", "Access-Control-Allow-Origin": "*" },
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
    // Fetch all properties, including the new 'is_foreign' column
    const result = await client.query('SELECT id, title, image, description, categories, is_foreign FROM properties ORDER BY created_at DESC');
    const properties = result.rows;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(properties)
    };
  } catch (error) {
    console.error("Error fetching properties from Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to fetch properties", details: error.message })
    };
  } finally {
    await client.end();
  }
};
