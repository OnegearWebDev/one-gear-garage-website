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

  // Initialize the PostgreSQL client using the environment variable for security
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Often required for connecting to Neon from Netlify Functions
    }
  });

  try {
    await client.connect();

    // SQL INSERT query to add the new appointment to your 'appointments' table
    // Ensure column names here match your 'CREATE TABLE' statement in Neon
    const query = `
      INSERT INTO appointments (customer_name, customer_email, service_type, appointment_date, appointment_time, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id; // Returns the ID of the new row
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
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Same CORS headers for error responses
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: 'Failed to book appointment due to a server error.', details: error.message }),
    };
  } finally {
    await client.end(); // Always close the database connection
  }
};