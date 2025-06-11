const { Client } = require('pg');

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
    const { property_id, category_name, detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password } = JSON.parse(event.body);

    if (!property_id || !category_name || !detail_name || !detail_url) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" , "Content-Type": "application/json"},
        body: JSON.stringify({ message: "property_id, category_name, detail_name, and detail_url are required." })
      };
    }

    const queryText = `
      INSERT INTO property_category_details(property_id, category_name, detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password, created_at)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, property_id, category_name, detail_name, detail_url, detail_description, detail_logo_url, detail_username, detail_password, created_at;
    `;
    const result = await client.query(queryText, [
        property_id,
        category_name,
        detail_name,
        detail_url,
        detail_description || null,
        detail_logo_url || null,
        detail_username || null, // Ensure this is passed as a parameter
        detail_password || null   // Ensure this is passed as a parameter
    ]);
    const newDetail = result.rows[0];

    return {
      statusCode: 201, // Created
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newDetail)
    };
  } catch (error) {
    console.error("Error adding category detail to Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to add category detail", details: error.message })
    };
  } finally {
    await client.end();
  }
};
