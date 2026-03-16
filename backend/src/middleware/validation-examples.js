/**
 * Examples of using the validation middleware in routes
 * 
 * This file demonstrates how to use the validation rules and middleware
 * to validate requests in your route handlers.
 */

const { validationRules, validateRequest, body } = require('./validateRequest');

/**
 * Example 1: Product validation
 * Validates product creation with all required fields
 */
const productValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.optionalString('descripcion', 'Descripción'),
  validationRules.enum('categoria', 'Categoría', [
    'Ramos',
    'Arreglos',
    'Peluches',
    'Cajas sorpresa',
    'Globos',
    'Otros',
  ]),
  validationRules.numericRange('precio', 'Precio', 0),
  validationRules.numericRange('costo', 'Costo', 0),
  validationRules.integerRange('stock', 'Stock', 0),
  validationRules.optionalString('imagen_url', 'Imagen URL'),
  validateRequest,
];

/**
 * Example 2: Worker/Employee validation
 * Validates worker creation with email and password
 */
const workerValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.email('email'),
  validationRules.password('password', 6),
  validationRules.optionalPhone('telefono'),
  validationRules.requiredString('cargo', 'Cargo'),
  validationRules.enum('rol', 'Rol', ['admin', 'empleado', 'duena']),
  validationRules.optionalIsoDate('fecha_ingreso', 'Fecha de ingreso'),
  validateRequest,
];

/**
 * Example 3: Sale validation
 * Validates sale creation with products array and payment method
 */
const saleValidation = [
  validationRules.array('productos', 'Productos'),
  body('productos.*.producto_id')
    .isInt({ min: 1 })
    .withMessage('ID de producto debe ser un entero positivo'),
  body('productos.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('Cantidad debe ser un entero positivo'),
  body('productos.*.precio_unitario')
    .isFloat({ min: 0 })
    .withMessage('Precio unitario debe ser mayor o igual a 0'),
  validationRules.enum('metodo_pago', 'Método de pago', [
    'Efectivo',
    'Yape',
    'Plin',
    'Tarjeta',
    'Transferencia bancaria',
  ]),
  validationRules.optionalNumericRange('cliente_id', 'ID de cliente', 1),
  validateRequest,
];

/**
 * Example 4: Order validation
 * Validates order creation with client info and delivery date
 */
const orderValidation = [
  validationRules.requiredString('cliente_nombre', 'Nombre del cliente'),
  validationRules.phone('cliente_telefono'),
  validationRules.optionalString('direccion', 'Dirección'),
  validationRules.isoDate('fecha_entrega', 'Fecha de entrega'),
  validationRules.requiredString('descripcion', 'Descripción'),
  validationRules.numericRange('total', 'Total', 0),
  validationRules.optionalString('metodo_pago', 'Método de pago'),
  validationRules.optionalNumericRange('cliente_id', 'ID de cliente', 1),
  validateRequest,
];

/**
 * Example 5: Order status update validation
 * Validates order status changes
 */
const orderStatusValidation = [
  validationRules.enum('estado', 'Estado', [
    'pendiente',
    'en preparación',
    'listo para entrega',
    'entregado',
    'cancelado',
  ]),
  validateRequest,
];

/**
 * Example 6: Expense validation
 * Validates expense tracking entries
 */
const expenseValidation = [
  validationRules.requiredString('descripcion', 'Descripción'),
  validationRules.enum('categoria', 'Categoría', [
    'flores',
    'transporte',
    'materiales',
    'mantenimiento',
    'otros',
  ]),
  validationRules.numericRange('monto', 'Monto', 0),
  validationRules.isoDate('fecha', 'Fecha'),
  validateRequest,
];

/**
 * Example 7: Promotion validation
 * Validates promotional campaign creation
 */
const promotionValidation = [
  validationRules.requiredString('titulo', 'Título'),
  validationRules.optionalString('descripcion', 'Descripción'),
  validationRules.numericRange('descuento', 'Descuento', 0, 100),
  validationRules.enum('tipo', 'Tipo', [
    'porcentaje',
    '2x1',
    'precio_fijo',
    'regalo',
  ]),
  validationRules.isoDate('fecha_desde', 'Fecha desde'),
  validationRules.isoDate('fecha_hasta', 'Fecha hasta'),
  validationRules.boolean('activa', 'Activa'),
  validateRequest,
];

/**
 * Example 8: Inventory validation
 * Validates inventory item creation
 */
const inventoryValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.enum('tipo', 'Tipo', ['flores', 'materiales', 'accesorios']),
  validationRules.integerRange('stock', 'Stock', 0),
  validationRules.integerRange('stock_min', 'Stock mínimo', 0),
  validationRules.enum('unidad', 'Unidad', [
    'unidad',
    'docena',
    'metro',
    'rollo',
    'caja',
  ]),
  validationRules.numericRange('costo', 'Costo', 0),
  validateRequest,
];

/**
 * Example 9: Client validation
 * Validates client information
 */
const clientValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.phone('telefono'),
  validationRules.optionalString('direccion', 'Dirección'),
  validationRules.optionalString('email', 'Email'),
  validateRequest,
];

/**
 * Example 10: Cash register validation
 * Validates cash register opening and closing
 */
const cashRegisterOpenValidation = [
  validationRules.numericRange('monto_apertura', 'Monto de apertura', 0),
  validateRequest,
];

const cashRegisterCloseValidation = [
  validationRules.numericRange('monto_cierre', 'Monto de cierre', 0),
  validateRequest,
];

/**
 * Example 11: Arrangement validation
 * Validates custom flower arrangement recipes
 */
const arrangementValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.numericRange('margen', 'Margen', 0, 100),
  validationRules.array('receta', 'Receta'),
  body('receta.*.inventario_id')
    .isInt({ min: 1 })
    .withMessage('ID de inventario debe ser un entero positivo'),
  body('receta.*.cantidad')
    .isFloat({ min: 0 })
    .withMessage('Cantidad debe ser mayor o igual a 0'),
  validateRequest,
];

/**
 * Example 12: Event validation
 * Validates special event calendar entries
 */
const eventValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.optionalString('descripcion', 'Descripción'),
  validationRules.optionalString('emoji', 'Emoji'),
  validationRules.isoDate('fecha', 'Fecha'),
  validationRules.enum('color', 'Color', ['rosa', 'dorado', 'rojo', 'morado']),
  validationRules.boolean('activo', 'Activo'),
  validateRequest,
];

/**
 * Example 13: ID parameter validation
 * Validates URL parameters for resource IDs
 */
const idParamValidation = [validationRules.idParam('id'), validateRequest];

/**
 * Example 14: Pagination query validation
 * Validates pagination query parameters
 */
const paginationValidation = [
  validationRules.queryInt('page', 'Página', 1),
  validationRules.queryInt('limit', 'Límite', 1),
  validateRequest,
];

/**
 * How to use in routes:
 * 
 * const express = require('express');
 * const router = express.Router();
 * const { productValidation } = require('../middleware/validation-examples');
 * const productController = require('../controllers/productos.controller');
 * 
 * router.post('/productos', productValidation, productController.create);
 * router.put('/productos/:id', idParamValidation, productValidation, productController.update);
 * router.get('/productos', paginationValidation, productController.list);
 * 
 * module.exports = router;
 */

module.exports = {
  productValidation,
  workerValidation,
  saleValidation,
  orderValidation,
  orderStatusValidation,
  expenseValidation,
  promotionValidation,
  inventoryValidation,
  clientValidation,
  cashRegisterOpenValidation,
  cashRegisterCloseValidation,
  arrangementValidation,
  eventValidation,
  idParamValidation,
  paginationValidation,
};
