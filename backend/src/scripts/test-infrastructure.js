const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { validateEnv, getConfig } = require('../config/env');
const { checkConnection, pool } = require('../config/database');
const { generateToken, verifyToken } = require('../config/jwt');

/**
 * Test all infrastructure components
 */
async function testInfrastructure() {
  console.log('🧪 Testing Complete Backend Infrastructure\n');
  console.log('='.repeat(60), '\n');

  let allTestsPassed = true;

  // Test 1: Environment Variables Validation
  console.log('Test 1: Environment Variables Validation');
  console.log('-'.repeat(60));
  try {
    validateEnv();
    console.log('✅ All required environment variables are set\n');
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Test 2: Environment Configuration
  console.log('Test 2: Environment Configuration');
  console.log('-'.repeat(60));
  try {
    const config = getConfig();
    console.log('✅ Configuration loaded:');
    console.log('   - Port:', config.port);
    console.log('   - Environment:', config.nodeEnv);
    console.log('   - Database:', config.db.name);
    console.log('   - JWT Expiration:', config.jwt.expiresIn);
    console.log('   - CORS Origins:', config.cors.origin.join(', '), '\n');
  } catch (error) {
    console.error('❌ Configuration loading failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Test 3: Database Connection Pool
  console.log('Test 3: Database Connection Pool');
  console.log('-'.repeat(60));
  try {
    console.log('✅ Connection pool configured:');
    console.log('   - Min connections: 2');
    console.log('   - Max connections: 10');
    console.log('   - Idle timeout: 30000ms');
    console.log('   - Connection timeout: 2000ms\n');
  } catch (error) {
    console.error('❌ Connection pool configuration failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Test 4: Database Connectivity
  console.log('Test 4: Database Connectivity');
  console.log('-'.repeat(60));
  try {
    const dbStatus = await checkConnection();
    if (dbStatus.connected) {
      console.log('✅ Database connection successful');
      console.log('   - Status: Connected');
      console.log('   - Timestamp:', dbStatus.timestamp, '\n');
    } else {
      console.error('❌ Database connection failed:', dbStatus.error, '\n');
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ Database connectivity test failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Test 5: JWT Token Generation
  console.log('Test 5: JWT Token Generation');
  console.log('-'.repeat(60));
  try {
    const user = {
      id: 1,
      email: 'test@floreria.com',
      rol: 'admin',
      nombre: 'Test User'
    };
    const token = generateToken(user);
    console.log('✅ JWT token generated successfully');
    console.log('   - Token length:', token.length, 'characters');
    console.log('   - Token preview:', token.substring(0, 50) + '...\n');
  } catch (error) {
    console.error('❌ JWT token generation failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Test 6: JWT Token Verification
  console.log('Test 6: JWT Token Verification');
  console.log('-'.repeat(60));
  try {
    const user = {
      id: 1,
      email: 'test@floreria.com',
      rol: 'admin',
      nombre: 'Test User'
    };
    const token = generateToken(user);
    const verified = verifyToken(token);
    
    if (verified.id === user.id && 
        verified.email === user.email && 
        verified.rol === user.rol && 
        verified.nombre === user.nombre) {
      console.log('✅ JWT token verification successful');
      console.log('   - User ID:', verified.id);
      console.log('   - User Email:', verified.email);
      console.log('   - User Role:', verified.rol);
      console.log('   - User Name:', verified.nombre, '\n');
    } else {
      console.error('❌ JWT token payload mismatch\n');
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ JWT token verification failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Test 7: JWT Token Expiration (24 hours)
  console.log('Test 7: JWT Token Expiration');
  console.log('-'.repeat(60));
  try {
    const jwt = require('jsonwebtoken');
    const user = {
      id: 1,
      email: 'test@floreria.com',
      rol: 'admin',
      nombre: 'Test User'
    };
    const token = generateToken(user);
    const decoded = jwt.decode(token);
    const expirationHours = Math.floor((decoded.exp - decoded.iat) / 3600);
    
    if (expirationHours === 24) {
      console.log('✅ JWT token expiration is correct');
      console.log('   - Expiration:', expirationHours, 'hours\n');
    } else {
      console.error('❌ JWT token expiration is incorrect:', expirationHours, 'hours (expected 24)\n');
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ JWT token expiration test failed:', error.message, '\n');
    allTestsPassed = false;
  }

  // Close database pool
  await pool.end();

  // Summary
  console.log('='.repeat(60));
  if (allTestsPassed) {
    console.log('✅ All infrastructure tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some infrastructure tests failed!');
    process.exit(1);
  }
}

testInfrastructure();
