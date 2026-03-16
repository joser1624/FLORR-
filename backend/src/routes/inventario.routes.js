const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Inventory Routes
 * Implements Requirements 20.1, 20.2, 20.7, 20.8
 */

// Validation rules for inventory item creation
const createInventoryValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.enum('tipo', 'Tipo', ['flores', 'materiales', 'accesorios']),
  validationRules.numericRange('stock', 'Stock', 0),
  validationRules.numericRange('costo', 'Costo', 0),
  validationRules.optionalNumericRange('stock_min', 'Stock mínimo', 0),
  validationRules.optionalEnum('unidad', 'Unidad', ['unidad', 'docena', 'metro', 'rollo', 'caja']),
  validateRequest
];

// Validation rules for inventory item update
const updateInventoryValidation = [
  validationRules.optionalString('nombre', 'Nombre'),
  validationRules.optionalEnum('tipo', 'Tipo', ['flores', 'materiales', 'accesorios']),
  validationRules.optionalNumericRange('stock', 'Stock', 0),
  validationRules.optionalNumericRange('costo', 'Costo', 0),
  validationRules.optionalNumericRange('stock_min', 'Stock mínimo', 0),
  validationRules.optionalEnum('unidad', 'Unidad', ['unidad', 'docena', 'metro', 'rollo', 'caja']),
  validateRequest
];

/**
 * GET /api/inventario
 * Requirement 2.5: All authenticated roles can access
 * Returns list of inventory items with optional filters (tipo, stock_bajo)
 */
router.get('/', verifyToken, inventarioController.getAll.bind(inventarioController));

/**
 * GET /api/inventario/:id
 * Requirement 2.5: All authenticated roles can access
 * Returns single inventory item by ID
 */
router.get('/:id', verifyToken, inventarioController.getById.bind(inventarioController));

/**
 * POST /api/inventario
 * Requirement 2.5: All authenticated roles can access
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Creates a new inventory item
 */
router.post('/', verifyToken, createInventoryValidation, inventarioController.create.bind(inventarioController));

/**
 * PUT /api/inventario/:id
 * Requirement 2.5: All authenticated roles can access
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Updates an existing inventory item
 */
router.put('/:id', verifyToken, updateInventoryValidation, inventarioController.update.bind(inventarioController));

/**
 * DELETE /api/inventario/:id
 * Requirement 2.5: All authenticated roles can access
 * Deletes an inventory item
 */
router.delete('/:id', verifyToken, inventarioController.delete.bind(inventarioController));

module.exports = router;
