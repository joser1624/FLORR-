const express = require('express');
const router = express.Router();
const arreglosController = require('../controllers/arreglos.controller');
const { verifyToken } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Arreglos Routes
 * Requirements: 20.1, 20.2, 20.6
 * All routes require authentication (all roles allowed)
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
 */
router.get('/', verifyToken, arreglosController.getAll.bind(arreglosController));

/**
 * GET /api/arreglos/:id
 * Returns single arreglo with full recipe details
 */
router.get('/:id', verifyToken, arreglosController.getById.bind(arreglosController));

/**
 * POST /api/arreglos
 * Creates a new arreglo with recipe items
 */
router.post('/', verifyToken, createArregloValidation, arreglosController.create.bind(arreglosController));

/**
 * PUT /api/arreglos/:id
 * Updates an existing arreglo
 */
router.put('/:id', verifyToken, updateArregloValidation, arreglosController.update.bind(arreglosController));

/**
 * DELETE /api/arreglos/:id
 * Deletes an arreglo and its recipe items (cascade)
 */
router.delete('/:id', verifyToken, arreglosController.delete.bind(arreglosController));

module.exports = router;
