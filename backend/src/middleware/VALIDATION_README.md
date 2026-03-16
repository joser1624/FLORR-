# Request Validation Middleware

## Overview

The request validation middleware provides comprehensive input validation and sanitization for all API endpoints using `express-validator`. It implements all requirements from Requirement 17: Input Validation and Sanitization.

## Features

✅ **Requirement 17.1**: Validates all required fields are present  
✅ **Requirement 17.2**: Validates data types match expected types  
✅ **Requirement 17.3**: Returns 400 errors with detailed validation messages  
✅ **Requirement 17.4**: Sanitizes string inputs to remove harmful characters  
✅ **Requirement 17.5**: Validates email format using standard regex  
✅ **Requirement 17.6**: Validates numeric fields are within acceptable ranges  
✅ **Requirement 17.7**: Validates date fields are in valid ISO 8601 format  

## Installation

The middleware is already installed and configured. Dependencies:

```json
{
  "express-validator": "^7.0.1"
}
```

## Usage

### Basic Example

```javascript
const express = require('express');
const router = express.Router();
const { validationRules, validateRequest } = require('../middleware/validateRequest');

// Define validation rules for your endpoint
const createProductValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.numericRange('precio', 'Precio', 0),
  validationRules.enum('categoria', 'Categoría', ['Ramos', 'Arreglos', 'Peluches']),
  validateRequest, // Always add this as the last item
];

// Apply validation to route
router.post('/productos', createProductValidation, productController.create);
```

### Error Response Format

When validation fails, the middleware returns a 400 status with this format:

```json
{
  "error": true,
  "mensaje": "Errores de validación",
  "detalles": [
    {
      "campo": "nombre",
      "mensaje": "Nombre es requerido"
    },
    {
      "campo": "precio",
      "mensaje": "Precio debe ser mayor o igual a 0"
    }
  ]
}
```

## Available Validation Rules

### String Validation

#### `requiredString(field, fieldName)`
Validates required string field with sanitization (trim + escape HTML).

```javascript
validationRules.requiredString('nombre', 'Nombre')
```

#### `optionalString(field, fieldName)`
Validates optional string field with sanitization.

```javascript
validationRules.optionalString('descripcion', 'Descripción')
```

### Email Validation

#### `email(field = 'email')`
Validates email format and normalizes to lowercase.

```javascript
validationRules.email('email')
```

### Numeric Validation

#### `numericRange(field, fieldName, min = 0, max = null)`
Validates numeric field with range constraints.

```javascript
validationRules.numericRange('precio', 'Precio', 0)
validationRules.numericRange('descuento', 'Descuento', 0, 100)
```

#### `optionalNumericRange(field, fieldName, min = 0, max = null)`
Validates optional numeric field with range constraints.

```javascript
validationRules.optionalNumericRange('cliente_id', 'ID de cliente', 1)
```

#### `integerRange(field, fieldName, min = 0, max = null)`
Validates integer field with range constraints.

```javascript
validationRules.integerRange('stock', 'Stock', 0)
validationRules.integerRange('cantidad', 'Cantidad', 1, 100)
```

### Date Validation

#### `isoDate(field, fieldName)`
Validates date in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ).

```javascript
validationRules.isoDate('fecha_entrega', 'Fecha de entrega')
```

#### `optionalIsoDate(field, fieldName)`
Validates optional date in ISO 8601 format.

```javascript
validationRules.optionalIsoDate('fecha_ingreso', 'Fecha de ingreso')
```

### Enum Validation

#### `enum(field, fieldName, allowedValues)`
Validates field must be one of allowed values.

```javascript
validationRules.enum('categoria', 'Categoría', ['Ramos', 'Arreglos', 'Peluches'])
```

#### `optionalEnum(field, fieldName, allowedValues)`
Validates optional enum field.

```javascript
validationRules.optionalEnum('tipo', 'Tipo', ['flores', 'materiales'])
```

### Boolean Validation

#### `boolean(field, fieldName)`
Validates boolean field.

```javascript
validationRules.boolean('activo', 'Activo')
```

#### `optionalBoolean(field, fieldName)`
Validates optional boolean field.

```javascript
validationRules.optionalBoolean('activa', 'Activa')
```

### Array Validation

#### `array(field, fieldName)`
Validates array field (must not be empty).

```javascript
validationRules.array('productos', 'Productos')
```

### Phone Validation

#### `phone(field = 'telefono')`
Validates phone number format (numbers and valid characters).

```javascript
validationRules.phone('telefono')
```

#### `optionalPhone(field = 'telefono')`
Validates optional phone number.

```javascript
validationRules.optionalPhone('telefono')
```

### Password Validation

#### `password(field = 'password', minLength = 6)`
Validates password with minimum length.

```javascript
validationRules.password('password', 6)
```

### Parameter Validation

#### `idParam(paramName = 'id')`
Validates URL parameter as positive integer.

```javascript
validationRules.idParam('id')
```

### Query Parameter Validation

#### `queryInt(field, fieldName, min = 1)`
Validates query parameter as integer.

```javascript
validationRules.queryInt('page', 'Página', 1)
validationRules.queryInt('limit', 'Límite', 1)
```

#### `queryString(field, fieldName)`
Validates query parameter as string with sanitization.

```javascript
validationRules.queryString('search', 'Búsqueda')
```

## Complete Examples

### Product Creation

```javascript
const productValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.optionalString('descripcion', 'Descripción'),
  validationRules.enum('categoria', 'Categoría', [
    'Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros'
  ]),
  validationRules.numericRange('precio', 'Precio', 0),
  validationRules.numericRange('costo', 'Costo', 0),
  validationRules.integerRange('stock', 'Stock', 0),
  validateRequest,
];

router.post('/productos', productValidation, productController.create);
```

### Sale Creation with Nested Array

```javascript
const { body } = require('../middleware/validateRequest');

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
    'Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia bancaria'
  ]),
  validateRequest,
];

router.post('/ventas', saleValidation, ventasController.create);
```

### Order Status Update

```javascript
const orderStatusValidation = [
  validationRules.enum('estado', 'Estado', [
    'pendiente', 'en preparación', 'listo para entrega', 'entregado', 'cancelado'
  ]),
  validateRequest,
];

router.put('/pedidos/:id', 
  validationRules.idParam('id'),
  orderStatusValidation,
  pedidosController.updateStatus
);
```

### Worker Creation

```javascript
const workerValidation = [
  validationRules.requiredString('nombre', 'Nombre'),
  validationRules.email('email'),
  validationRules.password('password', 6),
  validationRules.optionalPhone('telefono'),
  validationRules.requiredString('cargo', 'Cargo'),
  validationRules.enum('rol', 'Rol', ['admin', 'empleado', 'duena']),
  validateRequest,
];

router.post('/trabajadores', workerValidation, trabajadoresController.create);
```

### Pagination Query

```javascript
const paginationValidation = [
  validationRules.queryInt('page', 'Página', 1),
  validationRules.queryInt('limit', 'Límite', 1),
  validateRequest,
];

router.get('/productos', paginationValidation, productosController.list);
```

## Custom Validation

For custom validation logic, you can use the exported `body`, `param`, and `query` functions:

```javascript
const { body, validateRequest } = require('../middleware/validateRequest');

const customValidation = [
  body('fecha_hasta')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.fecha_desde)) {
        throw new Error('Fecha hasta debe ser posterior a fecha desde');
      }
      return true;
    }),
  validateRequest,
];
```

## Testing

Run the validation middleware tests:

```bash
npm test -- validateRequest.test.js
```

All 28 tests cover:
- Required field validation (17.1)
- Data type validation (17.2)
- Error response format (17.3)
- String sanitization (17.4)
- Email format validation (17.5)
- Numeric range validation (17.6)
- ISO 8601 date validation (17.7)

## Security Features

### String Sanitization
- **Trim**: Removes leading/trailing whitespace
- **Escape**: Converts HTML special characters to entities
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `&` → `&amp;`
  - `"` → `&quot;`
  - `'` → `&#x27;`

### Email Normalization
- Converts to lowercase
- Removes dots from Gmail addresses
- Standardizes format

### Input Validation
- Type checking prevents type confusion attacks
- Range validation prevents overflow/underflow
- Enum validation prevents invalid state transitions
- Array validation prevents empty submissions

## Pre-built Validation Sets

For convenience, common validation sets are available in `validation-examples.js`:

```javascript
const {
  productValidation,
  workerValidation,
  saleValidation,
  orderValidation,
  expenseValidation,
  // ... and more
} = require('../middleware/validation-examples');

router.post('/productos', productValidation, productController.create);
```

## Best Practices

1. **Always include `validateRequest` as the last item** in your validation array
2. **Use descriptive field names** in Spanish for user-facing error messages
3. **Validate at the route level** before reaching the controller
4. **Combine with authentication/authorization** middleware:
   ```javascript
   router.post('/productos', 
     verifyToken,           // Authentication
     requireRole('admin'),  // Authorization
     productValidation,     // Validation
     productController.create
   );
   ```
5. **Test your validation rules** with unit tests
6. **Use pre-built validation sets** from `validation-examples.js` when possible

## Files

- `validateRequest.js` - Main middleware and validation rules
- `validateRequest.test.js` - Comprehensive test suite (28 tests)
- `validation-examples.js` - Pre-built validation sets for all endpoints
- `VALIDATION_README.md` - This documentation

## Support

For questions or issues with validation, refer to:
- [express-validator documentation](https://express-validator.github.io/docs/)
- Design document: `.kiro/specs/complete-backend-system/design.md`
- Requirements: `.kiro/specs/complete-backend-system/requirements.md` (Requirement 17)
