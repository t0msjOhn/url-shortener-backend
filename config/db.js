const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 10, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
});

// Function to test the database connection
const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1'); // Simple test query
    client.release();
    console.log('✅ Successfully connected to the PostgreSQL database');
    return true;
  } catch (err) {
    console.error('❌ Error connecting to the PostgreSQL database:', err.message);
    return false;
  }
};

// Call the test function
testDbConnection();

module.exports = {pool,testDbConnection};
