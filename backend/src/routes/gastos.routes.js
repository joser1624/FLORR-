const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, gastosController.getAll.bind(gastosController));
router.get('/:id', verifyToken, gastosController.getById.bind(gastosController));
router.post('/', verifyToken, requireRole(["admin","duena"]), gastosController.create.bind(gastosController));
router.put('/:id', verifyToken, requireRole(["admin","duena"]), gastosController.update.bind(gastosController));
router.delete('/:id', verifyToken, requireRole(["admin","duena"]), gastosController.delete.bind(gastosController));

module.exports = router;
