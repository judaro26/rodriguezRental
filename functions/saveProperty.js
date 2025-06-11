const { Client } = require('pg'); // Import the PostgreSQL client

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Allow": "POST", "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed"
    };
  }

  // Ensure the database connection string is available
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
    ssl: {
      rejectUnauthorized: false // Required for Neon connections on Netlify
    }
  });

  try {
    await client.connect(); // Connect to the database

    const data = JSON.parse(event.body);
    const { title, image, description, categories } = data; // Destructure categories as well

    // Validate incoming data
    if (!title || !image || !description || !categories) { // Ensure categories are also present
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required property fields (title, image, description, categories)." })
      };
    }

    // Insert the new property into the 'properties' table
    const queryText = `
      INSERT INTO properties(title, image, description, categories, created_at)
      VALUES($1, $2, $3, $4, NOW())
      RETURNING id, title, image, description, categories, created_at;
    `;
    const result = await client.query(queryText, [title, image, description, JSON.stringify(categories)]); // Stringify categories for JSONB
    const newProperty = result.rows[0]; // Get the inserted row

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS for your frontend
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newProperty)
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
    await client.end(); // Close the database connection
  }
};
