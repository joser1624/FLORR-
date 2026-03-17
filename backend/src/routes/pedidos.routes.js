const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * Orders Routes
 * Task 9.2: Implements orders routes with authentication and authorization
 * Requirements: 2.5, 20.1, 20.2, 20.6, 20.7
 */

// GET /api/pedidos/cliente - Filter by telefono (must be before /:id route)
router.get('/cliente', verifyToken, requireRole(['admin', 'empleado']), pedidosController.getByCliente.bind(pedidosController));

// GET /api/pedidos - Get all orders with optional filters
router.get('/', verifyToken, requireRole(['admin', 'empleado']), pedidosController.getAll.bind(pedidosController));

// GET /api/pedidos/:id - Get order by ID
router.get('/:id', verifyToken, requireRole(['admin', 'empleado']), pedidosController.getById.bind(pedidosController));

// POST /api/pedidos - Create new order
router.post('/', verifyToken, requireRole(['admin', 'empleado']), pedidosController.create.bind(pedidosController));

// PUT /api/pedidos/:id - Update order
router.put('/:id', verifyToken, requireRole(['admin', 'empleado']), pedidosController.update.bind(pedidosController));

// DELETE /api/pedidos/:id - Delete order
router.delete('/:id', verifyToken, requireRole(['admin', 'empleado']), pedidosController.delete.bind(pedidosController));

module.exports = router;
