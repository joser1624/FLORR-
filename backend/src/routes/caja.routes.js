const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/caja.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Cash Register Routes
 * Task 16.2: Implements cash register routes with authentication, authorization, and validation
 * Requirements: 2.5, 20.1, 20.2, 20.8
 */

/**
 * Validation rules for apertura (opening cash register)
 * Requirement 12.2: monto_apertura must be >= 0
 * Requirements: 17.1, 17.2, 17.3, 17.6
 */
const aperturaValidation = [
  validationRules.numericRange('monto_apertura', 'Monto de apertura', 0),
  validateRequest
];

/**
 * GET /api/caja/hoy
 * Requirement 12.14, 12.15: Returns today's cash register, 404 if not found
 * Requirement 2.5: Empleado and admin roles can access
 */
router.get('/hoy',
  verifyToken,
  requireRole(['admin', 'empleado']),
  cajaController.getHoy.bind(cajaController)
);

/**
 * POST /api/caja/apertura
 * Requirements 12.1-12.5: Open cash register for today
 * Requirement 2.5: Empleado and admin roles can open register
 * Requirement 20.6: Returns 201 on successful creation
 * Requirement 17.1, 17.2, 17.3: Request validation for monto_apertura
 */
router.post('/apertura',
  verifyToken,
  requireRole(['admin', 'empleado']),
  aperturaValidation,
  cajaController.apertura.bind(cajaController)
);

/**
 * POST /api/caja/cierre
 * Requirements 12.6-12.13: Close cash register for today with calculated totals
 * Requirement 2.5: Empleado and admin roles can close register
 * Requirement 20.7: Returns 200 on success
 */
router.post('/cierre',
  verifyToken,
  requireRole(['admin', 'empleado']),
  cajaController.cierre.bind(cajaController)
);

/**
 * GET /api/caja/historial
 * Returns paginated cash register history
 * Requirement 2.5: Empleado and admin roles can view history
 */
router.get('/historial',
  verifyToken,
  requireRole(['admin', 'empleado']),
  cajaController.getHistorial.bind(cajaController)
);

/**
 * POST /api/caja/quiebre
 * Generate intermediate cash register cut (corte sin cerrar caja)
 * Requirement 2.5: Empleado and admin roles can generate cuts
 */
router.post('/quiebre',
  verifyToken,
  requireRole(['admin', 'empleado']),
  cajaController.generarQuiebre.bind(cajaController)
);

/**
 * GET /api/caja/quiebres
 * Get today's quiebres (intermediate cuts)
 * Requirement 2.5: Empleado and admin roles can view
 */
router.get('/quiebres',
  verifyToken,
  requireRole(['admin', 'empleado']),
  cajaController.getQuiebres.bind(cajaController)
);

module.exports = router;
