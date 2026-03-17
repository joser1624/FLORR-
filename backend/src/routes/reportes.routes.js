const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, query } = require('../middleware/validateRequest');

/**
 * Reportes Routes - Admin and Duena only
 * Implements Requirements 2.6, 20.1, 20.2
 */

// Validation for mes query parameter (required, YYYY-MM format)
const mesValidation = [
  query('mes')
    .notEmpty()
    .withMessage('El parámetro mes es requerido')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('mes debe estar en formato YYYY-MM'),
  validateRequest,
];

/**
 * GET /api/reportes?mes=YYYY-MM
 * Requirement 2.6: Admin and duena roles only
 * Requirement 20.1, 20.2: Standardized response
 */
router.get(
  '/',
  verifyToken,
  requireRole(['admin', 'duena']),
  mesValidation,
  reportesController.getMonthlyReport.bind(reportesController)
);

module.exports = router;
