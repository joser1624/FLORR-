const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 * Returns 400 error with detailed validation messages if validation fails
 * 
 * Validates: Requirements 17.1, 17.2, 17.3
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      mensaje: 'Errores de validación',
      detalles: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Common validation rules for reusable field validations
 */
const validationRules = {
  /**
   * Validate required string field with sanitization
   * Validates: Requirements 17.1, 17.2, 17.4, 17.7
   */
  requiredString: (field, fieldName) => 
    body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isString()
      .withMessage(`${fieldName} debe ser texto`)
      .trim()
      .escape(),

  /**
   * Validate optional string field with sanitization
   * Validates: Requirements 17.2, 17.4, 17.7
   */
  optionalString: (field, fieldName) =>
    body(field)
      .optional()
      .isString()
      .withMessage(`${fieldName} debe ser texto`)
      .trim()
      .escape(),

  /**
   * Validate email format with regex
   * Validates: Requirements 17.5
   */
  email: (field = 'email') =>
    body(field)
      .notEmpty()
      .withMessage('Email es requerido')
      .isEmail()
      .withMessage('Email debe tener formato válido')
      .normalizeEmail()
      .trim(),

  /**
   * Validate numeric field with range constraints
   * Validates: Requirements 17.2, 17.6
   */
  numericRange: (field, fieldName, min = 0, max = null) => {
    let validator = body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isNumeric()
      .withMessage(`${fieldName} debe ser numérico`)
      .isFloat({ min })
      .withMessage(`${fieldName} debe ser mayor o igual a ${min}`);
    
    if (max !== null) {
      validator = validator
        .isFloat({ max })
        .withMessage(`${fieldName} debe ser menor o igual a ${max}`);
    }
    
    return validator;
  },

  /**
   * Validate optional numeric field with range constraints
   * Validates: Requirements 17.2, 17.6
   */
  optionalNumericRange: (field, fieldName, min = 0, max = null) => {
    let validator = body(field)
      .optional()
      .isNumeric()
      .withMessage(`${fieldName} debe ser numérico`)
      .isFloat({ min })
      .withMessage(`${fieldName} debe ser mayor o igual a ${min}`);
    
    if (max !== null) {
      validator = validator
        .isFloat({ max })
        .withMessage(`${fieldName} debe ser menor o igual a ${max}`);
    }
    
    return validator;
  },

  /**
   * Validate integer field with range constraints
   * Validates: Requirements 17.2, 17.6
   */
  integerRange: (field, fieldName, min = 0, max = null) => {
    let validator = body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isInt({ min })
      .withMessage(`${fieldName} debe ser un entero mayor o igual a ${min}`);
    
    if (max !== null) {
      validator = validator
        .isInt({ max })
        .withMessage(`${fieldName} debe ser un entero menor o igual a ${max}`);
    }
    
    return validator;
  },

  /**
   * Validate date in ISO 8601 format
   * Validates: Requirements 17.7
   */
  isoDate: (field, fieldName) =>
    body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isISO8601()
      .withMessage(`${fieldName} debe estar en formato ISO 8601 (YYYY-MM-DD)`),

  /**
   * Validate optional date in ISO 8601 format
   * Validates: Requirements 17.7
   */
  optionalIsoDate: (field, fieldName) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${fieldName} debe estar en formato ISO 8601 (YYYY-MM-DD)`),

  /**
   * Validate enum field (must be one of allowed values)
   * Validates: Requirements 17.1, 17.2
   */
  enum: (field, fieldName, allowedValues) =>
    body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isIn(allowedValues)
      .withMessage(`${fieldName} debe ser uno de: ${allowedValues.join(', ')}`),

  /**
   * Validate optional enum field
   * Validates: Requirements 17.2
   */
  optionalEnum: (field, fieldName, allowedValues) =>
    body(field)
      .optional()
      .isIn(allowedValues)
      .withMessage(`${fieldName} debe ser uno de: ${allowedValues.join(', ')}`),

  /**
   * Validate boolean field
   * Validates: Requirements 17.2
   */
  boolean: (field, fieldName) =>
    body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isBoolean()
      .withMessage(`${fieldName} debe ser verdadero o falso`),

  /**
   * Validate optional boolean field
   * Validates: Requirements 17.2
   */
  optionalBoolean: (field, fieldName) =>
    body(field)
      .optional()
      .isBoolean()
      .withMessage(`${fieldName} debe ser verdadero o falso`),

  /**
   * Validate array field
   * Validates: Requirements 17.1, 17.2
   */
  array: (field, fieldName) =>
    body(field)
      .notEmpty()
      .withMessage(`${fieldName} es requerido`)
      .isArray()
      .withMessage(`${fieldName} debe ser un arreglo`)
      .isArray({ min: 1 })
      .withMessage(`${fieldName} no puede estar vacío`),

  /**
   * Validate phone number (basic format)
   * Validates: Requirements 17.2
   */
  phone: (field = 'telefono') =>
    body(field)
      .notEmpty()
      .withMessage('Teléfono es requerido')
      .isString()
      .withMessage('Teléfono debe ser texto')
      .trim()
      .matches(/^[0-9\s\-\+\(\)]+$/)
      .withMessage('Teléfono debe contener solo números y caracteres válidos'),

  /**
   * Validate optional phone number
   * Validates: Requirements 17.2
   */
  optionalPhone: (field = 'telefono') =>
    body(field)
      .optional()
      .isString()
      .withMessage('Teléfono debe ser texto')
      .trim()
      .matches(/^[0-9\s\-\+\(\)]+$/)
      .withMessage('Teléfono debe contener solo números y caracteres válidos'),

  /**
   * Validate password with minimum length
   * Validates: Requirements 17.1, 17.2
   */
  password: (field = 'password', minLength = 6) =>
    body(field)
      .notEmpty()
      .withMessage('Contraseña es requerida')
      .isLength({ min: minLength })
      .withMessage(`Contraseña debe tener al menos ${minLength} caracteres`),

  /**
   * Validate ID parameter in URL
   * Validates: Requirements 17.2, 17.6
   */
  idParam: (paramName = 'id') =>
    param(paramName)
      .isInt({ min: 1 })
      .withMessage(`${paramName} debe ser un entero positivo`),

  /**
   * Validate query parameter as integer
   * Validates: Requirements 17.2, 17.6
   */
  queryInt: (field, fieldName, min = 1) =>
    query(field)
      .optional()
      .isInt({ min })
      .withMessage(`${fieldName} debe ser un entero mayor o igual a ${min}`),

  /**
   * Validate query parameter as string
   * Validates: Requirements 17.2, 17.4
   */
  queryString: (field, fieldName) =>
    query(field)
      .optional()
      .isString()
      .withMessage(`${fieldName} debe ser texto`)
      .trim()
      .escape(),
};

module.exports = {
  validateRequest,
  validationRules,
  // Export express-validator functions for custom validations
  body,
  param,
  query,
};
