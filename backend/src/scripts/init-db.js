const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { ensureDatabaseExists } = require('../config/database');

/**
 * Initialize the database
 * This script ensures the database exists before running the application
 */
async function initDatabase() {
  try {
    console.log('🔧 Initializing database...');
    await ensureDatabaseExists();
    console.log('✅ Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
