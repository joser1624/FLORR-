const express = require('express');
const router = express.Router();
const solicitudesGastosController = require('../controllers/solicitudes-gastos.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../middleware/validateRequest');

/**
 * Solicitudes de Gastos Routes
 * Sistema de aprobación de gastos para empleados
 */

// Validation rules para crear solicitud
const crearSolicitudValidation = [
  validationRules.numericRange('monto', 'Monto', 0),
  validationRules.enum('categoria', 'Categoría', [
    'flores',
    'transporte',
    'materiales',
    'mantenimiento',
    'otros',
  ]),
  validationRules.requiredString('descripcion', 'Descripción'),
  validationRules.requiredString('empresa', 'Empresa'),
  validationRules.requiredString('numero_comprobante', 'Número de comprobante'),
  validateRequest,
];

// Validation rules para ID param
const idParamValidation = [
  validationRules.idParam('id'),
  validateRequest,
];

/**
 * POST /api/solicitudes-gastos
 * Crear solicitud de gasto (empleado, admin, dueña)
 * Requiere caja abierta
 */
router.post(
  '/',
  verifyToken,
  requireRole(['empleado', 'admin', 'duena']),
  crearSolicitudValidation,
  solicitudesGastosController.crear.bind(solicitudesGastosController)
);

/**
 * GET /api/solicitudes-gastos
 * Listar solicitudes
 * - Empleado: solo sus solicitudes
 * - Admin/Dueña: todas las solicitudes
 */
router.get(
  '/',
  verifyToken,
  requireRole(['empleado', 'admin', 'duena']),
  solicitudesGastosController.listar.bind(solicitudesGastosController)
);

/**
 * GET /api/solicitudes-gastos/pendientes/count
 * Contar solicitudes pendientes (para dashboard admin)
 */
router.get(
  '/pendientes/count',
  verifyToken,
  requireRole(['admin', 'duena']),
  solicitudesGastosController.contarPendientes.bind(solicitudesGastosController)
);

/**
 * GET /api/solicitudes-gastos/:id
 * Obtener solicitud por ID
 */
router.get(
  '/:id',
  verifyToken,
  requireRole(['empleado', 'admin', 'duena']),
  idParamValidation,
  solicitudesGastosController.obtenerPorId.bind(solicitudesGastosController)
);

/**
 * PUT /api/solicitudes-gastos/:id/aprobar
 * Aprobar solicitud (solo admin/dueña)
 */
router.put(
  '/:id/aprobar',
  verifyToken,
  requireRole(['admin', 'duena']),
  idParamValidation,
  solicitudesGastosController.aprobar.bind(solicitudesGastosController)
);

/**
 * PUT /api/solicitudes-gastos/:id/rechazar
 * Rechazar solicitud (solo admin/dueña)
 */
router.put(
  '/:id/rechazar',
  verifyToken,
  requireRole(['admin', 'duena']),
  idParamValidation,
  solicitudesGastosController.rechazar.bind(solicitudesGastosController)
);

module.exports = router;
