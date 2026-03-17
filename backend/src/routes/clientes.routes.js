const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verifyToken } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Clients Routes
 * Implements Requirements 8.1, 8.2, 8.3, 8.5, 8.6, 17.1, 17.2, 17.3, 20.1, 20.2, 21.6, 21.7
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
 * All authenticated roles can access
 */
router.get('/', verifyToken, clientesController.getAll.bind(clientesController));

/**
 * GET /api/clientes/telefono/:telefono
 * Requirement 8.4: Query by telefono
 * All authenticated roles can access
 */
router.get('/telefono/:telefono', verifyToken, clientesController.getByTelefono.bind(clientesController));

/**
 * GET /api/clientes/:id
 * Requirement 8.4: Query by ID
 * All authenticated roles can access
 */
router.get('/:id', verifyToken, clientesController.getById.bind(clientesController));

/**
 * POST /api/clientes
 * Requirement 8.1: Validate nombre is not empty
 * Requirement 8.2: Validate telefono is not empty
 * Requirement 17.1, 17.2, 17.3: Request validation
 * All authenticated roles can access
 */
router.post('/', verifyToken, createClientValidation, clientesController.create.bind(clientesController));

/**
 * PUT /api/clientes/:id
 * Requirement 8.3: Update updated_at timestamp
 * Requirement 17.1, 17.2, 17.3: Request validation
 * All authenticated roles can access
 */
router.put('/:id', verifyToken, updateClientValidation, clientesController.update.bind(clientesController));

/**
 * DELETE /api/clientes/:id
 * Requirement 8.6: Use parameterized queries
 * All authenticated roles can access
 */
router.delete('/:id', verifyToken, clientesController.delete.bind(clientesController));

module.exports = router;
