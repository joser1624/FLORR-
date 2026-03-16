const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, ventasController.getAll.bind(ventasController));
router.get('/:id', verifyToken, ventasController.getById.bind(ventasController));
router.post('/', verifyToken, requireRole(["admin","empleado"]), ventasController.create.bind(ventasController));
router.put('/:id', verifyToken, requireRole(["admin","empleado"]), ventasController.update.bind(ventasController));
router.delete('/:id', verifyToken, requireRole(["admin","empleado"]), ventasController.delete.bind(ventasController));

module.exports = router;
