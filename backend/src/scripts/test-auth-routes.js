/**
 * Test script for authentication routes
 * Tests login validation, successful login, /me endpoint, and logout
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAuthRoutes() {
  log('\n=== Testing Authentication Routes ===\n', 'blue');

  let token = null;

  // Test 1: Login with missing email
  try {
    log('Test 1: Login with missing email...', 'yellow');
    await axios.post(`${BASE_URL}/auth/login`, {
      password: 'password123',
    });
    log('❌ FAILED: Should have returned validation error', 'red');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error) {
      log('✅ PASSED: Validation error returned correctly', 'green');
      log(`   Message: ${error.response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Unexpected error', 'red');
      console.log(error.response?.data || error.message);
    }
  }

  // Test 2: Login with missing password
  try {
    log('\nTest 2: Login with missing password...', 'yellow');
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@floreria.com',
    });
    log('❌ FAILED: Should have returned validation error', 'red');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error) {
      log('✅ PASSED: Validation error returned correctly', 'green');
      log(`   Message: ${error.response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Unexpected error', 'red');
      console.log(error.response?.data || error.message);
    }
  }

  // Test 3: Login with invalid email format
  try {
    log('\nTest 3: Login with invalid email format...', 'yellow');
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'not-an-email',
      password: 'password123',
    });
    log('❌ FAILED: Should have returned validation error', 'red');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error) {
      log('✅ PASSED: Validation error returned correctly', 'green');
      log(`   Message: ${error.response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Unexpected error', 'red');
      console.log(error.response?.data || error.message);
    }
  }

  // Test 4: Login with short password
  try {
    log('\nTest 4: Login with password too short...', 'yellow');
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@floreria.com',
      password: '12345',
    });
    log('❌ FAILED: Should have returned validation error', 'red');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error) {
      log('✅ PASSED: Validation error returned correctly', 'green');
      log(`   Message: ${error.response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Unexpected error', 'red');
      console.log(error.response?.data || error.message);
    }
  }

  // Test 5: Login with invalid credentials
  try {
    log('\nTest 5: Login with invalid credentials...', 'yellow');
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'wrong@email.com',
      password: 'wrongpassword',
    });
    log('❌ FAILED: Should have returned 401 error', 'red');
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.error) {
      log('✅ PASSED: 401 error returned correctly', 'green');
      log(`   Message: ${error.response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Unexpected error', 'red');
      console.log(error.response?.data || error.message);
    }
  }

  // Test 6: Successful login with valid credentials
  try {
    log('\nTest 6: Successful login with valid credentials...', 'yellow');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'maria@floreria.com',
      password: 'password123',
    });

    if (
      response.status === 200 &&
      response.data.success === true &&
      response.data.token &&
      response.data.user
    ) {
      token = response.data.token;
      log('✅ PASSED: Login successful', 'green');
      log(`   Token: ${token.substring(0, 20)}...`, 'reset');
      log(`   User: ${response.data.user.nombre} (${response.data.user.rol})`, 'reset');
    } else {
      log('❌ FAILED: Response format incorrect', 'red');
      console.log(response.data);
    }
  } catch (error) {
    log('❌ FAILED: Login failed', 'red');
    console.log(error.response?.data || error.message);
    return;
  }

  // Test 7: Get current user info (/me endpoint)
  try {
    log('\nTest 7: Get current user info (/me endpoint)...', 'yellow');
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (
      response.status === 200 &&
      response.data.success === true &&
      response.data.user
    ) {
      log('✅ PASSED: /me endpoint works correctly', 'green');
      log(`   User: ${response.data.user.nombre}`, 'reset');
      log(`   Email: ${response.data.user.email}`, 'reset');
      log(`   Role: ${response.data.user.rol}`, 'reset');
    } else {
      log('❌ FAILED: Response format incorrect', 'red');
      console.log(response.data);
    }
  } catch (error) {
    log('❌ FAILED: /me endpoint failed', 'red');
    console.log(error.response?.data || error.message);
  }

  // Test 8: Access /me without token
  try {
    log('\nTest 8: Access /me without token...', 'yellow');
    await axios.get(`${BASE_URL}/auth/me`);
    log('❌ FAILED: Should have returned 401 error', 'red');
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.error) {
      log('✅ PASSED: 401 error returned correctly', 'green');
      log(`   Message: ${error.response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Unexpected error', 'red');
      console.log(error.response?.data || error.message);
    }
  }

  // Test 9: Logout
  try {
    log('\nTest 9: Logout...', 'yellow');
    const response = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (
      response.status === 200 &&
      response.data.success === true &&
      response.data.mensaje
    ) {
      log('✅ PASSED: Logout successful', 'green');
      log(`   Message: ${response.data.mensaje}`, 'reset');
    } else {
      log('❌ FAILED: Response format incorrect', 'red');
      console.log(response.data);
    }
  } catch (error) {
    log('❌ FAILED: Logout failed', 'red');
    console.log(error.response?.data || error.message);
  }

  log('\n=== Authentication Routes Tests Complete ===\n', 'blue');
}

// Check if axios is available
try {
  require.resolve('axios');
} catch (e) {
  console.error('Error: axios is not installed. Please run: npm install axios');
  process.exit(1);
}

// Run tests
testAuthRoutes().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
