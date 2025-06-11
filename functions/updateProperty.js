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
    // Destructure all updatable fields, including 'id' for the specific property
    const { id, title, image, description, categories, is_foreign } = JSON.parse(event.body);

    if (!id || !title || !image || !description || !categories) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Property ID, title, image, description, and categories are required for update." })
      };
    }

    const queryText = `
      UPDATE properties
      SET
        title = $1,
        image = $2,
        description = $3,
        categories = $4,
        is_foreign = $5
      WHERE id = $6
      RETURNING id, title, image, description, categories, is_foreign, created_at;
    `;
    const result = await client.query(queryText, [
        title,
        image,
        description,
        JSON.stringify(categories), // categories is JSONB
        is_foreign,
        id
    ]);

    if (result.rows.length === 0) {
        return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Property not found." })
        };
    }

    const updatedProperty = result.rows[0];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Property updated successfully!", updatedProperty: updatedProperty })
    };
  } catch (error) {
    console.error("Error updating property in Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to update property", details: error.message })
    };
  } finally {
    await client.end();
  }
};
