const express = require('express');
const router = express.Router();
const promocionesController = require('../controllers/promociones.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, promocionesController.getAll.bind(promocionesController));
router.get('/:id', verifyToken, promocionesController.getById.bind(promocionesController));
router.post('/', verifyToken, requireRole(["admin","duena"]), promocionesController.create.bind(promocionesController));
router.put('/:id', verifyToken, requireRole(["admin","duena"]), promocionesController.update.bind(promocionesController));
router.delete('/:id', verifyToken, requireRole(["admin","duena"]), promocionesController.delete.bind(promocionesController));

module.exports = router;
