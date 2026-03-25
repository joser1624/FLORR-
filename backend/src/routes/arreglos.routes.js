const express = require('express');
const router = express.Router();
const arreglosController = require('../controllers/arreglos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Arreglos Routes (Laboratorio)
 * Requirements: 20.1, 20.2, 20.6
 * 
 * Access Control:
 * - GET: All authenticated users (empleado and duena can view)
 * - POST/PUT/DELETE: Admin and empleado only (duena read-only)
 */

// Validation rules for arreglo creation
const createArregloValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.numericRange('margen', 'Margen', 0, 100),
  validationRules.array('items', 'Items'),
  validateRequest
];

// Validation rules for arreglo update
const updateArregloValidation = [
  validationRules.optionalString('nombre', 'Nombre'),
  validationRules.optionalNumericRange('margen', 'Margen', 0, 100),
  validateRequest
];

/**
 * GET /api/arreglos
 * Returns all arreglos with recipe items
 * All authenticated users can view
 */
router.get('/', 
  verifyToken, 
  requireRole(['admin', 'empleado', 'duena']), 
  arreglosController.getAll.bind(arreglosController)
);

/**
 * GET /api/arreglos/:id
 * Returns single arreglo with full recipe details
 * All authenticated users can view
 */
router.get('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado', 'duena']), 
  arreglosController.getById.bind(arreglosController)
);

/**
 * POST /api/arreglos
 * Creates a new arreglo with recipe items
 * Admin and empleado can create (empleado needs this for laboratorio)
 */
router.post('/', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  createArregloValidation, 
  arreglosController.create.bind(arreglosController)
);

/**
 * PUT /api/arreglos/:id
 * Updates an existing arreglo
 * Admin and empleado can update
 */
router.put('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  updateArregloValidation, 
  arreglosController.update.bind(arreglosController)
);

/**
 * DELETE /api/arreglos/:id
 * Deletes an arreglo and its recipe items (cascade)
 * Admin and empleado can delete
 */
router.delete('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  arreglosController.delete.bind(arreglosController)
);

module.exports = router;
