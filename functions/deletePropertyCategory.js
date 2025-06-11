const { Client } = require('pg');
const crypto = require('crypto'); // Node.js built-in module for hashing

// Helper to hash passwords (must match loginUser.js)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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
    const { username, password, property_id, category_to_delete } = JSON.parse(event.body);

    if (!username || !password || !property_id || !category_to_delete) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Username, password, property_id, and category_to_delete are required." })
      };
    }

    // 1. Authenticate the user
    const hashedPassword = hashPassword(password);
    const authQuery = 'SELECT id, password_hash FROM users WHERE username = $1';
    const authResult = await client.query(authQuery, [username]);

    if (authResult.rows.length === 0 || authResult.rows[0].password_hash !== hashedPassword) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Authentication failed. Invalid username or password." })
      };
    }

    // 2. Fetch the current property's categories
    const getPropertyQuery = 'SELECT categories FROM properties WHERE id = $1';
    const propertyResult = await client.query(getPropertyQuery, [property_id]);

    if (propertyResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Property not found." })
      };
    }

    let currentCategories = propertyResult.rows[0].categories || [];
    if (!Array.isArray(currentCategories)) {
      currentCategories = [];
    }

    // 3. Filter out the category to delete
    const initialCategoryCount = currentCategories.length;
    const updatedCategories = currentCategories.filter(cat => cat.toLowerCase() !== category_to_delete.toLowerCase());

    if (updatedCategories.length === initialCategoryCount) {
      return {
        statusCode: 404, // Not found
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Category not found for this property, or already deleted." })
      };
    }

    // 4. Update the property in the database
    const updatePropertyQuery = `
      UPDATE properties
      SET categories = $1
      WHERE id = $2
      RETURNING id, categories;
    `;
    const updateResult = await client.query(updatePropertyQuery, [JSON.stringify(updatedCategories), property_id]);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Category deleted successfully!", updatedProperty: updateResult.rows[0] })
    };

  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error during category deletion", details: error.message })
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
