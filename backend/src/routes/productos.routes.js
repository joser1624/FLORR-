const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public routes (for customer-facing site)
router.get('/', productosController.getAll.bind(productosController));
router.get('/:id', productosController.getById.bind(productosController));

// Protected routes (admin only)
router.post('/', verifyToken, requireRole(['admin', 'duena']), productosController.create.bind(productosController));
router.put('/:id', verifyToken, requireRole(['admin', 'duena']), productosController.update.bind(productosController));
router.delete('/:id', verifyToken, requireRole(['admin']), productosController.delete.bind(productosController));

module.exports = router;
