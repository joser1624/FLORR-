const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules, body } = require('../middleware/validateRequest');

/**
 * Sales Routes
 * Task 7.3: Implements sales routes with authentication, authorization, and validation
 * Requirements: 2.5, 20.1, 20.2, 20.6, 20.7
 */

/**
 * Validation rules for sale creation
 * Validates productos array and metodo_pago
 * Requirements: 6.1, 6.2, 17.1, 17.2, 17.3
 */
const createSaleValidation = [
  // Validate productos array
  validationRules.array('productos', 'Productos'),
  
  // Validate each product in the array
  body('productos.*.producto_id')
    .notEmpty()
    .withMessage('producto_id es requerido')
    .isInt({ min: 1 })
    .withMessage('producto_id debe ser un entero positivo'),
  
  body('productos.*.cantidad')
    .notEmpty()
    .withMessage('cantidad es requerida')
    .isInt({ min: 1 })
    .withMessage('cantidad debe ser un entero positivo'),
  
  body('productos.*.precio_unitario')
    .notEmpty()
    .withMessage('precio_unitario es requerido')
    .isFloat({ min: 0 })
    .withMessage('precio_unitario debe ser mayor o igual a 0'),
  
  // Validate metodo_pago
  validationRules.enum('metodo_pago', 'Método de pago', [
    'Efectivo', 
    'Yape', 
    'Plin', 
    'Tarjeta', 
    'Transferencia bancaria'
  ]),
  
  // Validate optional cliente_id
  body('cliente_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cliente_id debe ser un entero positivo'),
  
  validateRequest
];

/**
 * GET /api/ventas
 * Requirement 2.5: All authenticated roles can access
 * Returns list of sales with optional filters (fecha, metodo_pago, trabajador_id)
 */
router.get('/', 
  verifyToken, 
  ventasController.getAll.bind(ventasController)
);

/**
 * GET /api/ventas/:id
 * Requirement 2.5: All authenticated roles can access
 * Returns single sale by ID with productos details
 */
router.get('/:id', 
  verifyToken, 
  ventasController.getById.bind(ventasController)
);

/**
 * POST /api/ventas
 * Task 7.3: Create sale endpoint
 * Requirement 2.5: Empleado and admin roles can create sales
 * Requirement 20.6: Return 201 for successful creation
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Creates a new sale with automatic stock deduction
 */
router.post('/', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  createSaleValidation, 
  ventasController.create.bind(ventasController)
);

/**
 * PUT /api/ventas/:id
 * Requirement 2.5: Empleado and admin roles can update sales
 * Updates an existing sale (limited fields)
 */
router.put('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  ventasController.update.bind(ventasController)
);

/**
 * DELETE /api/ventas/:id
 * Requirement 2.5: Empleado and admin roles can delete sales
 * Deletes a sale
 */
router.delete('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  ventasController.delete.bind(ventasController)
);

module.exports = router;
