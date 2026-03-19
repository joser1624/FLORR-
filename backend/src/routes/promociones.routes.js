const express = require('express');
const router = express.Router();
const promocionesController = require('../controllers/promociones.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET público para el catálogo de la página principal
router.get('/', promocionesController.getAll.bind(promocionesController));
router.get('/:id', promocionesController.getById.bind(promocionesController));

// Mutaciones requieren admin o duena
router.post('/', verifyToken, requireRole(['admin', 'duena']), promocionesController.create.bind(promocionesController));
router.put('/:id', verifyToken, requireRole(['admin', 'duena']), promocionesController.update.bind(promocionesController));
router.delete('/:id', verifyToken, requireRole(['admin', 'duena']), promocionesController.delete.bind(promocionesController));

module.exports = router;
