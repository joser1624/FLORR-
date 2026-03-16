/**
 * Generate bcrypt hashes for seed data
 */

const bcrypt = require('bcryptjs');

async function generateHashes() {
  const password = 'password123';
  
  console.log('Generating 5 hashes for password:', password);
  console.log('');
  
  for (let i = 0; i < 5; i++) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Hash ${i + 1}: ${hash}`);
  }
}

generateHashes();
