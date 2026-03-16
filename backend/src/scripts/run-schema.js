/**
 * Script to run database schema
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runSchema() {
  try {
    console.log('📦 Running database schema...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database schema created successfully');
    
    // Read seed file
    const seedPath = path.join(__dirname, '../../../database/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Seeding database...');
    await pool.query(seed);
    
    console.log('✅ Database seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running schema:', error);
    process.exit(1);
  }
}

runSchema();
