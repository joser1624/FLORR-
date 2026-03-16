/**
 * Test bcrypt hashing
 */

const bcrypt = require('bcryptjs');

async function testBcrypt() {
  const password = 'password123';
  
  // Generate hash
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test comparison
  const isValid = await bcrypt.compare(password, hash);
  console.log('Comparison result:', isValid);
  
  // Test with seed data hash
  const seedHash = '$2a$10$rZ5YvqZ5YvqZ5YvqZ5YvqOeKKx8xKx8xKx8xKx8xKx8xKx8xKx8xK';
  const isValidSeed = await bcrypt.compare(password, seedHash);
  console.log('Seed hash comparison:', isValidSeed);
}

testBcrypt();
