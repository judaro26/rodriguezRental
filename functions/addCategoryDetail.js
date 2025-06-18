const { Client } = require('pg');

exports.handler = async function(event, context) {
  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 
        'Allow': 'POST', 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Check for database connection string
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ error: 'Database configuration error' })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid JSON format in request body' })
      };
    }

    const { 
      property_id, 
      category_name, 
      detail_name, 
      detail_url,
      detail_description, 
      detail_logo_url, 
      detail_username, 
      detail_password 
    } = requestBody;

    // Validate required fields
    if (!property_id || !category_name || !detail_name || !detail_url) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['property_id', 'category_name', 'detail_name', 'detail_url']
        })
      };
    }

    // Database operation
    const queryText = `
      INSERT INTO property_category_details(
        property_id, 
        category_name, 
        detail_name, 
        detail_url, 
        detail_description, 
        detail_logo_url, 
        detail_username, 
        detail_password, 
        created_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *;
    `;

    const result = await client.query(queryText, [
      property_id,
      category_name,
      detail_name,
      detail_url,
      detail_description || null,
      detail_logo_url || null,
      detail_username || null,
      detail_password || null
    ]);

    const newDetail = result.rows[0];

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDetail)
    };

  } catch (error) {
    console.error('Database operation failed:', error);
    
    let statusCode = 500;
    let errorMessage = 'Failed to add category detail';
    
    if (error.message.includes('duplicate key value violates unique constraint')) {
      statusCode = 409;
      errorMessage = 'This record already exists in the database';
    } else if (error.message.includes('violates foreign key constraint')) {
      statusCode = 400;
      errorMessage = 'Invalid property or category reference';
    }

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  } finally {
    await client.end().catch(console.error);
  }
};
