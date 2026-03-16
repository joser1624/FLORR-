const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, clientesController.getAll.bind(clientesController));
router.get('/:id', verifyToken, clientesController.getById.bind(clientesController));
router.post('/', verifyToken, requireRole(["admin","empleado"]), clientesController.create.bind(clientesController));
router.put('/:id', verifyToken, requireRole(["admin","empleado"]), clientesController.update.bind(clientesController));
router.delete('/:id', verifyToken, requireRole(["admin","empleado"]), clientesController.delete.bind(clientesController));

module.exports = router;
