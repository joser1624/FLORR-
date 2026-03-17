const jwt = require('jsonwebtoken');
require('dotenv').config();

// Validate JWT_SECRET is set in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production environment');
}

const config = {
  secret: process.env.JWT_SECRET || 'floreria-encantos-eternos-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to include in token (id, email, rol, nombre)
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  const { id, email, rol, nombre } = payload;
  
  return jwt.sign(
    { id, email, rol, nombre },
    config.secret,
    { expiresIn: config.expiresIn }
  );
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token inválido o expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido o expirado');
    }
    throw error;
  }
};

/**
 * Decode a JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  secret: config.secret,
  expiresIn: config.expiresIn,
  generateToken,
  verifyToken,
  decodeToken,
};
