const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Clients Routes
 * Implements Requirements 8.1, 8.2, 8.3, 8.5, 8.6, 17.1, 17.2, 17.3, 20.1, 20.2, 21.6, 21.7
 * 
 * Access Control:
 * - GET: All authenticated users (empleado can view for sales)
 * - POST/PUT/DELETE: Admin and duena only
 */

// Validation rules for client creation
const createClientValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.requiredString('telefono', 'Teléfono'),
  validationRules.optionalString('direccion', 'Dirección'),
  validationRules.optionalString('email', 'Email'),
  validateRequest
];

// Validation rules for client update
const updateClientValidation = [
  validationRules.optionalString('nombre', 'Nombre'),
  validationRules.optionalString('telefono', 'Teléfono'),
  validationRules.optionalString('direccion', 'Dirección'),
  validationRules.optionalString('email', 'Email'),
  validateRequest
];

/**
 * GET /api/clientes
 * Requirement 8.5: Support pagination with page and limit query parameters
 * Requirement 21.6, 21.7: Pagination support with default page size of 50
 * All authenticated roles can access (read-only for empleado)
 */
router.get('/', 
  verifyToken, 
  requireRole(['admin', 'empleado', 'duena']), 
  clientesController.getAll.bind(clientesController)
);

/**
 * GET /api/clientes/telefono/:telefono
 * Requirement 8.4: Query by telefono
 * All authenticated roles can access
 */
router.get('/telefono/:telefono', 
  verifyToken, 
  requireRole(['admin', 'empleado', 'duena']), 
  clientesController.getByTelefono.bind(clientesController)
);

/**
 * GET /api/clientes/:id
 * Requirement 8.4: Query by ID
 * All authenticated roles can access
 */
router.get('/:id', 
  verifyToken, 
  requireRole(['admin', 'empleado', 'duena']), 
  clientesController.getById.bind(clientesController)
);

/**
 * POST /api/clientes
 * Requirement 8.1: Validate nombre is not empty
 * Requirement 8.2: Validate telefono is not empty
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Admin and duena can create clients
 */
router.post('/', 
  verifyToken, 
  requireRole(['admin', 'duena']), 
  createClientValidation, 
  clientesController.create.bind(clientesController)
);

/**
 * PUT /api/clientes/:id
 * Requirement 8.3: Update updated_at timestamp
 * Requirement 17.1, 17.2, 17.3: Request validation
 * Admin and duena can update clients
 */
router.put('/:id', 
  verifyToken, 
  requireRole(['admin', 'duena']), 
  updateClientValidation, 
  clientesController.update.bind(clientesController)
);

/**
 * DELETE /api/clientes/:id
 * Requirement 8.6: Use parameterized queries
 * Admin and duena can delete clients
 */
router.delete('/:id', 
  verifyToken, 
  requireRole(['admin', 'duena']), 
  clientesController.delete.bind(clientesController)
);

module.exports = router;
