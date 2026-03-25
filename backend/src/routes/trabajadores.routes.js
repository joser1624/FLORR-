const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Trabajadores Routes - Admin only
 * Implements Requirements 9.10, 2.4, 20.1, 20.2
 * All routes require admin role (Requirement 9.10)
 */

// Validation rules for worker creation
const createWorkerValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.email('email'),
  validationRules.password('password', 6),
  validationRules.enum('rol', 'Rol', ['admin', 'empleado', 'duena']),
  validationRules.optionalPhone('telefono'),
  validationRules.optionalString('cargo', 'Cargo'),
  validationRules.optionalIsoDate('fecha_ingreso', 'Fecha de ingreso'),
  validateRequest
];

// Validation rules for worker update
const updateWorkerValidation = [
  validationRules.optionalString('nombre', 'Nombre'),
  validationRules.optionalEnum('rol', 'Rol', ['admin', 'empleado', 'duena']),
  validationRules.optionalPhone('telefono'),
  validationRules.optionalString('cargo', 'Cargo'),
  validationRules.optionalIsoDate('fecha_ingreso', 'Fecha de ingreso'),
  validateRequest
];

/**
 * GET /api/trabajadores
 * Requirement 9.10: Admin only for full access
 * Empleado can view list (read-only, needed for ventas dropdown)
 * Requirement 20.1, 20.2: Standardized response
 */
router.get('/', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  trabajadoresController.getAll.bind(trabajadoresController)
);

/**
 * GET /api/trabajadores/:id
 * Requirement 9.10: Admin only for full access
 * Empleado can view (read-only)
 * Requirement 20.1, 20.2: Standardized response
 */
router.get('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado']), 
  trabajadoresController.getById.bind(trabajadoresController)
);

/**
 * POST /api/trabajadores
 * Requirement 9.10: Admin only
 * Requirement 9.1-9.6: Validation enforced in service
 * Requirement 17.1, 17.2, 17.3: Request validation middleware
 * Requirement 20.6: Return 201 for creation
 */
router.post('/', verifyToken, requireRole(['admin']), createWorkerValidation, trabajadoresController.create.bind(trabajadoresController));

/**
 * PUT /api/trabajadores/:id
 * Requirement 9.10: Admin only
 * Requirement 17.1, 17.2, 17.3: Request validation middleware
 * Requirement 20.7: Return 200 for update
 */
router.put('/:id', verifyToken, requireRole(['admin']), updateWorkerValidation, trabajadoresController.update.bind(trabajadoresController));

/**
 * DELETE /api/trabajadores/:id
 * Requirement 9.10: Admin only
 * Requirement 9.9: Soft delete (activo = false)
 */
router.delete('/:id', verifyToken, requireRole(['admin']), trabajadoresController.delete.bind(trabajadoresController));

module.exports = router;
