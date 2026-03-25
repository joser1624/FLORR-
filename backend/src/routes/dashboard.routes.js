const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * Dashboard Routes
 * Restricted to admin and duena roles
 * Empleados should not access dashboard (sensitive business data)
 */

// GET /api/dashboard - Main dashboard data
router.get('/', 
  verifyToken, 
  requireRole(['admin', 'duena']), 
  dashboardController.getDashboard.bind(dashboardController)
);

// GET /api/dashboard/ventas-periodo - Sales by period
router.get('/ventas-periodo', 
  verifyToken, 
  requireRole(['admin', 'duena']), 
  dashboardController.getVentasPeriodo.bind(dashboardController)
);

module.exports = router;
