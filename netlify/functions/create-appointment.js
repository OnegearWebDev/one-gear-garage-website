// netlify/functions/create-appointment.js

const { Client } = require('pg');

exports.handler = async (event) => {
  // Ensure it's a POST request and has a body
  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ message: 'Method Not Allowed or missing body' }),
    };
  }

  // Parse the JSON data sent from your form
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  // Extract data fields (ensure these match your form's input names!)
  // IMPORTANT: Adjust these variable names to exactly match the 'name' attributes
  // of your input fields in your HTML scheduling form.
  const { customer_name, customer_email, service_type, appointment_date, appointment_time, notes } = data;

  // Basic validation (you'll want more robust validation later)
  if (!customer_name || !customer_email || !service_type || !appointment_date || !appointment_time) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  // Get the database URL from environment variables
  const dbUrl = process.env.DATABASE_URL;

  // CRITICAL CHECK: Log the actual value of the environment variable
  // Only log partial URL for security, if you want full, remove substring
  console.log('Function DB URL Check: Length', dbUrl ? dbUrl.length : 'undefined/null');
  console.log('Function DB URL Check: Starts with', dbUrl ? dbUrl.substring(0, 10) + '...' : 'undefined/null');


  if (!dbUrl) {
      console.error('CRITICAL ERROR: DATABASE_URL environment variable is NOT set in Netlify function runtime!');
      return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Server configuration error: Database URL missing. Please check Netlify environment variables.' }),
      };
  }

  // Initialize the PostgreSQL client using the environment variable for security
  const client = new Client({
    connectionString: dbUrl, // Now correctly uses the 'DATABASE_URL' variable
    ssl: {
      rejectUnauthorized: false // Often required for connecting to Neon from Netlify Functions
    }
  });

  try {
    await client.connect();

    // SQL INSERT query to add the new appointment to your 'appointments' table
    // Ensure column names here match your 'CREATE TABLE' statement in Neon
    // Removed JavaScript comments that were causing SQL syntax error
    const query = `
      INSERT INTO appointments (customer_name, customer_email, service_type, appointment_date, appointment_time, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const values = [customer_name, customer_email, service_type, appointment_date, appointment_time, notes];

    const result = await client.query(query, values);

    console.log('Appointment saved:', result.rows[0]); // Log the new appointment ID

    return {
      statusCode: 200,
      headers: {
        // This is crucial for CORS; allows your website to send requests to this function.
        // For production, consider replacing "*" with your specific domain: "https://onegeargarage.xyz"
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: 'Appointment booked successfully!', appointmentId: result.rows[0].id }),
    };

  } catch (error) {
    console.error('Database error:', error);
    // Include more details in the error response for debugging
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Same CORS headers for error responses
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        error: 'Failed to book appointment due to a server error.',
        details: error.message,
        // Optionally, include the partial DB URL (first few chars) for extreme debugging, but be cautious with sensitive info
        // debug_db_url_prefix: dbUrl ? dbUrl.substring(0, 20) + '...' : 'undefined'
      }),
    };
  } finally {
    await client.end(); // Always close the database connection
  }
};