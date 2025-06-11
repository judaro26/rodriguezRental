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
    const { property_id, new_category_name } = JSON.parse(event.body);

    if (!property_id || !new_category_name) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "property_id and new_category_name are required." })
      };
    }

    // 1. Fetch current categories for the property
    const getCategoriesQuery = 'SELECT categories FROM properties WHERE id = $1';
    const result = await client.query(getCategoriesQuery, [property_id]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Property not found." })
      };
    }

    let currentCategories = result.rows[0].categories || [];
    // Ensure categories is an array, in case it's null or other unexpected format
    if (!Array.isArray(currentCategories)) {
        currentCategories = [];
    }

    const trimmedNewCategory = new_category_name.trim();
    if (!trimmedNewCategory) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Category name cannot be empty." })
        };
    }
    // Check for duplicate category (case-insensitive)
    if (currentCategories.some(cat => cat.toLowerCase() === trimmedNewCategory.toLowerCase())) {
      return {
        statusCode: 409, // Conflict
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Category already exists for this property." })
      };
    }

    // 2. Append the new category
    currentCategories.push(trimmedNewCategory);

    // 3. Update categories in the database
    const updateCategoriesQuery = `
      UPDATE properties
      SET categories = $1
      WHERE id = $2
      RETURNING id, categories;
    `;
    const updateResult = await client.query(updateCategoriesQuery, [JSON.stringify(currentCategories), property_id]);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Category added successfully!", updatedProperty: updateResult.rows[0] })
    };
  } catch (error) {
    console.error("Error updating property categories in Neon DB:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to update property categories", details: error.message })
    };
  } finally {
    await client.end();
  }
};
