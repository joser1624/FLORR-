const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { expenseValidation, idParamValidation } = require('../middleware/validation-examples');

router.get('/', verifyToken, gastosController.getAll.bind(gastosController));
router.get('/:id', verifyToken, idParamValidation, gastosController.getById.bind(gastosController));
router.post('/', verifyToken, requireRole(['admin', 'duena']), expenseValidation, gastosController.create.bind(gastosController));
router.put('/:id', verifyToken, requireRole(['admin', 'duena']), idParamValidation, expenseValidation, gastosController.update.bind(gastosController));
router.delete('/:id', verifyToken, requireRole(['admin', 'duena']), idParamValidation, gastosController.delete.bind(gastosController));

module.exports = router;
