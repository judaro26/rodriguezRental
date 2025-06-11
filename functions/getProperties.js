const { Client } = require('pg'); // Import the PostgreSQL client

exports.handler = async function(event, context) {
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
    // Fetch all properties from a table named 'properties'
    const result = await client.query('SELECT id, title, image, description FROM properties ORDER BY created_at DESC');
    const properties = result.rows;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS for your frontend
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
    await client.end(); // Close the database connection
  }
};
