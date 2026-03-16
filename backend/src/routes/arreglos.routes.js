const express = require('express');
const router = express.Router();
const arreglosController = require('../controllers/arreglos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, arreglosController.getAll.bind(arreglosController));
router.get('/:id', verifyToken, arreglosController.getById.bind(arreglosController));
router.post('/', verifyToken, requireRole(["admin","empleado","duena"]), arreglosController.create.bind(arreglosController));
router.put('/:id', verifyToken, requireRole(["admin","empleado","duena"]), arreglosController.update.bind(arreglosController));
router.delete('/:id', verifyToken, requireRole(["admin","empleado","duena"]), arreglosController.delete.bind(arreglosController));

module.exports = router;
