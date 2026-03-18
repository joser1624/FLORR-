# Design Document: Frontend-Backend Integration with Inventory Deduction

## Overview

This design addresses the integration of frontend HTML pages with the existing backend REST API for the Florería Encantos Eternos system. The system currently has a fully functional backend with comprehensive API endpoints, but the frontend pages are not properly connected. Additionally, when arrangements (arreglos) are sold, the system does not deduct the raw materials (inventory items) used in the arrangement recipe.

### Problem Statement

1. Frontend pages (Inventario, Laboratorio, Productos, Ventas) make API calls but lack proper error handling and data synchronization
2. When an arrangement is sold, inventory items used in the recipe are not deducted from stock
3. No validation exists to prevent selling arrangements when insufficient inventory is available
4. Users are not informed that selling arrangements will affect inventory levels

### Solution Approach

This is a frontend-only solution that leverages existing backend endpoints without any backend modifications. The solution implements:

1. Proper API integration for all CRUD operations on inventory, products, and sales pages
2. Arrangement recipe retrieval system using existing `/api/arreglos/:id` endpoint
3. Stock validation before completing arrangement sales
4. Inventory deduction logic that updates stock via existing `/api/inventario/:id` endpoint
5. User confirmations and clear error messaging
6. Modular JavaScript functions for maintainability

### Key Constraints

- NO backend modifications allowed
- NO database schema changes
- Frontend-only implementation
- Must use existing API endpoints as-is
- Must handle all edge cases in frontend code

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Inventario   │  │ Laboratorio  │  │  Productos   │      │
│  │   Page       │  │    Page      │  │    Page      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Ventas Page   │                        │
│                    │  (Sales Logic) │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTP/JSON
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                    Backend REST API                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ /api/        │  │ /api/        │  │ /api/        │       │
│  │ inventario   │  │ arreglos     │  │ productos    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐                                            │
│  │ /api/ventas  │                                            │
│  └──────────────┘                                            │
└───────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ inventario   │  │ arreglos     │  │ productos    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ ventas       │  │ arreglos_    │                         │
│  │              │  │ inventario   │                         │
│  └──────────────┘  └──────────────┘                         │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow for Arrangement Sale

```
1. User selects arrangement product in Ventas page
   ↓
2. Frontend detects categoria === "Arreglos"
   ↓
3. Frontend shows confirmation dialog with inventory warning
   ↓
4. User confirms → Frontend retrieves recipe via GET /api/arreglos/:id
   ↓
5. Frontend validates stock for each inventory item
   ├─ Insufficient stock → Show error, abort sale
   └─ Sufficient stock → Continue
   ↓
6. Frontend creates sale via POST /api/ventas
   ↓
7. Sale successful → Frontend deducts inventory for each item
   ├─ For each item: PUT /api/inventario/:id with new stock
   └─ Log all operations
   ↓
8. Show success message with inventory update summary
```

## Components and Interfaces

### Frontend Components

#### 1. Inventario Page (`inventario.html`)

**Purpose**: Manage raw materials (flowers, materials, accessories)

**API Integration**:
- `GET /api/inventario` - Load all inventory items
- `POST /api/inventario` - Create new item
- `PUT /api/inventario/:id` - Update item (including stock adjustments)
- `DELETE /api/inventario/:id` - Delete item

**Key Functions**:
```javascript
async function cargarInventario()
async function guardarItem()
async function ajustarStock(id)
async function eliminarItem(id)
function renderAlertas() // Show low stock alerts
```

**Error Handling**:
- Network errors: Show toast notification, use fallback demo data
- Validation errors: Display specific field errors
- 401 Unauthorized: Redirect to login

#### 2. Laboratorio Page (`laboratorio.html`)

**Purpose**: Create custom arrangements with automatic cost/price calculation

**API Integration**:
- `GET /api/inventario` - Load available inventory for selection
- `POST /api/arreglos` - Save arrangement with recipe

**Key Functions**:
```javascript
async function cargarInventarioLab()
function cambiarQty(id, delta) // Adjust quantity with stock validation
function recalcular() // Recalculate price based on margin
function renderResumen() // Show cost, margin, price
async function guardarArreglo() // Save arrangement
```

**Data Structure**:
```javascript
// Arrangement payload
{
  nombre: string,
  margen: number, // 0-100
  costo: number,
  precio: number,
  receta: [
    { inventario_id: number, cantidad: number }
  ]
}
```

#### 3. Productos Page (`productos.html`)

**Purpose**: Manage final products catalog

**API Integration**:
- `GET /api/productos` - Load all products
- `POST /api/productos` - Create new product
- `PUT /api/productos/:id` - Update product
- `DELETE /api/productos/:id` - Soft delete product

**Key Functions**:
```javascript
async function cargarProductos()
function calcMargen() // Real-time margin calculation
async function guardarProducto(e)
async function editarProducto(id)
async function eliminarProducto(id, nombre)
```

**Margin Calculation**:
```javascript
margen_porcentaje = (precio - costo) / precio * 100
ganancia = precio - costo
```

#### 4. Ventas Page (`ventas.html`)

**Purpose**: Register sales with automatic stock deduction

**API Integration**:
- `GET /api/productos` - Load products for sale
- `POST /api/ventas` - Create sale
- `GET /api/arreglos/:id` - Retrieve arrangement recipe
- `GET /api/inventario/:id` - Check current stock
- `PUT /api/inventario/:id` - Deduct inventory

**Key Functions** (New/Modified):
```javascript
async function registrarVenta() // Enhanced with arrangement logic
async function obtenerReceta(arregloId)
async function validarStock(insumos)
async function descontarInsumos(insumos)
async function procesarVentaArreglo(producto, cantidad)
```

### API Endpoints (Existing - No Changes)

#### Inventario Endpoints

```
GET    /api/inventario
Response: { items: [{ id, nombre, tipo, stock, stock_min, unidad, costo }] }

GET    /api/inventario/:id
Response: { id, nombre, tipo, stock, stock_min, unidad, costo }

POST   /api/inventario
Body: { nombre, tipo, stock, costo, stock_min?, unidad? }
Response: { id, nombre, tipo, stock, stock_min, unidad, costo }

PUT    /api/inventario/:id
Body: { nombre?, tipo?, stock?, costo?, stock_min?, unidad? }
Response: { id, nombre, tipo, stock, stock_min, unidad, costo }

DELETE /api/inventario/:id
Response: { success: true }
```

#### Arreglos Endpoints

```
GET    /api/arreglos/:id
Response: {
  id, nombre, margen, costo_total, precio_venta,
  items: [
    { inventario_id, cantidad, nombre, costo }
  ]
}

POST   /api/arreglos
Body: {
  nombre, margen,
  costo?, precio?,
  receta: [{ inventario_id, cantidad }]
}
Response: { id, nombre, margen, costo_total, precio_venta }
```

#### Productos Endpoints

```
GET    /api/productos
Response: { productos: [{ id, nombre, categoria, precio, costo, stock, descripcion, activo }] }

POST   /api/productos
Body: { nombre, categoria, precio, costo, stock, descripcion? }
Response: { id, nombre, categoria, precio, costo, stock, descripcion, activo }

PUT    /api/productos/:id
Body: { nombre?, categoria?, precio?, costo?, stock?, descripcion? }
Response: { id, nombre, categoria, precio, costo, stock, descripcion, activo }

DELETE /api/productos/:id
Response: { success: true }
```

#### Ventas Endpoints

```
POST   /api/ventas
Body: {
  productos: [{ producto_id, cantidad, precio_unitario }],
  metodo_pago,
  trabajador_id,
  cliente_id?
}
Response: { id, fecha, total, metodo_pago, trabajador_id, cliente_id }
```

## Data Models

### Frontend Data Structures

#### Inventory Item
```javascript
{
  id: number,
  nombre: string,
  tipo: 'flores' | 'materiales' | 'accesorios',
  stock: number,
  stock_min: number,
  unidad: 'unidad' | 'docena' | 'metro' | 'rollo' | 'caja',
  costo: number
}
```

#### Arrangement Recipe
```javascript
{
  arreglo_id: number,
  nombre: string,
  margen: number,
  costo_total: number,
  precio_venta: number,
  items: [
    {
      inventario_id: number,
      cantidad: number,
      nombre: string,
      costo: number
    }
  ]
}
```

#### Product
```javascript
{
  id: number,
  nombre: string,
  categoria: 'Ramos' | 'Arreglos' | 'Peluches' | 'Cajas sorpresa' | 'Globos' | 'Otros',
  precio: number,
  costo: number,
  stock: number,
  descripcion: string,
  activo: boolean,
  arreglo_id?: number // Link to arrangement if categoria === 'Arreglos'
}
```

#### Sale Item
```javascript
{
  producto_id: number,
  nombre: string,
  categoria: string,
  cantidad: number,
  precio: number,
  arreglo_id?: number
}
```

#### Inventory Deduction Record
```javascript
{
  inventario_id: number,
  nombre: string,
  cantidad_requerida: number,
  stock_actual: number,
  stock_nuevo: number
}
```

### State Management

Each page maintains local state:

```javascript
// Inventario page
let items = []; // All inventory items
let tipoFiltro = ''; // Current filter
let soloBajoInv = false; // Show only low stock

// Laboratorio page
let inventario = []; // Available inventory
let seleccion = {}; // { inventario_id: cantidad }

// Productos page
let todosProductos = []; // All products
let categoriaActual = ''; // Current filter
let soloBajos = false; // Show only low stock

// Ventas page
let itemsVenta = []; // Current sale items
let productosDisp = []; // Available products
```


## Detailed Component Design

### Arrangement Sale Processing Module

This is the core new functionality that orchestrates the inventory deduction process.

#### Function: `obtenerReceta(arregloId)`

**Purpose**: Retrieve arrangement recipe from backend

**Parameters**:
- `arregloId`: number - The arrangement ID

**Returns**: Promise<Recipe>
```javascript
{
  items: [
    { inventario_id: number, cantidad: number, nombre: string, costo: number }
  ]
}
```

**Implementation**:
```javascript
async function obtenerReceta(arregloId) {
  try {
    const response = await API.get(`/arreglos/${arregloId}`);
    if (!response || !response.items || !Array.isArray(response.items)) {
      throw new Error('Receta inválida o vacía');
    }
    return response;
  } catch (error) {
    console.error('Error al obtener receta:', error);
    throw new Error('No se pudo obtener la receta del arreglo');
  }
}
```

**Error Handling**:
- Network error: Throw with user-friendly message
- Invalid response: Validate structure and throw
- Missing recipe: Throw specific error

#### Function: `validarStock(insumos)`

**Purpose**: Validate sufficient stock for all required inventory items

**Parameters**:
- `insumos`: Array<{ inventario_id, cantidad_requerida }>

**Returns**: Promise<ValidationResult>
```javascript
{
  valido: boolean,
  faltantes: [
    { nombre: string, requerido: number, disponible: number }
  ]
}
```

**Implementation**:
```javascript
async function validarStock(insumos) {
  const faltantes = [];
  
  for (const insumo of insumos) {
    try {
      const item = await API.get(`/inventario/${insumo.inventario_id}`);
      if (item.stock < insumo.cantidad_requerida) {
        faltantes.push({
          nombre: item.nombre,
          requerido: insumo.cantidad_requerida,
          disponible: item.stock
        });
      }
    } catch (error) {
      console.error(`Error al validar stock de ${insumo.inventario_id}:`, error);
      faltantes.push({
        nombre: `Item #${insumo.inventario_id}`,
        requerido: insumo.cantidad_requerida,
        disponible: 0
      });
    }
  }
  
  return {
    valido: faltantes.length === 0,
    faltantes
  };
}
```

**Validation Logic**:
1. For each inventory item in recipe
2. Fetch current stock from backend
3. Compare available vs required
4. Collect all items with insufficient stock
5. Return validation result

#### Function: `descontarInsumos(insumos)`

**Purpose**: Deduct inventory stock for all items in recipe

**Parameters**:
- `insumos`: Array<{ inventario_id, cantidad, stock_actual }>

**Returns**: Promise<DeductionResult>
```javascript
{
  exitoso: boolean,
  actualizados: number,
  errores: [
    { inventario_id: number, error: string }
  ]
}
```

**Implementation**:
```javascript
async function descontarInsumos(insumos) {
  const errores = [];
  let actualizados = 0;
  
  for (const insumo of insumos) {
    try {
      const nuevoStock = insumo.stock_actual - insumo.cantidad;
      await API.put(`/inventario/${insumo.inventario_id}`, {
        stock: nuevoStock
      });
      actualizados++;
      console.log(`✓ Descontado: ${insumo.nombre} (${insumo.cantidad} unidades)`);
    } catch (error) {
      console.error(`✗ Error al descontar ${insumo.nombre}:`, error);
      errores.push({
        inventario_id: insumo.inventario_id,
        nombre: insumo.nombre,
        error: error.message || 'Error desconocido'
      });
    }
  }
  
  return {
    exitoso: errores.length === 0,
    actualizados,
    errores
  };
}
```

**Deduction Logic**:
1. For each inventory item
2. Calculate new stock: current - quantity
3. Update via PUT /api/inventario/:id
4. Log success/failure
5. Continue even if one fails (no rollback)
6. Return summary of operations

#### Function: `procesarVentaArreglo(producto, cantidad)`

**Purpose**: Orchestrate complete arrangement sale process

**Parameters**:
- `producto`: Product object with arreglo_id
- `cantidad`: number - Quantity being sold

**Returns**: Promise<ProcessResult>

**Implementation**:
```javascript
async function procesarVentaArreglo(producto, cantidad) {
  // Step 1: Show confirmation dialog
  const confirmar = await mostrarConfirmacionArreglo(producto, cantidad);
  if (!confirmar) {
    return { cancelado: true };
  }
  
  // Step 2: Retrieve recipe
  let receta;
  try {
    receta = await obtenerReceta(producto.arreglo_id);
  } catch (error) {
    Toast.error('No se pudo obtener la receta del arreglo');
    return { error: error.message };
  }
  
  // Step 3: Calculate required quantities
  const insumos = receta.items.map(item => ({
    inventario_id: item.inventario_id,
    nombre: item.nombre,
    cantidad_requerida: item.cantidad * cantidad
  }));
  
  // Step 4: Validate stock
  const validacion = await validarStock(insumos);
  if (!validacion.valido) {
    mostrarErrorStockInsuficiente(validacion.faltantes);
    return { error: 'Stock insuficiente' };
  }
  
  // Step 5: Get current stock for each item
  const insumosConStock = await Promise.all(
    insumos.map(async (insumo) => {
      const item = await API.get(`/inventario/${insumo.inventario_id}`);
      return {
        ...insumo,
        stock_actual: item.stock
      };
    })
  );
  
  // Step 6: Create sale (this happens in registrarVenta)
  // Sale creation is handled by caller
  
  // Step 7: Deduct inventory
  const resultado = await descontarInsumos(insumosConStock);
  
  // Step 8: Show result
  if (resultado.exitoso) {
    Toast.success(`Venta registrada. Inventario actualizado (${resultado.actualizados} items)`);
  } else {
    Toast.warning(`Venta registrada, pero hubo errores al actualizar inventario (${resultado.errores.length} items)`);
  }
  
  return { exitoso: true, resultado };
}
```

**Process Flow**:
1. User confirmation with inventory warning
2. Retrieve arrangement recipe
3. Calculate total quantities needed (recipe × sale quantity)
4. Validate sufficient stock for all items
5. If insufficient: show error and abort
6. If sufficient: proceed with sale
7. After sale success: deduct inventory
8. Show success/error messages

### User Interface Components

#### Confirmation Dialog for Arrangement Sales

**Purpose**: Warn user that inventory will be deducted

**Design**:
```html
<div class="modal-overlay" id="modal-confirmar-arreglo">
  <div class="modal">
    <div class="modal-header">
      <h3>⚠️ Confirmar venta de arreglo</h3>
    </div>
    <div class="modal-body">
      <p>Esta venta descontará los siguientes insumos del inventario:</p>
      <ul id="lista-insumos-arreglo">
        <!-- Populated dynamically -->
      </ul>
      <p><strong>¿Desea continuar?</strong></p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="cancelarVentaArreglo()">Cancelar</button>
      <button class="btn btn-primary" onclick="confirmarVentaArreglo()">Confirmar venta</button>
    </div>
  </div>
</div>
```

**Behavior**:
- Shows list of inventory items that will be deducted
- Shows quantity for each item
- User must explicitly confirm or cancel
- Canceling aborts the entire sale

#### Error Display for Insufficient Stock

**Purpose**: Show clear error when stock is insufficient

**Design**:
```javascript
function mostrarErrorStockInsuficiente(faltantes) {
  const mensaje = `
    <div style="margin-bottom:1rem">
      <strong>Stock insuficiente para completar el arreglo</strong>
    </div>
    <div style="font-size:13px">
      ${faltantes.map(f => `
        <div style="padding:6px 0;border-bottom:1px solid var(--gris-100)">
          <strong>${f.nombre}</strong><br>
          Requerido: ${f.requerido} | Disponible: ${f.disponible}
        </div>
      `).join('')}
    </div>
  `;
  
  Modal.alert('Error de inventario', mensaje);
}
```

**Information Displayed**:
- Clear error title
- List of items with insufficient stock
- Required quantity vs available quantity for each
- Suggestion to adjust sale quantity or restock

### Integration Points

#### Modified `registrarVenta()` Function

**Current Implementation**: Creates sale without checking arrangements

**Enhanced Implementation**:
```javascript
async function registrarVenta() {
  if (!itemsVenta.length) {
    Toast.warning('Agrega al menos un producto');
    return;
  }
  
  // Check if any item is an arrangement
  const tieneArreglos = itemsVenta.some(item => item.categoria === 'Arreglos');
  
  if (tieneArreglos) {
    // Process each arrangement
    for (const item of itemsVenta) {
      if (item.categoria === 'Arreglos' && item.arreglo_id) {
        const resultado = await procesarVentaArreglo(item, item.cantidad);
        if (resultado.cancelado || resultado.error) {
          return; // Abort entire sale
        }
      }
    }
  }
  
  // Create sale
  const payload = {
    productos: itemsVenta.map(i => ({
      producto_id: i.id,
      cantidad: i.cantidad,
      precio_unitario: i.precio
    })),
    metodo_pago: document.getElementById('metodo-pago').value,
    trabajador_id: document.getElementById('venta-trabajador').value,
  };
  
  try {
    await API.post('/ventas', payload);
    
    // If arrangements exist, deduct inventory
    if (tieneArreglos) {
      for (const item of itemsVenta) {
        if (item.categoria === 'Arreglos' && item.arreglo_id) {
          // Inventory deduction happens in procesarVentaArreglo
          // Already completed above
        }
      }
    }
    
    Toast.success('Venta registrada correctamente');
    itemsVenta = [];
    renderItemsVenta();
    Modal.close('modal-venta');
    cargarVentas();
  } catch (error) {
    Toast.error('Error al registrar la venta');
    console.error(error);
  }
}
```

**Key Changes**:
1. Detect if sale contains arrangements
2. For each arrangement: validate stock before creating sale
3. If validation fails: abort entire sale
4. If validation passes: create sale
5. After sale success: deduct inventory
6. Show appropriate success/error messages

### Error Handling Strategy

#### Network Errors

**Scenario**: API request fails due to network issues

**Handling**:
```javascript
try {
  const response = await API.get('/inventario');
  // Process response
} catch (error) {
  if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
    Toast.error('Error de conexión. Verifica tu conexión a internet.');
  } else {
    Toast.error('Error al cargar datos del servidor');
  }
  console.error('Network error:', error);
  // Use fallback data if available
}
```

#### Validation Errors

**Scenario**: Backend returns 400 with validation errors

**Handling**:
```javascript
try {
  await API.post('/inventario', payload);
} catch (error) {
  if (error.status === 400 && error.detalles) {
    const mensajes = error.detalles.map(d => d.msg).join(', ');
    Toast.error(`Errores de validación: ${mensajes}`);
  } else {
    Toast.error('Error al guardar');
  }
}
```

#### Authorization Errors

**Scenario**: Token expired or invalid (401)

**Handling**:
```javascript
// In API utility
if (response.status === 401) {
  Toast.warning('Sesión expirada. Redirigiendo al login...');
  setTimeout(() => {
    window.location.href = '/pages/login.html';
  }, 1500);
  throw new Error('Unauthorized');
}
```

#### Partial Failure in Inventory Deduction

**Scenario**: Some inventory items update successfully, others fail

**Handling**:
- Do NOT rollback the sale (sale is already created)
- Log all failures
- Show warning to user with list of failed items
- Suggest manual inventory adjustment

```javascript
if (!resultado.exitoso) {
  const fallidosMsg = resultado.errores.map(e => e.nombre).join(', ');
  Toast.warning(
    `Venta registrada, pero no se pudo actualizar inventario para: ${fallidosMsg}. ` +
    `Por favor, ajusta manualmente en la página de Inventario.`
  );
}
```

### Logging Strategy

All arrangement sales and inventory operations are logged to browser console:

```javascript
console.group('🛒 Venta de Arreglo');
console.log('Producto:', producto.nombre);
console.log('Cantidad:', cantidad);
console.log('Receta:', receta);
console.log('Validación:', validacion);
console.log('Deducción:', resultado);
console.groupEnd();
```

**Log Levels**:
- `console.log()`: Normal operations
- `console.warn()`: Partial failures
- `console.error()`: Complete failures
- `console.group()`: Group related operations


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Error display properties (1.6, 2.6, 3.7, 4.6)**: All pages display errors the same way - can be combined into one property
2. **HTTP request properties (1.3, 1.4, 1.5, 2.3, 3.3, 3.4, 3.5, 4.3)**: All CRUD operations follow the same pattern - can be grouped
3. **Data display properties (1.2, 2.2, 3.2, 4.2)**: All pages display data in similar ways - can be combined
4. **Success message properties (2.5, 4.5, 7.5)**: All success messages follow the same pattern
5. **Logging properties (15.1, 15.2, 15.3, 15.4)**: All logging follows the same pattern - can be combined

The following properties represent the unique, non-redundant validation requirements:

### Property 1: API Request Configuration

*For any* API request (GET, POST, PUT, DELETE), the frontend shall use the correct HTTP method, include authentication token in Authorization header, set Content-Type to `application/json` for POST/PUT requests, and use base URL `http://localhost:3000`.

**Validates: Requirements 1.1, 1.3, 1.4, 1.5, 2.1, 2.3, 3.1, 3.3, 3.4, 3.5, 4.1, 4.3, 10.1, 10.2, 10.3, 10.4**

### Property 2: Error Display Consistency

*For any* backend error response, the frontend shall display the error message to the user via toast notification or modal dialog.

**Validates: Requirements 1.6, 2.6, 3.7, 4.6, 11.5**

### Property 3: Data Rendering

*For any* data returned from backend (inventory items, products, arrangements), the frontend shall render all items in the appropriate UI format (table, grid, or list).

**Validates: Requirements 1.2, 2.2, 3.2, 4.2**

### Property 4: Stock Alert Display

*For any* inventory item where stock ≤ stock_min, the frontend shall display a stock alert badge or notification.

**Validates: Requirements 1.7**

### Property 5: Request Payload Completeness

*For any* POST request to create an arrangement, the payload shall include nombre, margen, costo, precio, and receta array with inventario_id and cantidad for each item.

**Validates: Requirements 2.4**

### Property 6: Profit Margin Calculation

*For any* product with precio and costo values, the displayed profit margin shall equal `(precio - costo) / precio * 100`.

**Validates: Requirements 3.6**

### Property 7: Sale Payload Completeness

*For any* POST request to create a sale, the payload shall include productos array (with producto_id, cantidad, precio_unitario), metodo_pago, and trabajador_id.

**Validates: Requirements 4.4**

### Property 8: Arrangement Recipe Retrieval

*For any* product with categoria "Arreglos" being sold, the frontend shall send a GET request to `/api/arreglos/:id` to retrieve the recipe.

**Validates: Requirements 5.1**

### Property 9: Non-Arrangement Sale Processing

*For any* product without an arreglo_id or with categoria ≠ "Arreglos", the sale shall proceed without inventory deduction.

**Validates: Requirements 5.3**

### Property 10: Recipe Parsing

*For any* recipe response from `/api/arreglos/:id`, the frontend shall extract inventario_id and cantidad for each item in the items array.

**Validates: Requirements 5.4**

### Property 11: Required Quantity Calculation

*For any* arrangement sale, the required quantity for each inventory item shall equal `cantidad_receta × cantidad_vendida`.

**Validates: Requirements 6.1, 7.3**

### Property 12: Stock Validation Request

*For any* inventory item in an arrangement recipe, the frontend shall send a GET request to `/api/inventario/:id` to retrieve current stock before proceeding with the sale.

**Validates: Requirements 6.2**

### Property 13: Insufficient Stock Handling

*For any* arrangement sale where at least one inventory item has stock < required quantity, the frontend shall cancel the sale and display an error message listing all items with insufficient stock, including item name, required quantity, and available stock.

**Validates: Requirements 6.3, 6.4, 9.1, 9.2, 9.3, 9.4**

### Property 14: Sufficient Stock Continuation

*For any* arrangement sale where all inventory items have stock ≥ required quantity, the frontend shall proceed with creating the sale.

**Validates: Requirements 6.5**

### Property 15: Inventory Deduction After Sale

*For any* successful arrangement sale, the frontend shall send a PUT request to `/api/inventario/:id` for each inventory item in the recipe with updated stock value.

**Validates: Requirements 7.1, 7.2**

### Property 16: Partial Deduction Failure Handling

*For any* inventory deduction operation where at least one PUT request fails, the frontend shall display an error message but shall NOT reverse the sale.

**Validates: Requirements 7.4**

### Property 17: Arrangement Sale Confirmation Dialog

*For any* attempt to sell a product with categoria "Arreglos", the frontend shall display a confirmation dialog stating "Esta venta descontará insumos del inventario" and listing all inventory items with their quantities.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 18: Confirmation Acceptance

*For any* confirmed arrangement sale (user clicks confirm), the frontend shall proceed with stock validation and sale processing.

**Validates: Requirements 8.4**

### Property 19: Confirmation Cancellation

*For any* cancelled arrangement sale (user clicks cancel), the frontend shall abort the sale without making any backend requests.

**Validates: Requirements 8.5**

### Property 20: Unauthorized Redirect

*For any* API response with status 401, the frontend shall redirect the user to the login page.

**Validates: Requirements 10.5**

### Property 21: Recipe Retrieval Function

*For any* arreglo ID, the function `obtenerReceta(arregloId)` shall return a promise that resolves to a recipe object with an items array.

**Validates: Requirements 11.1**

### Property 22: Stock Validation Function

*For any* array of insumos (with inventario_id and cantidad_requerida), the function `validarStock(insumos)` shall return a promise that resolves to a validation result indicating whether all items have sufficient stock.

**Validates: Requirements 11.2**

### Property 23: Inventory Deduction Function

*For any* array of insumos (with inventario_id, cantidad, stock_actual), the function `descontarInsumos(insumos)` shall send PUT requests to update stock for all items and return a result indicating success/failure for each.

**Validates: Requirements 11.3**

### Property 24: Sale Processing Orchestration

*For any* product and quantity, the function `procesarVentaArreglo(producto, cantidad)` shall orchestrate the complete process: confirmation, recipe retrieval, stock validation, sale creation, and inventory deduction.

**Validates: Requirements 11.4**

### Property 25: Recipe Validation

*For any* recipe response, the frontend shall validate that each item contains a positive integer inventario_id and a positive number cantidad, and shall abort the sale if validation fails.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

### Property 26: Conflict Retry

*For any* 409 Conflict response during stock validation, the frontend shall retry the stock validation once.

**Validates: Requirements 14.4, 14.5**

### Property 27: Arrangement Sale Logging

*For any* arrangement sale, the frontend shall log to console: sale details (producto_id, cantidad, timestamp), recipe retrieval, stock validation results, inventory deduction operations (inventario_id, cantidad_deducted, new stock), and any errors encountered.

**Validates: Requirements 15.1, 15.2, 15.3, 15.4**


## Error Handling

### Error Categories

#### 1. Network Errors

**Scenario**: API request fails due to network connectivity issues

**Detection**:
```javascript
catch (error) {
  if (error.message.includes('NetworkError') || 
      error.message.includes('Failed to fetch') ||
      error.name === 'TypeError') {
    // Network error
  }
}
```

**Handling**:
- Display user-friendly error message: "Error de conexión. Verifica tu conexión a internet."
- Log detailed error to console
- Use fallback demo data if available (for development/demo purposes)
- Do NOT proceed with operations that modify data

**User Impact**: User sees error toast, can retry operation manually

#### 2. Validation Errors (400)

**Scenario**: Backend rejects request due to invalid data

**Detection**:
```javascript
if (response.status === 400 && response.detalles) {
  // Validation error
}
```

**Handling**:
- Parse validation error details from response
- Display specific field errors to user
- Highlight problematic form fields
- Allow user to correct and resubmit

**User Impact**: User sees specific validation errors, can fix and retry

#### 3. Authorization Errors (401)

**Scenario**: Authentication token is missing, expired, or invalid

**Detection**:
```javascript
if (response.status === 401) {
  // Unauthorized
}
```

**Handling**:
- Display message: "Sesión expirada. Redirigiendo al login..."
- Wait 1.5 seconds
- Redirect to `/pages/login.html`
- Clear any cached authentication data

**User Impact**: User is redirected to login page, must re-authenticate

#### 4. Not Found Errors (404)

**Scenario**: Requested resource does not exist

**Detection**:
```javascript
if (response.status === 404) {
  // Not found
}
```

**Handling**:
- Display message: "Recurso no encontrado"
- Log error details
- Return to previous state
- Suggest user refresh the page

**User Impact**: User sees error, can navigate away or refresh

#### 5. Conflict Errors (409)

**Scenario**: Concurrent modification detected (e.g., stock changed during sale)

**Detection**:
```javascript
if (response.status === 409) {
  // Conflict
}
```

**Handling**:
- Retry stock validation once
- If still fails: display error with updated stock information
- Suggest user adjust quantity or cancel

**User Impact**: System attempts automatic retry, user may need to adjust sale

#### 6. Server Errors (500)

**Scenario**: Backend internal error

**Detection**:
```javascript
if (response.status >= 500) {
  // Server error
}
```

**Handling**:
- Display message: "Error del servidor. Intenta nuevamente en unos momentos."
- Log full error details
- Do NOT retry automatically
- Suggest user contact support if persists

**User Impact**: User sees error, must retry manually or contact support

### Specific Error Scenarios

#### Insufficient Stock Error

**Trigger**: Stock validation fails for arrangement sale

**Display**:
```
┌─────────────────────────────────────────┐
│ ⚠️ Stock insuficiente para completar    │
│    el arreglo                           │
├─────────────────────────────────────────┤
│ Rosas rojas                             │
│ Requerido: 12 | Disponible: 8           │
│                                         │
│ Papel decorativo                        │
│ Requerido: 2 | Disponible: 1            │
├─────────────────────────────────────────┤
│ [Ajustar cantidad] [Cancelar]           │
└─────────────────────────────────────────┘
```

**Actions**:
- Sale is NOT created
- User can adjust quantity or cancel
- No backend modifications made

#### Partial Inventory Deduction Failure

**Trigger**: Some inventory PUT requests succeed, others fail

**Display**:
```
⚠️ Venta registrada, pero no se pudo actualizar 
inventario para: Rosas rojas, Papel decorativo.
Por favor, ajusta manualmente en la página de Inventario.
```

**Actions**:
- Sale IS created (cannot be reversed)
- Successful deductions remain
- Failed items logged to console
- User must manually adjust inventory

**Rationale**: Sale is already recorded in database and potentially affects cash register, customer records, etc. Reversing would create data inconsistency.

#### Malformed Recipe Error

**Trigger**: Recipe response missing required fields or has invalid data

**Display**:
```
❌ Error: Receta del arreglo inválida o incompleta.
No se puede procesar la venta.
```

**Actions**:
- Sale is NOT created
- Error logged with recipe details
- User notified to contact administrator
- Suggest checking arrangement configuration

#### Recipe Retrieval Failure

**Trigger**: GET /api/arreglos/:id fails

**Display**:
```
❌ No se pudo obtener la receta del arreglo.
Verifica tu conexión e intenta nuevamente.
```

**Actions**:
- Sale is NOT created
- Error logged
- User can retry
- If persists, suggest manual inventory adjustment

### Error Recovery Strategies

#### Automatic Recovery

**Applicable to**:
- 409 Conflict errors (retry once)
- Temporary network errors (if implementing retry logic)

**Not applicable to**:
- Validation errors (require user correction)
- Authorization errors (require re-authentication)
- Insufficient stock (require user decision)

#### Manual Recovery

**User actions**:
- Retry operation
- Correct invalid data
- Adjust quantities
- Re-authenticate
- Contact administrator

**Administrator actions**:
- Manually adjust inventory
- Fix arrangement recipes
- Investigate server errors
- Review error logs

### Error Logging

All errors are logged to browser console with structured format:

```javascript
console.group('❌ Error: [Operation Name]');
console.error('Type:', errorType);
console.error('Message:', errorMessage);
console.error('Details:', errorDetails);
console.error('Timestamp:', new Date().toISOString());
console.error('Stack:', error.stack);
console.groupEnd();
```

**Log Levels**:
- `console.error()`: Critical errors that prevent operation
- `console.warn()`: Partial failures or recoverable issues
- `console.log()`: Normal operations and state changes
- `console.info()`: Informational messages

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
**Property Tests**: Verify universal properties across all inputs

Both are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

#### Library Selection

**JavaScript/Browser Environment**: Use **fast-check** library

```bash
npm install --save-dev fast-check
```

**Why fast-check**:
- Designed for JavaScript/TypeScript
- Runs in browser and Node.js
- Excellent arbitrary generators
- Shrinking support for minimal failing examples
- Active maintenance and good documentation

#### Test Configuration

Each property test must:
- Run minimum 100 iterations (due to randomization)
- Include a comment tag referencing the design property
- Use appropriate generators for input data
- Verify the property holds for all generated inputs

**Tag Format**:
```javascript
// Feature: frontend-backend-integration-inventory-discount, Property 1: API Request Configuration
```

#### Example Property Tests

**Property 1: API Request Configuration**

```javascript
// Feature: frontend-backend-integration-inventory-discount, Property 1: API Request Configuration
test('API requests use correct configuration', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        endpoint: fc.constantFrom('/inventario', '/productos', '/arreglos', '/ventas'),
        hasBody: fc.boolean()
      }),
      async ({ method, endpoint, hasBody }) => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({})
        });
        global.fetch = mockFetch;
        
        const body = hasBody && (method === 'POST' || method === 'PUT') 
          ? { test: 'data' } 
          : undefined;
        
        await API[method.toLowerCase()](endpoint, body);
        
        const call = mockFetch.mock.calls[0];
        const [url, options] = call;
        
        // Verify base URL
        expect(url).toContain('http://localhost:3000');
        
        // Verify auth token
        expect(options.headers['Authorization']).toBeDefined();
        
        // Verify Content-Type for POST/PUT
        if (method === 'POST' || method === 'PUT') {
          expect(options.headers['Content-Type']).toBe('application/json');
        }
        
        // Verify HTTP method
        expect(options.method).toBe(method);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 6: Profit Margin Calculation**

```javascript
// Feature: frontend-backend-integration-inventory-discount, Property 6: Profit Margin Calculation
test('profit margin calculation is correct for all prices and costs', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0.01, max: 10000, noNaN: true }),
      fc.float({ min: 0.01, max: 10000, noNaN: true }),
      (precio, costo) => {
        const margen = (precio - costo) / precio * 100;
        const calculated = calcularMargen(precio, costo);
        
        // Allow small floating point differences
        expect(Math.abs(calculated - margen)).toBeLessThan(0.01);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 11: Required Quantity Calculation**

```javascript
// Feature: frontend-backend-integration-inventory-discount, Property 11: Required Quantity Calculation
test('required quantity calculation is correct', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 100 }), // cantidad_receta
      fc.integer({ min: 1, max: 50 }),  // cantidad_vendida
      (cantidadReceta, cantidadVendida) => {
        const expected = cantidadReceta * cantidadVendida;
        const calculated = calcularCantidadRequerida(cantidadReceta, cantidadVendida);
        
        expect(calculated).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 25: Recipe Validation**

```javascript
// Feature: frontend-backend-integration-inventory-discount, Property 25: Recipe Validation
test('recipe validation rejects invalid recipes', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          inventario_id: fc.oneof(
            fc.integer({ min: 1, max: 1000 }),
            fc.constant(-1),
            fc.constant(0),
            fc.constant(null)
          ),
          cantidad: fc.oneof(
            fc.float({ min: 0.1, max: 100 }),
            fc.constant(-1),
            fc.constant(0),
            fc.constant(null)
          )
        })
      ),
      (recipeItems) => {
        const result = validarReceta(recipeItems);
        
        const hasInvalidId = recipeItems.some(
          item => !item.inventario_id || item.inventario_id <= 0
        );
        const hasInvalidCantidad = recipeItems.some(
          item => !item.cantidad || item.cantidad <= 0
        );
        
        if (hasInvalidId || hasInvalidCantidad) {
          expect(result.valido).toBe(false);
          expect(result.error).toBeDefined();
        } else {
          expect(result.valido).toBe(true);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Unit tests focus on specific examples, edge cases, and integration points.

#### Example Unit Tests

**Insufficient Stock Error Display**

```javascript
test('displays insufficient stock error with correct details', async () => {
  const faltantes = [
    { nombre: 'Rosas rojas', requerido: 12, disponible: 8 },
    { nombre: 'Papel decorativo', requerido: 2, disponible: 1 }
  ];
  
  mostrarErrorStockInsuficiente(faltantes);
  
  expect(screen.getByText(/Stock insuficiente/i)).toBeInTheDocument();
  expect(screen.getByText(/Rosas rojas/i)).toBeInTheDocument();
  expect(screen.getByText(/Requerido: 12/i)).toBeInTheDocument();
  expect(screen.getByText(/Disponible: 8/i)).toBeInTheDocument();
});
```

**Confirmation Dialog Display**

```javascript
test('shows confirmation dialog for arrangement sales', async () => {
  const producto = {
    id: 1,
    nombre: 'Arreglo primaveral',
    categoria: 'Arreglos',
    arreglo_id: 5
  };
  
  await mostrarConfirmacionArreglo(producto, 2);
  
  expect(screen.getByText(/Esta venta descontará insumos del inventario/i))
    .toBeInTheDocument();
});
```

**Partial Deduction Failure**

```javascript
test('shows warning when some inventory deductions fail', async () => {
  const insumos = [
    { inventario_id: 1, nombre: 'Rosas', cantidad: 5, stock_actual: 10 },
    { inventario_id: 2, nombre: 'Papel', cantidad: 2, stock_actual: 5 }
  ];
  
  // Mock API to fail for second item
  API.put = jest.fn()
    .mockResolvedValueOnce({ success: true })
    .mockRejectedValueOnce(new Error('Network error'));
  
  const resultado = await descontarInsumos(insumos);
  
  expect(resultado.exitoso).toBe(false);
  expect(resultado.actualizados).toBe(1);
  expect(resultado.errores).toHaveLength(1);
  expect(resultado.errores[0].nombre).toBe('Papel');
});
```

**401 Redirect**

```javascript
test('redirects to login on 401 response', async () => {
  const mockResponse = { status: 401 };
  
  delete window.location;
  window.location = { href: '' };
  
  await handleAPIResponse(mockResponse);
  
  await waitFor(() => {
    expect(window.location.href).toBe('/pages/login.html');
  }, { timeout: 2000 });
});
```

**Empty Recipe Handling**

```javascript
test('aborts sale when recipe is empty', async () => {
  const receta = { items: [] };
  
  const resultado = await procesarVentaArreglo(
    { id: 1, arreglo_id: 5, categoria: 'Arreglos' },
    1
  );
  
  expect(resultado.error).toBeDefined();
  expect(resultado.error).toContain('vacía');
});
```

### Test Coverage Goals

**Minimum Coverage**:
- Line coverage: 80%
- Branch coverage: 75%
- Function coverage: 90%

**Critical Paths** (must have 100% coverage):
- `procesarVentaArreglo()`
- `validarStock()`
- `descontarInsumos()`
- `obtenerReceta()`
- Error handling in all API calls

### Testing Tools

**Test Runner**: Jest
**Assertion Library**: Jest (built-in)
**Property Testing**: fast-check
**DOM Testing**: @testing-library/dom
**Mocking**: Jest (built-in)

### Test Organization

```
tests/
├── unit/
│   ├── inventario.test.js
│   ├── laboratorio.test.js
│   ├── productos.test.js
│   ├── ventas.test.js
│   └── api-utils.test.js
├── properties/
│   ├── api-requests.property.test.js
│   ├── calculations.property.test.js
│   ├── validation.property.test.js
│   └── inventory-deduction.property.test.js
└── integration/
    └── arrangement-sale-flow.test.js
```

### Manual Testing Checklist

In addition to automated tests, manual testing should verify:

1. ✅ UI displays correctly in different browsers (Chrome, Firefox, Safari)
2. ✅ Toast notifications appear and disappear correctly
3. ✅ Modal dialogs are properly centered and responsive
4. ✅ Loading states show during API calls
5. ✅ Error messages are user-friendly and actionable
6. ✅ Confirmation dialogs prevent accidental actions
7. ✅ Stock alerts are visually prominent
8. ✅ Console logs are helpful for debugging
9. ✅ Page performance is acceptable (< 2s load time)
10. ✅ Accessibility: keyboard navigation works, screen reader compatible

