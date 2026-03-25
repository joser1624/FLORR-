const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules, query } = require('../middleware/validateRequest');

/**
 * Gastos Routes - Admin and Duena only
 * Implements Requirements 2.6, 20.1, 20.2
 * All routes require admin or duena role (Requirement 2.6)
 */

// Validation rules for expense creation
const createGastoValidation = [
  validationRules.requiredString('descripcion', 'Descripción'),
  validationRules.enum('categoria', 'Categoría', [
    'flores',
    'transporte',
    'materiales',
    'mantenimiento',
    'merma',
    'otros',
  ]),
  validationRules.numericRange('monto', 'Monto', 0),
  validationRules.isoDate('fecha', 'Fecha'),
  validateRequest,
];

// Validation rules for ID param
const idParamValidation = [
  validationRules.idParam('id'),
  validateRequest,
];

// Query parameter validation for filtering
const queryValidation = [
  query('mes')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('mes debe estar en formato YYYY-MM'),
  query('categoria')
    .optional()
    .isIn(['flores', 'transporte', 'materiales', 'merma', 'mantenimiento', 'otros'])
    .withMessage('categoria debe ser uno de: flores, transporte, materiales, merma, mantenimiento, otros'),
  validateRequest,
];

/**
 * GET /api/gastos
 * Requirement 2.6: Admin and duena roles only
 * Requirement 20.1, 20.2: Standardized response
 * Supports query params: mes (YYYY-MM), categoria
 */
router.get(
  '/',
  verifyToken,
  requireRole(['admin', 'duena']),
  queryValidation,
  gastosController.getAll.bind(gastosController)
);

/**
 * GET /api/gastos/:id
 * Requirement 2.6: Admin and duena roles only
 * Requirement 20.1, 20.2: Standardized response
 * Requirement 20.8: Return 404 if not found
 */
router.get(
  '/:id',
  verifyToken,
  requireRole(['admin', 'duena']),
  idParamValidation,
  gastosController.getById.bind(gastosController)
);

/**
 * POST /api/gastos
 * Requirement 2.6: Admin and duena roles only
 * Requirement 20.6: Return 201 for creation
 * Requirement 17.1, 17.2, 17.3: Request validation middleware
 */
router.post(
  '/',
  verifyToken,
  requireRole(['admin', 'duena']),
  createGastoValidation,
  gastosController.create.bind(gastosController)
);

/**
 * DELETE /api/gastos/:id
 * Requirement 2.6: Admin and duena roles only
 * Requirement 20.7: Return 200 for successful deletion
 * Requirement 20.8: Return 404 if not found
 */
router.delete(
  '/:id',
  verifyToken,
  requireRole(['admin', 'duena']),
  idParamValidation,
  gastosController.delete.bind(gastosController)
);

module.exports = router;
