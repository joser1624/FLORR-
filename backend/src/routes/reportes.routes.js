const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// Only admin and duena can access reports
router.get('/', verifyToken, requireRole(['admin', 'duena']), reportesController.getMonthlyReport.bind(reportesController));

module.exports = router;
