const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to verify JWT token
 * Implements Requirements 2.1, 2.2, 2.3, 2.7
 */
const verifyToken = (req, res, next) => {
  // Extract token from Authorization header (Bearer TOKEN format)
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  // Requirement 2.2: Return 401 if token is missing
  if (!token) {
    return res.status(401).json({
      error: true,
      mensaje: 'Token no proporcionado',
    });
  }

  try {
    // Requirement 2.7: Validate JWT signature using configured secret
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Requirement 2.1: Extract user role and attach to request
    req.user = decoded;
    next();
  } catch (error) {
    // Requirement 2.3: Return 401 for expired or invalid tokens
    return res.status(401).json({
      error: true,
      mensaje: 'Token inválido o expirado',
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        mensaje: 'Usuario no autenticado',
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: true,
        mensaje: 'No tienes permisos para acceder a este recurso',
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
};
