const express = require('express');
const router = express.Router();
const capitalController = require('../controllers/capital.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/capital - Get current capital (all authenticated users)
router.get('/',
  verifyToken,
  requireRole(['admin', 'empleado']),
  capitalController.getCapital
);

// GET /api/capital/inicial - Get capital inicial (all authenticated users)
router.get('/inicial',
  verifyToken,
  requireRole(['admin', 'empleado']),
  capitalController.getCapitalInicial
);

// GET /api/capital/movimientos - Get movements history (all authenticated users)
router.get('/movimientos',
  verifyToken,
  requireRole(['admin', 'empleado']),
  capitalController.getMovimientos
);

// POST /api/capital/aportes - Register aporte (admin only)
router.post('/aportes',
  verifyToken,
  requireRole(['admin']),
  capitalController.registrarAporte
);

// POST /api/capital/retiros - Register retiro (admin only)
router.post('/retiros',
  verifyToken,
  requireRole(['admin']),
  capitalController.registrarRetiro
);

module.exports = router;
