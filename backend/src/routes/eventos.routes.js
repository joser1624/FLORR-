const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, eventosController.getAll.bind(eventosController));
router.get('/:id', verifyToken, eventosController.getById.bind(eventosController));
router.post('/', verifyToken, requireRole(["admin","duena"]), eventosController.create.bind(eventosController));
router.put('/:id', verifyToken, requireRole(["admin","duena"]), eventosController.update.bind(eventosController));
router.delete('/:id', verifyToken, requireRole(["admin","duena"]), eventosController.delete.bind(eventosController));

module.exports = router;
