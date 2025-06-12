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
    const { property_id } = event.queryStringParameters;

    if (!property_id) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "property_id is required." })
      };
    }

    const queryText = `
      SELECT id, property_id, filename, file_url, uploaded_by_username, uploaded_at, cloudinary_public_id
      FROM property_files
      WHERE property_id = $1
      ORDER BY uploaded_at DESC;
    `;
    const result = await client.query(queryText, [property_id]);
    const files = result.rows;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(files)
    };
  } catch (error) {
    console.error("Error fetching files from Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to fetch files", details: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
