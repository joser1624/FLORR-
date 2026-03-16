const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/caja.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// All caja routes require authentication and empleado or admin role
router.get('/hoy', verifyToken, requireRole(['admin', 'empleado']), cajaController.getToday.bind(cajaController));
router.post('/apertura', verifyToken, requireRole(['admin', 'empleado']), cajaController.openCaja.bind(cajaController));
router.post('/cierre', verifyToken, requireRole(['admin', 'empleado']), cajaController.closeCaja.bind(cajaController));
router.get('/historial', verifyToken, requireRole(['admin', 'duena']), cajaController.getHistory.bind(cajaController));

module.exports = router;
