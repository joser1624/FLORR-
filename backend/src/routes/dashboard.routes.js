const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth');

// All dashboard routes require authentication
router.get('/', verifyToken, dashboardController.getDashboard.bind(dashboardController));
router.get('/ventas-periodo', verifyToken, dashboardController.getVentasPeriodo.bind(dashboardController));

module.exports = router;
