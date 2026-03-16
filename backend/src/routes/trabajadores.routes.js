const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, trabajadoresController.getAll.bind(trabajadoresController));
router.get('/:id', verifyToken, trabajadoresController.getById.bind(trabajadoresController));
router.post('/', verifyToken, requireRole(["admin"]), trabajadoresController.create.bind(trabajadoresController));
router.put('/:id', verifyToken, requireRole(["admin"]), trabajadoresController.update.bind(trabajadoresController));
router.delete('/:id', verifyToken, requireRole(["admin"]), trabajadoresController.delete.bind(trabajadoresController));

module.exports = router;
