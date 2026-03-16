const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, pedidosController.getAll.bind(pedidosController));
router.get('/:id', verifyToken, pedidosController.getById.bind(pedidosController));
router.post('/', verifyToken, requireRole(["admin","empleado"]), pedidosController.create.bind(pedidosController));
router.put('/:id', verifyToken, requireRole(["admin","empleado"]), pedidosController.update.bind(pedidosController));
router.delete('/:id', verifyToken, requireRole(["admin","empleado"]), pedidosController.delete.bind(pedidosController));

module.exports = router;
