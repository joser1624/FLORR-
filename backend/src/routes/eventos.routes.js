const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET público para la página principal
router.get('/', eventosController.getAll.bind(eventosController));
router.get('/:id', eventosController.getById.bind(eventosController));

// Mutaciones requieren autenticación
router.post('/', verifyToken, requireRole(["admin","duena"]), eventosController.create.bind(eventosController));
router.put('/:id', verifyToken, requireRole(["admin","duena"]), eventosController.update.bind(eventosController));
router.delete('/:id', verifyToken, requireRole(["admin","duena"]), eventosController.delete.bind(eventosController));

module.exports = router;
