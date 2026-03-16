const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, inventarioController.getAll.bind(inventarioController));
router.get('/:id', verifyToken, inventarioController.getById.bind(inventarioController));
router.post('/', verifyToken, requireRole(["admin","empleado","duena"]), inventarioController.create.bind(inventarioController));
router.put('/:id', verifyToken, requireRole(["admin","empleado","duena"]), inventarioController.update.bind(inventarioController));
router.delete('/:id', verifyToken, requireRole(["admin","empleado","duena"]), inventarioController.delete.bind(inventarioController));

module.exports = router;
