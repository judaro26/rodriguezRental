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
    const { property_id, new_category_name, initial_detail_name, initial_detail_url, initial_detail_description } = JSON.parse(event.body);

    if (!property_id || !new_category_name) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "property_id and new_category_name are required." })
      };
    }

    // --- Part 1: Update Property's Categories ---
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
    if (currentCategories.some(cat => cat.toLowerCase() === trimmedNewCategory.toLowerCase())) {
      return {
        statusCode: 409, // Conflict
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Category already exists for this property." })
      };
    }

    currentCategories.push(trimmedNewCategory);

    const updateCategoriesQuery = `
      UPDATE properties
      SET categories = $1
      WHERE id = $2
      RETURNING id, categories;
    `;
    const updateResult = await client.query(updateCategoriesQuery, [JSON.stringify(currentCategories), property_id]);
    const updatedProperty = updateResult.rows[0];

    // --- Part 2: Add Initial Category Detail (if provided) ---
    let newDetailAdded = false;
    let newDetail = null;

    if (initial_detail_name && initial_detail_url) {
        const addDetailQuery = `
            INSERT INTO property_category_details(property_id, category_name, detail_name, detail_url, detail_description, created_at)
            VALUES($1, $2, $3, $4, $5, NOW())
            RETURNING id, detail_name;
        `;
        const detailResult = await client.query(addDetailQuery, [
            property_id,
            trimmedNewCategory, // Associate with the newly added category
            initial_detail_name,
            initial_detail_url,
            initial_detail_description || null // description can be null
        ]);
        newDetail = detailResult.rows[0];
        newDetailAdded = true;
    }


    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
          message: "Category added successfully!" + (newDetailAdded ? " And initial detail added." : ""),
          updatedProperty: updatedProperty,
          newDetail: newDetailAdded ? newDetail : null
      })
    };
  } catch (error) {
    console.error("Error updating property categories or adding initial detail:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to update property categories or add initial detail", details: error.message })
    };
  } finally {
    await client.end();
  }
};
