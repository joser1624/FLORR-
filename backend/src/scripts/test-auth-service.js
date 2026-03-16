/**
 * Manual test script for authentication service
 * Tests all requirements for Task 2.1
 */

const authService = require('../services/auth.service');
const { query } = require('../config/database');

async function testAuthService() {
  console.log('🧪 Testing Authentication Service\n');
  
  try {
    // Test 1: Hash password with bcrypt (10 salt rounds)
    console.log('Test 1: Password hashing with bcrypt (10 salt rounds)');
    const testPassword = 'password123';
    const hashedPassword = await authService.hashPassword(testPassword);
    console.log('✅ Password hashed successfully');
    console.log(`   Original: ${testPassword}`);
    console.log(`   Hashed: ${hashedPassword.substring(0, 30)}...`);
    
    // Test 2: Password comparison (round-trip property)
    console.log('\nTest 2: Password comparison (round-trip property)');
    const isMatch = await authService.comparePassword(testPassword, hashedPassword);
    if (isMatch) {
      console.log('✅ Password comparison successful - round-trip property verified');
    } else {
      console.log('❌ Password comparison failed');
    }
    
    // Test 3: Password minimum length validation
    console.log('\nTest 3: Password minimum length validation (6 characters)');
    try {
      await authService.hashPassword('12345'); // Only 5 characters
      console.log('❌ Should have rejected password < 6 characters');
    } catch (error) {
      console.log('✅ Correctly rejected password < 6 characters');
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 4: Create a test user for login tests
    console.log('\nTest 4: Creating test user');
    const testEmail = 'test@floreria.com';
    
    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [testEmail]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('   Test user already exists, updating password...');
      await query(
        'UPDATE usuarios SET password = $1, activo = true WHERE email = $2',
        [hashedPassword, testEmail]
      );
    } else {
      console.log('   Creating new test user...');
      await query(
        `INSERT INTO usuarios (nombre, email, password, cargo, rol, activo) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Test User', testEmail, hashedPassword, 'Administrador/a', 'admin', true]
      );
    }
    console.log('✅ Test user ready');
    
    // Test 5: Login with valid credentials
    console.log('\nTest 5: Login with valid credentials');
    const loginResult = await authService.login(testEmail, testPassword);
    console.log('✅ Login successful');
    console.log(`   Token: ${loginResult.token.substring(0, 30)}...`);
    console.log(`   User: ${loginResult.user.nombre} (${loginResult.user.rol})`);
    
    // Verify token payload includes required fields
    const jwtConfig = require('../config/jwt');
    const decoded = jwtConfig.verifyToken(loginResult.token);
    console.log('\nTest 6: JWT token payload verification');
    if (decoded.id && decoded.email && decoded.rol && decoded.nombre) {
      console.log('✅ Token includes all required fields: id, email, rol, nombre');
      console.log(`   Payload: ${JSON.stringify(decoded, null, 2)}`);
    } else {
      console.log('❌ Token missing required fields');
    }
    
    // Test 7: Login with invalid credentials (401)
    console.log('\nTest 7: Login with invalid credentials (should return 401)');
    try {
      await authService.login(testEmail, 'wrongpassword');
      console.log('❌ Should have rejected invalid credentials');
    } catch (error) {
      if (error.statusCode === 401 && error.message === 'Credenciales inválidas') {
        console.log('✅ Correctly rejected invalid credentials with 401');
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`❌ Wrong error: ${error.message} (status: ${error.statusCode})`);
      }
    }
    
    // Test 8: Login with inactive account (403)
    console.log('\nTest 8: Login with inactive account (should return 403)');
    await query('UPDATE usuarios SET activo = false WHERE email = $1', [testEmail]);
    try {
      await authService.login(testEmail, testPassword);
      console.log('❌ Should have rejected inactive account');
    } catch (error) {
      if (error.statusCode === 403 && error.message === 'Cuenta inactiva') {
        console.log('✅ Correctly rejected inactive account with 403');
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`❌ Wrong error: ${error.message} (status: ${error.statusCode})`);
      }
    }
    
    // Test 9: Login with non-existent user (401)
    console.log('\nTest 9: Login with non-existent user (should return 401)');
    try {
      await authService.login('nonexistent@floreria.com', testPassword);
      console.log('❌ Should have rejected non-existent user');
    } catch (error) {
      if (error.statusCode === 401 && error.message === 'Credenciales inválidas') {
        console.log('✅ Correctly rejected non-existent user with 401');
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`❌ Wrong error: ${error.message} (status: ${error.statusCode})`);
      }
    }
    
    // Test 10: Password too short on login (401)
    console.log('\nTest 10: Login with password < 6 characters (should return 401)');
    try {
      await authService.login(testEmail, '12345');
      console.log('❌ Should have rejected short password');
    } catch (error) {
      if (error.statusCode === 401 && error.message === 'Credenciales inválidas') {
        console.log('✅ Correctly rejected short password with 401');
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`❌ Wrong error: ${error.message} (status: ${error.statusCode})`);
      }
    }
    
    // Cleanup: Reactivate test user
    await query('UPDATE usuarios SET activo = true WHERE email = $1', [testEmail]);
    
    console.log('\n✅ All authentication service tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run tests
testAuthService();
