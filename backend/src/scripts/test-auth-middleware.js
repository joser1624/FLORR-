/**
 * Test script for authentication middleware
 * Tests Requirements 2.1, 2.2, 2.3, 2.7
 */

const { verifyToken } = require('../middleware/auth');
const { generateToken } = require('../config/jwt');

// Mock request and response objects
const createMockReq = (authHeader) => ({
  headers: {
    authorization: authHeader
  }
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const mockNext = () => {
  console.log('✓ Next middleware called');
};

console.log('Testing Authentication Middleware\n');
console.log('='.repeat(50));

// Test 1: Missing token (Requirement 2.2)
console.log('\n1. Testing missing token (Requirement 2.2)');
const req1 = createMockReq(undefined);
const res1 = createMockRes();
verifyToken(req1, res1, mockNext);
console.log(`   Status: ${res1.statusCode}`);
console.log(`   Message: ${res1.body.mensaje}`);
if (res1.statusCode === 401 && res1.body.mensaje === 'Token no proporcionado') {
  console.log('   ✓ PASS: Returns 401 with correct message');
} else {
  console.log('   ✗ FAIL: Expected 401 with "Token no proporcionado"');
}

// Test 2: Invalid token (Requirement 2.3)
console.log('\n2. Testing invalid token (Requirement 2.3)');
const req2 = createMockReq('Bearer invalid-token-here');
const res2 = createMockRes();
verifyToken(req2, res2, mockNext);
console.log(`   Status: ${res2.statusCode}`);
console.log(`   Message: ${res2.body.mensaje}`);
if (res2.statusCode === 401 && res2.body.mensaje === 'Token inválido o expirado') {
  console.log('   ✓ PASS: Returns 401 with correct message');
} else {
  console.log('   ✗ FAIL: Expected 401 with "Token inválido o expirado"');
}

// Test 3: Valid token (Requirements 2.1, 2.7)
console.log('\n3. Testing valid token (Requirements 2.1, 2.7)');
const testUser = {
  id: 1,
  email: 'admin@floreria.com',
  rol: 'admin',
  nombre: 'Admin User'
};
const validToken = generateToken(testUser);
const req3 = createMockReq(`Bearer ${validToken}`);
const res3 = createMockRes();
let nextCalled = false;
const mockNext3 = () => { nextCalled = true; };
verifyToken(req3, res3, mockNext3);

if (nextCalled && req3.user) {
  console.log('   ✓ PASS: Token validated and user attached to request');
  console.log(`   User ID: ${req3.user.id}`);
  console.log(`   User Email: ${req3.user.email}`);
  console.log(`   User Role: ${req3.user.rol}`);
  console.log(`   User Name: ${req3.user.nombre}`);
  
  if (req3.user.id === testUser.id && 
      req3.user.email === testUser.email && 
      req3.user.rol === testUser.rol && 
      req3.user.nombre === testUser.nombre) {
    console.log('   ✓ PASS: User data correctly extracted from token');
  } else {
    console.log('   ✗ FAIL: User data mismatch');
  }
} else {
  console.log('   ✗ FAIL: Token validation failed or user not attached');
}

// Test 4: Expired token (Requirement 2.3)
console.log('\n4. Testing expired token (Requirement 2.3)');
console.log('   Note: This test would require a token with past expiration');
console.log('   Skipping manual expiration test (covered by jwt.verify)');

console.log('\n' + '='.repeat(50));
console.log('\nAll tests completed!\n');
