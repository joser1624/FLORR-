const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      mensaje: 'Errores de validación',
      detalles: errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg,
      })),
    });
  }
  
  next();
};

module.exports = validateRequest;
