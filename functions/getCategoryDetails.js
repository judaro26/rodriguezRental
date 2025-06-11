const { Client } = require('pg');

exports.handler = async function(event, context) {
  // Only allow GET requests
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

    // Extract property_id and category_name from query parameters
    const { property_id, category_name } = event.queryStringParameters;

    if (!property_id || !category_name) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "property_id and category_name are required." })
      };
    }

    // Fetch all details, now including detail_username and detail_password
    const queryText = `
      SELECT id, detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password
      FROM property_category_details
      WHERE property_id = $1 AND category_name = $2
      ORDER BY created_at ASC;
    `;
    const result = await client.query(queryText, [property_id, category_name]);
    const details = result.rows;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(details)
    };
  } catch (error) {
    console.error("Error fetching category details from Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to fetch category details", details: error.message })
    };
  } finally {
    await client.end();
  }
};
