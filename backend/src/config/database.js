const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'floreria_system_core',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // In test env, min=0 prevents the pool from opening real connections on import,
  // which avoids Jest "open handles" warnings.
  min: process.env.NODE_ENV === 'test' ? 0 : 2,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Connected to PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Do not call process.exit in test environment — it kills the Jest worker.
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
});

// Helper function to execute queries
// Requirement 19.9: Log all database queries in development mode
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log queries in development mode (not in test)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Database Query:', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params: params,
        duration: `${duration}ms`,
        rows: res.rowCount
      });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
// Returns a client that must be released after use with client.release()
const getClient = async () => {
  return await pool.connect();
};

// Helper function to check database connectivity
const checkConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { connected: false, error: error.message };
  }
};

// Helper function to ensure database exists
const ensureDatabaseExists = async () => {
  const dbName = process.env.DB_NAME || 'floreria_system_core';
  
  // Create a temporary pool connected to the default 'postgres' database
  const tempPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    // Check if the database exists
    const result = await tempPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`📦 Database '${dbName}' does not exist. Creating...`);
      await tempPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring database exists:`, error);
    throw error;
  } finally {
    await tempPool.end();
  }
};

module.exports = {
  pool,
  query,
  getClient,
  checkConnection,
  ensureDatabaseExists,
};
