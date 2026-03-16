const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: true,
      mensaje: 'No se proporcionó token de autenticación',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        mensaje: 'Token expirado',
      });
    }
    return res.status(401).json({
      error: true,
      mensaje: 'Token inválido',
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
