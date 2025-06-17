// netlify/functions/verifyToken.js
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const token = event.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ valid: false }) };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        user: decoded
      })
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ valid: false }) };
  }
};
