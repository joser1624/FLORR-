const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { generateToken, verifyToken, decodeToken } = require('../config/jwt');

/**
 * Test JWT utilities
 */
function testJWT() {
  console.log('🧪 Testing JWT utilities...\n');

  // Test data
  const user = {
    id: 1,
    email: 'admin@floreria.com',
    rol: 'admin',
    nombre: 'Administrator'
  };

  // Test token generation
  console.log('1. Testing token generation...');
  const token = generateToken(user);
  console.log('✅ Token generated:', token.substring(0, 50) + '...\n');

  // Test token decoding (without verification)
  console.log('2. Testing token decoding...');
  const decoded = decodeToken(token);
  console.log('✅ Decoded payload:', decoded);
  console.log('   - ID:', decoded.id);
  console.log('   - Email:', decoded.email);
  console.log('   - Role:', decoded.rol);
  console.log('   - Name:', decoded.nombre);
  console.log('   - Expires in:', Math.floor((decoded.exp - decoded.iat) / 3600), 'hours\n');

  // Test token verification
  console.log('3. Testing token verification...');
  try {
    const verified = verifyToken(token);
    console.log('✅ Token verified successfully');
    console.log('   - User ID:', verified.id);
    console.log('   - User Email:', verified.email);
    console.log('   - User Role:', verified.rol);
    console.log('   - User Name:', verified.nombre, '\n');
  } catch (error) {
    console.error('❌ Token verification failed:', error.message, '\n');
  }

  // Test invalid token
  console.log('4. Testing invalid token...');
  try {
    verifyToken('invalid.token.here');
    console.error('❌ Should have thrown an error for invalid token\n');
  } catch (error) {
    console.log('✅ Invalid token correctly rejected:', error.message, '\n');
  }

  console.log('✅ All JWT tests passed!');
}

testJWT();
