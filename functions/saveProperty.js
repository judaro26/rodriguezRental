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
    // Destructure new field: is_foreign
    const { title, image, description, categories, is_foreign } = JSON.parse(event.body);

    if (!title || !image || !description || !categories) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required property fields (title, image, description, categories)." })
      };
    }

    // Insert the new property, including is_foreign
    const queryText = `
      INSERT INTO properties(title, image, description, categories, is_foreign, created_at)
      VALUES($1, $2, $3, $4, $5, NOW())
      RETURNING id, title, image, description, categories, is_foreign, created_at;
    `;
    const result = await client.query(queryText, [
        title,
        image,
        description,
        JSON.stringify(categories), // categories is JSONB
        is_foreign || false // Ensure it defaults to false if not provided
    ]);
    const newProperty = result.rows[0];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Property saved successfully!", newProperty: newProperty })
    };
  } catch (error) {
    console.error("Error saving property to Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to save property", details: error.message })
    };
  } finally {
    await client.end();
  }
};
