// src/netlify/functions/get-appointments.js

// Import the neon client
import { neon } from '@netlify/neon';

// Initialize the neon client. Explicitly use process.env.DATABASE_URL.
// This ensures it connects to your Neon database, not a potentially
// auto-created NETLIFY_DATABASE_URL.
const sql = neon(process.env.DATABASE_URL); // <--- KEY CHANGE HERE!

exports.handler = async (event, context) => {
  try {
    // Query to select all appointments
    const appointments = await sql`SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC;`;

    // Log the number of appointments found for debugging
    console.log(`Found ${appointments.length} appointments.`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allows access from anywhere, adjust if needed for a specific internal tool
      },
      body: JSON.stringify(appointments),
    };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to fetch appointments.', details: error.message }),
    };
  }
};