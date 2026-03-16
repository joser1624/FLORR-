const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Products Routes
 * Implements Requirements 2.4, 2.5, 2.6, 17.1, 17.2, 17.3
 */

// Validation rules for product creation
const createProductValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.optionalString('descripcion', 'Descripción'),
  validationRules.enum('categoria', 'Categoría', ['Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros']),
  validationRules.numericRange('precio', 'Precio', 0),
  validationRules.numericRange('costo', 'Costo', 0),
  validationRules.numericRange('stock', 'Stock', 0),
  validationRules.optionalString('imagen_url', 'URL de imagen'),
  validateRequest
];

// Validation rules for product update
const updateProductValidation = [
  validationRules.optionalString('nombre', 'Nombre'),
  validationRules.optionalString('descripcion', 'Descripción'),
  validationRules.optionalEnum('categoria', 'Categoría', ['Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros']),
  validationRules.optionalNumericRange('precio', 'Precio', 0),
  validationRules.optionalNumericRange('costo', 'Costo', 0),
  validationRules.optionalNumericRange('stock', 'Stock', 0),
  validationRules.optionalString('imagen_url', 'URL de imagen'),
  validateRequest
];

/**
 * GET /api/productos
 * Requirement 2.5: All authenticated roles can access
 * Returns list of products with optional filters
 */
router.get('/', verifyToken, productosController.getAll.bind(productosController));

/**
 * GET /api/productos/:id
 * Requirement 2.5: All authenticated roles can access
 * Returns single product by ID
 */
router.get('/:id', verifyToken, productosController.getById.bind(productosController));

/**
 * POST /api/productos
 * Requirement 2.4: Admin role only
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Creates a new product
 */
router.post('/', verifyToken, requireRole('admin'), createProductValidation, productosController.create.bind(productosController));

/**
 * PUT /api/productos/:id
 * Requirement 2.4: Admin role only
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Updates an existing product
 */
router.put('/:id', verifyToken, requireRole('admin'), updateProductValidation, productosController.update.bind(productosController));

/**
 * DELETE /api/productos/:id
 * Requirement 2.4: Admin role only
 * Soft deletes a product (sets activo = false)
 */
router.delete('/:id', verifyToken, requireRole('admin'), productosController.delete.bind(productosController));

module.exports = router;
