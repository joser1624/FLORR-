const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Validate required environment variables
 * @throws {Error} If required environment variables are missing
 */
const validateEnv = () => {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'PORT',
    'CORS_ORIGIN'
  ];

  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.\n');
    
    // Exit with error code 1
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
};

/**
 * Get environment configuration
 * @returns {Object} Environment configuration
 */
const getConfig = () => {
  return {
    // Server
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    db: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    
    // JWT
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    
    // CORS
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5500'],
    },
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
  };
};

module.exports = {
  validateEnv,
  getConfig,
};
