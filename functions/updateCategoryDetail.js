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
    // Destructure all updatable fields, including 'id' for the specific detail
    const { id, detail_name, detail_url, detail_description, detail_logo_url } = JSON.parse(event.body);

    if (!id || !detail_name || !detail_url) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Detail ID, name, and URL are required for update." })
      };
    }

    const queryText = `
      UPDATE property_category_details
      SET
        detail_name = $1,
        detail_url = $2,
        detail_description = $3,
        detail_logo_url = $4,
        created_at = NOW() -- Update timestamp to reflect modification
      WHERE id = $5
      RETURNING id, detail_name, detail_url, detail_description, detail_logo_url, created_at;
    `;
    const result = await client.query(queryText, [
        detail_name,
        detail_url,
        detail_description || null, // Allow null for description
        detail_logo_url || null,    // Allow null for logo URL
        id
    ]);

    if (result.rows.length === 0) {
        return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Category detail not found." })
        };
    }

    const updatedDetail = result.rows[0];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Category detail updated successfully!", updatedDetail: updatedDetail })
    };
  } catch (error) {
    console.error("Error updating category detail in Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to update category detail", details: error.message })
    };
  } finally {
    await client.end();
  }
};
