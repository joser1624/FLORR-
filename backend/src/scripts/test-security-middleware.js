/**
 * Security Middleware Verification Script
 * 
 * This script verifies that the security middleware is properly configured
 * by checking the app.js file for the required security settings.
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Security Middleware Verification\n');

// Read the app.js file
const appPath = path.join(__dirname, '..', 'app.js');
const appContent = fs.readFileSync(appPath, 'utf8');

// Check for helmet configuration
const checks = [
  {
    name: 'Helmet X-Content-Type-Options',
    pattern: /xContentTypeOptions:\s*true/,
    description: 'X-Content-Type-Options header set to nosniff'
  },
  {
    name: 'Helmet X-Frame-Options',
    pattern: /xFrameOptions:\s*\{\s*action:\s*['"]deny['"]\s*\}/,
    description: 'X-Frame-Options header set to DENY'
  },
  {
    name: 'Helmet X-XSS-Protection',
    pattern: /xXssProtection:\s*true/,
    description: 'X-XSS-Protection header enabled'
  },
  {
    name: 'Helmet Strict-Transport-Security',
    pattern: /strictTransportSecurity:\s*\{[\s\S]*?maxAge:\s*31536000/,
    description: 'Strict-Transport-Security header configured'
  },
  {
    name: 'CORS Origin Validation',
    pattern: /allowedOrigins\.includes\(origin\)/,
    description: 'CORS validates allowed origins from environment'
  },
  {
    name: 'CORS Unauthorized Origin Rejection',
    pattern: /callback\(new Error\(['"]Origen no autorizado por política CORS['"]\)/,
    description: 'CORS rejects unauthorized origins with error'
  },
  {
    name: 'CORS Allowed Methods',
    pattern: /methods:\s*\[['"]GET['"],\s*['"]POST['"],\s*['"]PUT['"],\s*['"]DELETE['"],\s*['"]OPTIONS['"]\]/,
    description: 'CORS allows GET, POST, PUT, DELETE, OPTIONS methods'
  },
  {
    name: 'CORS Allowed Headers',
    pattern: /allowedHeaders:\s*\[['"]Content-Type['"],\s*['"]Authorization['"]\]/,
    description: 'CORS allows Content-Type and Authorization headers'
  },
  {
    name: 'CORS Error Handler',
    pattern: /if \(err\.message === ['"]Origen no autorizado por política CORS['"]\)/,
    description: 'CORS error handler returns 403 for unauthorized origins'
  }
];

let allPassed = true;

checks.forEach(check => {
  const passed = check.pattern.test(appContent);
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  console.log(`   ${check.description}`);
  if (!passed) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All security middleware checks passed!');
  process.exit(0);
} else {
  console.log('❌ Some security middleware checks failed!');
  process.exit(1);
}
