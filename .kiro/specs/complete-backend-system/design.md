# Design Document: Complete Backend System

## Overview

This document describes the technical design for the complete backend system of "Florería Encantos Eternos" (Eternal Charms Flower Shop). The system is a RESTful API built with Node.js, Express.js, and PostgreSQL that provides comprehensive business management capabilities for a flower shop.

### System Purpose

The backend serves as the central data and business logic layer for a flower shop management system, handling:
- User authentication and role-based authorization
- Product catalog and inventory management
- Sales transaction processing with automatic stock deduction
- Customer order tracking with status workflow
- Client relationship management
- Employee account management
- Business expense tracking
- Financial reporting and analytics
- Daily cash register operations
- Custom flower arrangement recipes
- Promotional campaigns
- Special events calendar

### Key Design Goals

1. **Security**: JWT-based authentication, bcrypt password hashing, parameterized queries, security headers
2. **Performance**: Sub-200ms CRUD operations, connection pooling, database indexes, pagination
3. **Maintainability**: Clean layered architecture (routes → controllers → services → database)
4. **Data Integrity**: Database transactions, foreign key constraints, check constraints, audit timestamps
5. **Scalability**: Support for 50+ concurrent requests, efficient query patterns
6. **Reliability**: Comprehensive error handling, logging, health monitoring

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken 9.0+)
- **Password Hashing**: bcrypt (bcryptjs 2.4+)
- **Security**: helmet 7.1+, cors 2.8+
- **Validation**: express-validator 7.0+
- **Logging**: morgan 1.10+
- **Environment**: dotenv 16.3+

## Architecture

### High-Level Architecture

The system follows a clean layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
│              (Admin Panel, POS, Mobile App)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/JSON
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Security Middleware                       │
│         (Helmet, CORS, Rate Limiting, Auth)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Routes Layer                            │
│    (URL routing, request parsing, validation)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controllers Layer                          │
│    (Request handling, response formatting)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│    (Business logic, data validation, transactions)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│         (PostgreSQL with connection pooling)                 │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Dependency Direction**: Dependencies flow downward (routes → controllers → services → database)
3. **Stateless Design**: No session state stored on server (JWT tokens carry user context)
4. **Database-Centric**: PostgreSQL enforces data integrity through constraints and triggers
5. **Error Propagation**: Errors bubble up through layers to centralized error handler

### Request Flow

1. **Request arrives** at Express server
2. **Security middleware** applies headers, CORS, rate limiting
3. **Authentication middleware** validates JWT token (if required)
4. **Authorization middleware** checks user role permissions
5. **Validation middleware** validates request body/params/query
6. **Route handler** forwards to appropriate controller
7. **Controller** extracts request data, calls service layer
8. **Service** executes business logic, interacts with database
9. **Database** executes queries, returns results
10. **Service** processes results, returns to controller
11. **Controller** formats response, sends to client
12. **Error handler** catches any errors, formats error response

## Components and Interfaces

### 1. Authentication Module

**Purpose**: Manages user authentication and JWT token generation/validation.

**Components**:
- `auth.routes.js`: Defines authentication endpoints
- `auth.controller.js`: Handles login/logout requests
- `auth.service.js`: Implements authentication logic
- `auth.js` (middleware): Validates JWT tokens and enforces authorization

**Key Interfaces**:

```javascript
// POST /api/auth/login
Request: {
  email: string,
  password: string
}
Response: {
  success: true,
  token: string,
  user: {
    id: number,
    nombre: string,
    email: string,
    rol: 'admin' | 'empleado' | 'duena',
    cargo: string
  }
}

// GET /api/auth/me (requires authentication)
Response: {
  success: true,
  user: { id, nombre, email, rol, cargo }
}
```

**Security Features**:
- bcrypt password hashing with 10 salt rounds
- JWT tokens with 24-hour expiration
- Token payload includes: id, email, rol, nombre
- Password minimum length: 6 characters
- Account status validation (activo field)

### 2. Dashboard Module

**Purpose**: Provides real-time business statistics and metrics.

**Components**:
- `dashboard.routes.js`: Defines dashboard endpoint
- `dashboard.controller.js`: Handles dashboard requests
- `dashboard.service.js`: Aggregates data from multiple tables

**Key Interface**:

```javascript
// GET /api/dashboard (requires authentication)
Response: {
  success: true,
  data: {
    ventas_dia: number,
    ventas_mes: number,
    ganancia_mes: number,
    margen_mes: number,
    pedidos_pendientes: number,
    pedidos_hoy: number,
    stock_bajo: Array<{id, nombre, tipo, stock, stock_min}>,
    ventas_semana: Array<{fecha, total}>,
    top_productos: Array<{id, nombre, cantidad_vendida}>,
    ventas_trabajadores: Array<{trabajador_id, nombre, total_ventas}>
  }
}
```

**Performance Requirements**:
- Response time: < 2 seconds
- Efficient aggregation queries with proper indexes
- Caching strategy for frequently accessed metrics (future enhancement)

### 3. Products Module

**Purpose**: Manages product catalog with CRUD operations and stock tracking.

**Components**:
- `productos.routes.js`: Defines product endpoints
- `productos.controller.js`: Handles product requests
- `productos.service.js`: Implements product business logic

**Key Interfaces**:

```javascript
// GET /api/productos
Query params: { categoria?, activo?, page?, limit? }
Response: {
  success: true,
  productos: Array<Product>,
  total: number,
  page: number,
  limit: number
}

// POST /api/productos (requires admin role)
Request: {
  nombre: string,
  descripcion?: string,
  categoria: 'Ramos' | 'Arreglos' | 'Peluches' | 'Cajas sorpresa' | 'Globos' | 'Otros',
  precio: number,
  costo: number,
  stock: number,
  imagen_url?: string
}

// PUT /api/productos/:id (requires admin role)
// DELETE /api/productos/:id (requires admin role) - soft delete
```

**Business Rules**:
- precio >= 0
- costo >= 0
- stock >= 0
- categoria must be valid enum value
- Soft delete (sets activo = false)
- Preserve created_at on updates

### 4. Inventory Module

**Purpose**: Manages flowers and materials inventory with stock alerts.

**Components**:
- `inventario.routes.js`: Defines inventory endpoints
- `inventario.controller.js`: Handles inventory requests
- `inventario.service.js`: Implements inventory business logic

**Key Interfaces**:

```javascript
// GET /api/inventario
Query params: { tipo?, stock_bajo?, page?, limit? }
Response: {
  success: true,
  inventario: Array<InventoryItem>
}

// POST /api/inventario (requires admin role)
Request: {
  nombre: string,
  tipo: 'flores' | 'materiales' | 'accesorios',
  stock: number,
  stock_min: number,
  unidad: 'unidad' | 'docena' | 'metro' | 'rollo' | 'caja',
  costo: number
}
```

**Business Rules**:
- stock >= 0
- costo >= 0
- Low stock alert when stock <= stock_min
- tipo must be valid enum value

### 5. Sales Module

**Purpose**: Processes sales transactions with automatic stock deduction and transaction safety.

**Components**:
- `ventas.routes.js`: Defines sales endpoints
- `ventas.controller.js`: Handles sales requests
- `ventas.service.js`: Implements sales business logic with transactions

**Key Interfaces**:

```javascript
// POST /api/ventas (requires empleado or admin role)
Request: {
  productos: Array<{
    producto_id: number,
    cantidad: number,
    precio_unitario: number
  }>,
  metodo_pago: 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta' | 'Transferencia bancaria',
  cliente_id?: number
}
Response: {
  success: true,
  venta: { id, total, fecha },
  mensaje: string
}

// GET /api/ventas
Query params: { fecha?, metodo_pago?, trabajador_id?, page?, limit? }
```

**Business Rules**:
- Must use database transaction for atomicity
- Validate stock availability before processing
- Deduct stock from productos table
- Create ventas_productos records for each item
- Calculate total as sum of subtotals
- Record trabajador_id from authenticated user
- Rollback on any error

**Transaction Flow**:
1. BEGIN TRANSACTION
2. Validate all products exist and have sufficient stock
3. INSERT into ventas table
4. INSERT into ventas_productos for each item
5. UPDATE productos SET stock = stock - cantidad for each item
6. COMMIT TRANSACTION
7. On error: ROLLBACK TRANSACTION

### 6. Orders Module

**Purpose**: Manages customer orders with status workflow tracking.

**Components**:
- `pedidos.routes.js`: Defines order endpoints
- `pedidos.controller.js`: Handles order requests
- `pedidos.service.js`: Implements order business logic

**Key Interfaces**:

```javascript
// POST /api/pedidos (requires empleado or admin role)
Request: {
  cliente_nombre: string,
  cliente_telefono: string,
  direccion?: string,
  fecha_entrega: date,
  descripcion: string,
  total: number,
  metodo_pago?: string,
  cliente_id?: number
}

// PUT /api/pedidos/:id (update status)
Request: {
  estado: 'pendiente' | 'en preparación' | 'listo para entrega' | 'entregado' | 'cancelado'
}

// GET /api/pedidos
Query params: { estado?, cliente_telefono?, fecha_entrega?, page?, limit? }
```

**Status Workflow**:
```
pendiente → en preparación → listo para entrega → entregado
     ↓              ↓                  ↓
  cancelado     cancelado          cancelado
```

**Business Rules**:
- Default estado: 'pendiente'
- fecha_pedido set to current timestamp
- trabajador_id recorded from authenticated user
- Orders sorted by fecha_entrega ascending for pending view

### 7. Clients Module

**Purpose**: Manages customer contact information and purchase history.

**Components**:
- `clientes.routes.js`: Defines client endpoints
- `clientes.controller.js`: Handles client requests
- `clientes.service.js`: Implements client business logic

**Key Interfaces**:

```javascript
// POST /api/clientes
Request: {
  nombre: string,
  telefono: string,
  direccion?: string,
  email?: string
}

// GET /api/clientes
Query params: { page?, limit? }

// GET /api/clientes/telefono/:telefono
```

**Business Rules**:
- telefono is required for quick lookup
- Support pagination for large client lists
- Track purchase history through ventas and pedidos relationships

### 8. Workers Module

**Purpose**: Manages employee accounts with role-based access control.

**Components**:
- `trabajadores.routes.js`: Defines worker endpoints
- `trabajadores.controller.js`: Handles worker requests
- `trabajadores.service.js`: Implements worker business logic

**Key Interfaces**:

```javascript
// POST /api/trabajadores (requires admin role)
Request: {
  nombre: string,
  email: string,
  password: string,
  telefono?: string,
  cargo: string,
  rol: 'admin' | 'empleado' | 'duena',
  fecha_ingreso?: date
}

// PUT /api/trabajadores/:id (requires admin role)
// DELETE /api/trabajadores/:id (requires admin role) - soft delete
```

**Business Rules**:
- email must be unique
- password hashed with bcrypt (10 salt rounds)
- Minimum password length: 6 characters
- Soft delete (sets activo = false)
- Only admin role can manage workers

### 9. Expenses Module

**Purpose**: Tracks business expenses for profitability calculations.

**Components**:
- `gastos.routes.js`: Defines expense endpoints
- `gastos.controller.js`: Handles expense requests
- `gastos.service.js`: Implements expense business logic

**Key Interfaces**:

```javascript
// POST /api/gastos (requires admin or duena role)
Request: {
  descripcion: string,
  categoria: 'flores' | 'transporte' | 'materiales' | 'mantenimiento' | 'otros',
  monto: number,
  fecha: date
}

// GET /api/gastos
Query params: { mes?, categoria?, page?, limit? }
```

**Business Rules**:
- monto >= 0
- categoria must be valid enum value
- Support filtering by month (YYYY-MM format)

### 10. Reports Module

**Purpose**: Generates monthly business reports and analytics.

**Components**:
- `reportes.routes.js`: Defines report endpoints
- `reportes.controller.js`: Handles report requests
- `reportes.service.js`: Implements report aggregation logic

**Key Interface**:

```javascript
// GET /api/reportes?mes=YYYY-MM (requires admin or duena role)
Response: {
  success: true,
  reporte: {
    mes: string,
    ventas_total: number,
    gastos_total: number,
    ganancia: number,
    margen: number,
    total_pedidos: number,
    ventas_dias: Array<{fecha, total}>,
    metodos_pago: Array<{metodo, total}>,
    top_productos: Array<{id, nombre, cantidad, total}>,
    ventas_trabajadores: Array<{trabajador_id, nombre, total}>
  }
}
```

**Performance Requirements**:
- Response time: < 3 seconds
- Efficient date range queries with indexes
- Aggregation at database level

### 11. Cash Register Module

**Purpose**: Manages daily cash register operations with opening/closing reconciliation.

**Components**:
- `caja.routes.js`: Defines cash register endpoints
- `caja.controller.js`: Handles cash register requests
- `caja.service.js`: Implements cash register business logic

**Key Interfaces**:

```javascript
// POST /api/caja/apertura (requires empleado or admin role)
Request: {
  monto_apertura: number
}

// POST /api/caja/cierre (requires empleado or admin role)
Request: {
  monto_cierre: number
}

// GET /api/caja/hoy
Response: {
  success: true,
  caja: {
    id, fecha, estado,
    monto_apertura, monto_cierre,
    total_efectivo, total_digital, total_tarjeta,
    total_ventas, total_gastos
  }
}
```

**Business Rules**:
- Only one open register per date
- Calculate totals by payment method on close
- Record trabajador_apertura_id and trabajador_cierre_id
- fecha must be unique (enforced by database)

**Closing Calculations**:
- total_efectivo = SUM(ventas WHERE metodo_pago = 'Efectivo')
- total_digital = SUM(ventas WHERE metodo_pago IN ('Yape', 'Plin'))
- total_tarjeta = SUM(ventas WHERE metodo_pago IN ('Tarjeta', 'Transferencia bancaria'))
- total_ventas = total_efectivo + total_digital + total_tarjeta
- total_gastos = SUM(gastos WHERE fecha = current_date)

### 12. Arrangements Module

**Purpose**: Manages custom flower arrangements with ingredient recipes and cost calculations.

**Components**:
- `arreglos.routes.js`: Defines arrangement endpoints
- `arreglos.controller.js`: Handles arrangement requests
- `arreglos.service.js`: Implements arrangement business logic

**Key Interfaces**:

```javascript
// POST /api/arreglos (requires admin role)
Request: {
  nombre: string,
  margen: number, // percentage 0-100
  receta: Array<{
    inventario_id: number,
    cantidad: number
  }>
}

// GET /api/arreglos/:id
Response: {
  success: true,
  arreglo: {
    id, nombre, margen, costo_total, precio_venta,
    receta: Array<{
      inventario_id, nombre, tipo, cantidad, costo_unitario
    }>
  }
}
```

**Business Rules**:
- margen must be between 0 and 100
- costo_total = SUM(inventario.costo × cantidad) for all recipe items
- precio_venta = costo_total × (1 + margen/100)
- Recalculate costs when recipe or inventory costs change

### 13. Promotions Module

**Purpose**: Manages promotional campaigns with date ranges and discount types.

**Components**:
- `promociones.routes.js`: Defines promotion endpoints
- `promociones.controller.js`: Handles promotion requests
- `promociones.service.js`: Implements promotion business logic

**Key Interfaces**:

```javascript
// POST /api/promociones (requires admin or duena role)
Request: {
  titulo: string,
  descripcion?: string,
  descuento: number, // percentage 0-100
  tipo: 'porcentaje' | '2x1' | 'precio_fijo' | 'regalo',
  fecha_desde: date,
  fecha_hasta: date,
  activa: boolean
}

// GET /api/promociones
Query params: { activa?, page?, limit? }
```

**Business Rules**:
- descuento must be between 0 and 100
- fecha_desde must be <= fecha_hasta
- tipo must be valid enum value

### 14. Events Module

**Purpose**: Manages special events calendar for planning high-demand periods.

**Components**:
- `eventos.routes.js`: Defines event endpoints
- `eventos.controller.js`: Handles event requests
- `eventos.service.js`: Implements event business logic

**Key Interfaces**:

```javascript
// POST /api/eventos (requires admin or duena role)
Request: {
  nombre: string,
  descripcion?: string,
  emoji?: string,
  fecha: date,
  color: 'rosa' | 'dorado' | 'rojo' | 'morado',
  activo: boolean
}

// GET /api/eventos
Query params: { activo?, fecha?, page?, limit? }
```

**Business Rules**:
- color must be valid enum value
- Events ordered by fecha ascending
- Support filtering by active status

## Data Models

### Database Schema Overview

The system uses 13 core tables with relationships enforced through foreign keys:

```
Core Entities:
- usuarios (workers/employees)
- productos (products)
- inventario (inventory items)
- clientes (clients)

Transactional Entities:
- ventas (sales)
- ventas_productos (sales line items)
- pedidos (orders)
- gastos (expenses)
- caja (cash register)

Configuration Entities:
- arreglos (arrangements)
- arreglos_inventario (arrangement recipes)
- promociones (promotions)
- eventos (events)
```

### Key Relationships

```
usuarios 1:N ventas (trabajador_id)
usuarios 1:N pedidos (trabajador_id)
usuarios 1:N caja (trabajador_apertura_id, trabajador_cierre_id)

productos 1:N ventas_productos (producto_id)

inventario 1:N arreglos_inventario (inventario_id)

clientes 1:N ventas (cliente_id)
clientes 1:N pedidos (cliente_id)

ventas 1:N ventas_productos (venta_id)

arreglos 1:N arreglos_inventario (arreglo_id)
```

### Data Integrity Constraints

**Check Constraints**:
- precio >= 0
- costo >= 0
- stock >= 0
- monto >= 0
- descuento BETWEEN 0 AND 100
- margen BETWEEN 0 AND 100

**Unique Constraints**:
- usuarios.email
- caja.fecha

**Foreign Key Constraints**:
- ON DELETE SET NULL: For optional relationships (cliente_id, trabajador_id)
- ON DELETE RESTRICT: For required relationships (producto_id in ventas_productos)
- ON DELETE CASCADE: For dependent records (ventas_productos when venta deleted)

**Triggers**:
- Auto-update updated_at timestamp on all tables with UPDATE trigger

### Indexes Strategy

**Primary Indexes** (automatic on primary keys):
- All tables have SERIAL PRIMARY KEY

**Foreign Key Indexes**:
- usuarios.email (unique)
- usuarios.rol
- clientes.telefono
- ventas.fecha
- ventas.trabajador_id
- ventas.metodo_pago
- ventas_productos.venta_id
- ventas_productos.producto_id
- pedidos.estado
- pedidos.fecha_entrega
- pedidos.cliente_telefono
- pedidos.trabajador_id
- productos.categoria
- productos.activo
- inventario.tipo
- inventario.stock
- gastos.fecha
- gastos.categoria
- caja.fecha
- caja.estado
- arreglos_inventario.arreglo_id
- arreglos_inventario.inventario_id
- promociones.activa
- promociones.fecha_desde, fecha_hasta
- eventos.activo
- eventos.fecha

### Database Views

**ventas_mensuales_trabajador**:
```sql
SELECT 
  t.id as trabajador_id,
  t.nombre,
  DATE_TRUNC('month', v.fecha) as mes,
  COUNT(v.id) as total_ventas,
  COALESCE(SUM(v.total), 0) as monto_total
FROM usuarios t
LEFT JOIN ventas v ON t.id = v.trabajador_id
WHERE t.activo = true
GROUP BY t.id, t.nombre, DATE_TRUNC('month', v.fecha);
```

**inventario_stock_bajo**:
```sql
SELECT id, nombre, tipo, stock, stock_min, unidad, costo
FROM inventario
WHERE stock <= stock_min
ORDER BY stock ASC;
```

**pedidos_pendientes**:
```sql
SELECT p.*, u.nombre as trabajador_nombre
FROM pedidos p
LEFT JOIN usuarios u ON p.trabajador_id = u.id
WHERE p.estado IN ('pendiente', 'en preparación')
ORDER BY p.fecha_entrega ASC;
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing all acceptance criteria, I've identified the following correctness properties. These properties eliminate redundancy by combining related validations and focusing on unique behavioral guarantees.

### Authentication Properties

### Property 1: JWT Token Generation with Valid Expiration

*For any* valid user credentials, when authentication succeeds, the generated JWT token SHALL have a 24-hour expiration time and include user id, email, rol, and nombre in the payload.

**Validates: Requirements 1.1, 1.5**

### Property 2: Password Hashing Round-Trip

*For any* valid password string, hashing the password with bcrypt then verifying it with bcrypt.compare SHALL return true.

**Validates: Requirements 1.7**

### Property 3: Invalid Credentials Rejection

*For any* credentials where the email doesn't exist or the password doesn't match, the authentication system SHALL return a 401 error.

**Validates: Requirements 1.2**

### Property 4: Password Length Validation

*For any* password with length less than 6 characters, the authentication system SHALL reject it during user creation or password update.

**Validates: Requirements 1.6**

### Authorization Properties

### Property 5: Role-Based Access Control

*For any* protected route with role requirements, the authorization system SHALL:
- Allow access if user role matches required role or user is admin
- Deny access with 403 error if user role doesn't match and user is not admin

**Validates: Requirements 2.4, 2.5, 2.6**

### Property 6: Token Validation

*For any* request with an expired, malformed, or incorrectly signed JWT token, the authorization system SHALL return a 401 error.

**Validates: Requirements 2.3, 2.7**

### Property 7: Token Payload Extraction

*For any* valid JWT token, the authorization system SHALL successfully extract the user role and other payload fields.

**Validates: Requirements 2.1**

### Dashboard Properties

### Property 8: Dashboard Calculations Accuracy

*For any* database state, the dashboard service SHALL calculate:
- ventas_dia as SUM of sales for current date
- ventas_mes as SUM of sales for current month
- ganancia_mes as (ventas_mes - gastos_mes)
- margen_mes as (ganancia_mes / ventas_mes × 100) when ventas_mes > 0
- pedidos_pendientes as COUNT of orders with estado IN ('pendiente', 'en preparación')

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 9: Dashboard Low Stock Detection

*For any* inventory state, the dashboard service SHALL return all inventory items where stock <= stock_min.

**Validates: Requirements 3.7**

### Product Properties

### Property 10: Product Validation

*For any* product creation or update request, the system SHALL validate:
- nombre is not empty
- precio >= 0
- costo >= 0
- stock >= 0
- categoria is one of: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 11: Product Timestamp Invariant

*For any* product update operation, the created_at timestamp SHALL remain unchanged and the updated_at timestamp SHALL be set to current time.

**Validates: Requirements 4.6, 4.7**

### Property 12: Product Soft Delete

*For any* product deletion request, the system SHALL set activo = false instead of removing the database record.

**Validates: Requirements 4.8**

### Property 13: Product Filtering

*For any* product list query with categoria or activo filters, the system SHALL return only products matching all specified filter criteria.

**Validates: Requirements 4.9, 4.10**

### Inventory Properties

### Property 14: Inventory Validation

*For any* inventory item creation or update, the system SHALL validate:
- nombre is not empty
- tipo is one of: flores, materiales, accesorios
- stock >= 0
- costo >= 0

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 15: Low Stock Filter

*For any* inventory query with stock_bajo=true filter, the system SHALL return only items where stock <= stock_min, ordered by stock ascending.

**Validates: Requirements 5.6, 5.8**

### Sales Properties

### Property 16: Sales Validation

*For any* sales creation request, the system SHALL validate:
- productos array is not empty
- metodo_pago is one of: Efectivo, Yape, Plin, Tarjeta, Transferencia bancaria
- total equals sum of all producto subtotals

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 17: Sales Stock Deduction

*For any* successful sale creation, the system SHALL deduct the sold cantidad from productos.stock for each product in the sale.

**Validates: Requirements 6.5**

### Property 18: Sales Insufficient Stock Rejection

*For any* sale creation request where any product has insufficient stock, the system SHALL return a 400 error and make no changes to the database.

**Validates: Requirements 6.6**

### Property 19: Sales Transaction Atomicity

*For any* sale creation attempt, either all operations (insert venta, insert ventas_productos, update stock) SHALL succeed together, or all SHALL be rolled back on error.

**Validates: Requirements 6.9, 6.10**

### Property 20: Sales Line Items Creation

*For any* successful sale, the system SHALL create exactly one ventas_productos record for each product in the sale request.

**Validates: Requirements 6.4**

### Order Properties

### Property 21: Order Validation

*For any* order creation request, the system SHALL validate:
- cliente_nombre is not empty
- cliente_telefono is not empty
- fecha_entrega is not empty
- descripcion is not empty

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 22: Order Default State

*For any* newly created order, the system SHALL set estado to 'pendiente' and fecha_pedido to current timestamp.

**Validates: Requirements 7.5, 7.6**

### Property 23: Order Status Validation

*For any* order status update, the system SHALL validate that the new estado is one of: pendiente, en preparación, listo para entrega, entregado, cancelado.

**Validates: Requirements 7.7**

### Property 24: Order Filtering

*For any* order list query with filters (estado, cliente_telefono, fecha_entrega), the system SHALL return only orders matching all specified criteria.

**Validates: Requirements 7.9, 7.10, 7.11**

### Client Properties

### Property 25: Client Validation

*For any* client creation request, the system SHALL validate that nombre and telefono are not empty.

**Validates: Requirements 8.1, 8.2**

### Property 26: Client Timestamp Update

*For any* client update operation, the system SHALL update the updated_at timestamp to current time.

**Validates: Requirements 8.3**

### Worker Properties

### Property 27: Worker Validation

*For any* worker creation request, the system SHALL validate:
- nombre is not empty
- email is not empty and unique
- password length >= 6 characters
- rol is one of: admin, empleado, duena

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 28: Worker Password Hashing

*For any* worker creation or password update, the system SHALL hash the password using bcrypt with 10 salt rounds before storing.

**Validates: Requirements 9.5, 9.8**

### Property 29: Worker Soft Delete

*For any* worker deletion request, the system SHALL set activo = false instead of removing the database record.

**Validates: Requirements 9.9**

### Property 30: Worker Management Authorization

*For any* worker management operation (create, update, delete), the system SHALL deny access with 403 error if the requester role is not admin.

**Validates: Requirements 9.10**

### Expense Properties

### Property 31: Expense Validation

*For any* expense creation request, the system SHALL validate:
- descripcion is not empty
- categoria is one of: flores, transporte, materiales, mantenimiento, otros
- monto >= 0
- fecha is not empty

**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 32: Expense Filtering

*For any* expense query with mes or categoria filters, the system SHALL return only expenses matching all specified criteria.

**Validates: Requirements 10.5, 10.6**

### Report Properties

### Property 33: Monthly Report Calculations

*For any* valid month parameter (YYYY-MM format), the report service SHALL calculate:
- ventas_total as SUM of all sales in that month
- gastos_total as SUM of all expenses in that month
- ganancia as (ventas_total - gastos_total)
- total_pedidos as COUNT of orders in that month

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 34: Report Aggregations

*For any* monthly report request, the system SHALL provide:
- Daily sales totals grouped by date
- Sales totals grouped by metodo_pago
- Top 10 products by sales quantity
- Sales totals by worker

**Validates: Requirements 11.5, 11.6, 11.7, 11.8**


### Cash Register Properties

### Property 35: Cash Register Opening Validation

*For any* cash register opening request, the system SHALL:
- Validate that no other register is open for the same date
- Validate that monto_apertura >= 0
- Set estado to 'abierta'
- Record trabajador_apertura_id from authenticated user

**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 36: Cash Register Closing Calculations

*For any* cash register closing operation, the system SHALL calculate:
- total_efectivo = SUM(ventas WHERE metodo_pago = 'Efectivo' AND fecha = current_date)
- total_digital = SUM(ventas WHERE metodo_pago IN ('Yape', 'Plin') AND fecha = current_date)
- total_tarjeta = SUM(ventas WHERE metodo_pago IN ('Tarjeta', 'Transferencia bancaria') AND fecha = current_date)
- total_ventas = total_efectivo + total_digital + total_tarjeta
- total_gastos = SUM(gastos WHERE fecha = current_date)

**Validates: Requirements 12.7, 12.8, 12.9, 12.10, 12.11**

### Property 37: Cash Register State Transition

*For any* cash register closing operation, the system SHALL set estado to 'cerrada' and record trabajador_cierre_id from authenticated user.

**Validates: Requirements 12.12, 12.13**

### Arrangement Properties

### Property 38: Arrangement Validation

*For any* arrangement creation request, the system SHALL validate:
- nombre is not empty
- margen is between 0 and 100

**Validates: Requirements 13.1, 13.2**

### Property 39: Arrangement Cost Calculation

*For any* arrangement with a recipe, the system SHALL calculate:
- costo_total = SUM(inventario_item.costo × cantidad) for all recipe items
- precio_venta = costo_total × (1 + margen/100)

**Validates: Requirements 13.3, 13.4**

### Property 40: Arrangement Recipe Management

*For any* arrangement creation, the system SHALL create arreglos_inventario records for each recipe item, and when deleted, SHALL remove all associated arreglos_inventario records.

**Validates: Requirements 13.5, 13.7**

### Promotion Properties

### Property 41: Promotion Validation

*For any* promotion creation request, the system SHALL validate:
- titulo is not empty
- tipo is one of: porcentaje, 2x1, precio_fijo, regalo
- descuento is between 0 and 100
- fecha_desde <= fecha_hasta

**Validates: Requirements 14.1, 14.2, 14.3, 14.4**

### Property 42: Promotion Filtering

*For any* promotion query with activa or date range filters, the system SHALL return only promotions matching all specified criteria.

**Validates: Requirements 14.6, 14.7**

### Event Properties

### Property 43: Event Validation

*For any* event creation request, the system SHALL validate:
- nombre is not empty
- color is one of: rosa, dorado, rojo, morado

**Validates: Requirements 15.1, 15.2**

### Property 44: Event Filtering and Ordering

*For any* event query with activo or fecha filters, the system SHALL return only events matching the criteria, ordered by fecha ascending.

**Validates: Requirements 15.4, 15.5, 15.6**

### Input Validation Properties

### Property 45: Required Field Validation

*For any* API request, the system SHALL validate that all required fields are present and return a 400 error with detailed validation messages if any are missing.

**Validates: Requirements 17.1, 17.3**

### Property 46: Data Type Validation

*For any* API request, the system SHALL validate that all fields match their expected data types and return a 400 error if type mismatches occur.

**Validates: Requirements 17.2, 17.3**

### Property 47: Numeric Range Validation

*For any* numeric field with defined constraints (e.g., precio >= 0, descuento 0-100), the system SHALL validate the value is within acceptable range.

**Validates: Requirements 17.6**

### Error Handling Properties

### Property 48: Standardized Error Response Format

*For any* error condition, the system SHALL return a response with:
- error: true
- mensaje: string describing the error
- Optional detalles: array for validation errors
- Appropriate HTTP status code (400, 401, 403, 404, 500)

**Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.7**

### API Response Properties

### Property 49: Success Response Format

*For any* successful operation, the system SHALL return a response with:
- success: true
- data: object containing the result
- Optional mensaje: string with success message
- Content-Type: application/json

**Validates: Requirements 20.1, 20.2, 20.3, 20.9**

### Property 50: HTTP Status Code Consistency

*For any* API response, the system SHALL use:
- 201 for resource creation
- 200 for successful retrieval or update
- 404 for resource not found
- 400 for validation errors
- 401 for authentication failures
- 403 for authorization failures

**Validates: Requirements 20.4, 20.5, 20.6, 20.7, 20.8**

### Pagination Properties

### Property 51: Pagination Support

*For any* list endpoint, the system SHALL support page and limit query parameters, with default page size of 50 items, and return total count in response.

**Validates: Requirements 21.6, 21.7**

### Transaction Properties

### Property 52: Transaction Atomicity

*For any* multi-step operation (e.g., sale creation with stock updates), the system SHALL use database transactions to ensure all operations succeed together or all are rolled back on failure.

**Validates: Requirements 24.1, 24.2**

### Timestamp Properties

### Property 53: Automatic Timestamp Management

*For any* record creation, the system SHALL set created_at and updated_at to current timestamp, and for any update, SHALL automatically update updated_at to current timestamp while preserving created_at.

**Validates: Requirements 25.1, 25.2, 25.3, 25.5, 25.6**

## Error Handling

### Error Response Strategy

The system implements a centralized error handling middleware that catches all errors and formats them consistently:

```javascript
{
  error: true,
  mensaje: "Human-readable error message",
  detalles: [] // Optional array for validation errors
}
```

### HTTP Status Code Mapping

- **200 OK**: Successful GET, PUT operations
- **201 Created**: Successful POST operations
- **400 Bad Request**: Validation errors, business rule violations
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Requested resource doesn't exist
- **409 Conflict**: Duplicate entry (e.g., email already exists)
- **500 Internal Server Error**: Unexpected server errors

### Error Categories

**Validation Errors** (400):
- Missing required fields
- Invalid data types
- Out-of-range values
- Invalid enum values
- Format errors (email, date)

**Authentication Errors** (401):
- Missing JWT token
- Expired JWT token
- Invalid JWT signature
- Invalid credentials

**Authorization Errors** (403):
- Insufficient role permissions
- Inactive account
- Operation not allowed for user role

**Resource Errors** (404):
- Product not found
- Order not found
- User not found
- Cash register not found

**Business Logic Errors** (400):
- Insufficient stock
- Cash register already open
- Invalid status transition
- Date range validation failures

**Database Errors** (500):
- Connection failures
- Query execution errors
- Transaction rollback failures
- Constraint violations (logged but not exposed to client)

### Error Logging Strategy

**Development Mode**:
- Log full error stack traces
- Log all database queries
- Log request/response details
- Verbose error messages

**Production Mode**:
- Log errors to file/service (e.g., Winston, Sentry)
- Sanitize error messages (no internal details exposed)
- Log with context: timestamp, user_id, endpoint, request_id
- Alert on critical errors (database down, repeated failures)

### Error Recovery

**Database Transaction Failures**:
- Automatic rollback on any error within transaction
- Return descriptive error to client
- Log full error details for debugging

**Connection Pool Exhaustion**:
- Queue requests until connection available
- Timeout after 30 seconds
- Return 503 Service Unavailable

**Validation Failures**:
- Return all validation errors in single response
- Include field name and error message for each failure
- No partial operations (validate before executing)

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
**Property Tests**: Verify universal properties across randomized inputs

Together, these approaches provide:
- Concrete bug detection (unit tests)
- General correctness verification (property tests)
- Edge case coverage (both)
- Regression prevention (both)

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Seed-based reproducibility for failed tests
- Shrinking to find minimal failing examples

**Test Tagging**:
Each property test MUST include a comment tag referencing the design property:

```javascript
// Feature: complete-backend-system, Property 1: JWT Token Generation with Valid Expiration
test('JWT tokens have 24-hour expiration and correct payload', () => {
  fc.assert(
    fc.property(
      fc.record({
        id: fc.integer({ min: 1 }),
        email: fc.emailAddress(),
        rol: fc.constantFrom('admin', 'empleado', 'duena'),
        nombre: fc.string({ minLength: 1 })
      }),
      (user) => {
        const token = generateToken(user);
        const decoded = jwt.decode(token);
        
        expect(decoded.id).toBe(user.id);
        expect(decoded.email).toBe(user.email);
        expect(decoded.rol).toBe(user.rol);
        expect(decoded.nombre).toBe(user.nombre);
        
        const expiresIn = decoded.exp - decoded.iat;
        expect(expiresIn).toBe(24 * 60 * 60); // 24 hours in seconds
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Test Organization**:
```
tests/
├── unit/
│   ├── services/
│   │   ├── auth.service.test.js
│   │   ├── productos.service.test.js
│   │   ├── ventas.service.test.js
│   │   └── ...
│   ├── controllers/
│   │   ├── auth.controller.test.js
│   │   └── ...
│   └── middleware/
│       ├── auth.test.js
│       └── validateRequest.test.js
├── integration/
│   ├── auth.integration.test.js
│   ├── productos.integration.test.js
│   ├── ventas.integration.test.js
│   └── ...
└── property/
    ├── auth.property.test.js
    ├── productos.property.test.js
    ├── ventas.property.test.js
    └── ...
```

**Unit Test Focus Areas**:
1. Service layer business logic
2. Controller request/response handling
3. Middleware authentication/authorization
4. Input validation rules
5. Error handling paths
6. Database query construction

**Integration Test Focus Areas**:
1. End-to-end API workflows
2. Database transaction behavior
3. Authentication flow
4. Authorization enforcement
5. Multi-step operations (sales with stock deduction)
6. Error propagation through layers

**Property Test Focus Areas**:
1. All 53 correctness properties defined in this document
2. Round-trip properties (password hashing, serialization)
3. Invariants (timestamps, soft deletes)
4. Calculation accuracy (dashboard, reports, arrangements)
5. Validation rules across all inputs
6. Transaction atomicity

### Test Data Strategy

**Unit Tests**: Use fixed test data and mocks
**Integration Tests**: Use test database with seed data
**Property Tests**: Use fast-check generators for randomized inputs

**Generators for Property Tests**:
```javascript
// User generator
const userGen = fc.record({
  id: fc.integer({ min: 1 }),
  nombre: fc.string({ minLength: 1, maxLength: 255 }),
  email: fc.emailAddress(),
  password: fc.string({ minLength: 6, maxLength: 50 }),
  rol: fc.constantFrom('admin', 'empleado', 'duena'),
  activo: fc.boolean()
});

// Product generator
const productGen = fc.record({
  nombre: fc.string({ minLength: 1, maxLength: 255 }),
  categoria: fc.constantFrom('Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros'),
  precio: fc.float({ min: 0, max: 10000, noNaN: true }),
  costo: fc.float({ min: 0, max: 10000, noNaN: true }),
  stock: fc.integer({ min: 0, max: 1000 })
});

// Sale generator
const saleGen = fc.record({
  productos: fc.array(
    fc.record({
      producto_id: fc.integer({ min: 1 }),
      cantidad: fc.integer({ min: 1, max: 100 }),
      precio_unitario: fc.float({ min: 0, max: 10000, noNaN: true })
    }),
    { minLength: 1, maxLength: 10 }
  ),
  metodo_pago: fc.constantFrom('Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia bancaria')
});
```

### Test Coverage Goals

- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 85%
- **Property Coverage**: 100% (all 53 properties tested)

### Continuous Testing

- Run unit tests on every commit
- Run integration tests on pull requests
- Run property tests nightly (due to longer execution time)
- Fail build on any test failure
- Track coverage trends over time


## Security Architecture

### Authentication Security

**JWT Token Management**:
- Tokens signed with HS256 algorithm
- Secret key stored in environment variable (minimum 32 characters)
- Token expiration: 24 hours
- Payload includes: id, email, rol, nombre (no sensitive data)
- Tokens transmitted via Authorization header: `Bearer <token>`

**Password Security**:
- bcrypt hashing with 10 salt rounds
- Minimum password length: 6 characters
- Passwords never logged or exposed in responses
- Password reset requires email verification (future enhancement)

**Session Management**:
- Stateless authentication (no server-side sessions)
- Token refresh mechanism (future enhancement)
- Logout handled client-side (token deletion)

### Authorization Security

**Role-Based Access Control (RBAC)**:

```
admin:
  - Full access to all endpoints
  - Can manage users, products, inventory, orders, expenses, reports
  - Can open/close cash register
  - Can manage arrangements, promotions, events

empleado:
  - Can process sales and orders
  - Can view products and inventory (read-only)
  - Can manage clients
  - Can open/close cash register
  - Cannot manage users, expenses, or view reports

duena:
  - Can view dashboard and reports
  - Can view products and inventory
  - Can manage arrangements and promotions
  - Cannot process sales or manage operational data
```

**Middleware Chain**:
```javascript
router.post('/productos',
  auth.required,              // Validate JWT token
  auth.roles(['admin']),      // Check role permission
  validateRequest(schema),    // Validate input
  productosController.create  // Execute business logic
);
```

### Input Security

**SQL Injection Prevention**:
- All database queries use parameterized statements
- No string concatenation for SQL queries
- PostgreSQL client library handles escaping

**XSS Prevention**:
- Input sanitization on all string fields
- Output encoding in responses
- Content-Type: application/json (not HTML)

**Request Validation**:
- express-validator for schema validation
- Type checking for all inputs
- Range validation for numeric fields
- Enum validation for categorical fields
- Email format validation
- Date format validation (ISO 8601)

### Network Security

**CORS Configuration**:
```javascript
{
  origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}
```

**Security Headers (Helmet)**:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains (HTTPS only)
- Content-Security-Policy: default-src 'self'

**Rate Limiting** (future enhancement):
- Authentication endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Prevents brute force attacks and DoS

### Data Security

**Sensitive Data Handling**:
- Passwords hashed before storage
- JWT secret never exposed
- Database credentials in environment variables
- No sensitive data in logs (production)

**Database Security**:
- Connection string with authentication
- Minimum privilege principle for database user
- Encrypted connections (SSL/TLS) in production
- Regular backups with encryption

**Audit Trail**:
- created_at and updated_at on all records
- trabajador_id recorded for sales, orders, cash register operations
- Immutable audit logs (future enhancement)

### Environment Security

**Environment Variables**:
```
# Required
DB_HOST=localhost
DB_PORT=5432
DB_NAME=floreria_db
DB_USER=floreria_user
DB_PASSWORD=<strong_password>
JWT_SECRET=<random_32+_char_string>

# Optional
PORT=3000
NODE_ENV=production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://floreria.com
LOG_LEVEL=info
```

**Secrets Management**:
- .env file excluded from version control (.gitignore)
- .env.example provided with documentation
- Production secrets stored in secure vault (e.g., AWS Secrets Manager)
- Rotate JWT secret periodically

## Performance Optimization

### Database Optimization

**Connection Pooling**:
```javascript
{
  min: 2,           // Minimum connections
  max: 10,          // Maximum connections
  idleTimeoutMillis: 30000,  // Close idle connections after 30s
  connectionTimeoutMillis: 2000  // Timeout if no connection available
}
```

**Query Optimization**:
- Use indexes on frequently queried columns
- Avoid N+1 queries (use JOINs or batch queries)
- Use database views for complex aggregations
- EXPLAIN ANALYZE for slow queries
- Limit result sets with pagination

**Index Strategy**:
```sql
-- Primary keys (automatic)
-- Foreign keys with indexes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_trabajador ON ventas(trabajador_id);
CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha_entrega ON pedidos(fecha_entrega);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_inventario_tipo ON inventario(tipo);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_caja_fecha ON caja(fecha);
```

**Database Views**:
- ventas_mensuales_trabajador: Pre-aggregated monthly sales by worker
- inventario_stock_bajo: Pre-filtered low stock items
- pedidos_pendientes: Pre-filtered pending orders

### API Performance

**Response Time Targets**:
- Simple CRUD operations: < 200ms
- Dashboard statistics: < 2 seconds
- Monthly reports: < 3 seconds
- Health check: < 1 second

**Pagination**:
- Default page size: 50 items
- Maximum page size: 100 items
- Include total count in response
- Use OFFSET/LIMIT for simple pagination
- Consider cursor-based pagination for large datasets (future)

**Caching Strategy** (future enhancement):
- Redis for dashboard statistics (TTL: 5 minutes)
- Cache invalidation on data changes
- ETag headers for conditional requests
- Cache frequently accessed products/inventory

### Application Optimization

**Middleware Ordering**:
```javascript
1. morgan (logging)
2. helmet (security headers)
3. cors (CORS handling)
4. express.json() (body parsing)
5. auth.required (authentication)
6. auth.roles() (authorization)
7. validateRequest() (validation)
8. route handler (business logic)
9. errorHandler (error handling)
```

**Async/Await Pattern**:
- All database operations use async/await
- Proper error handling with try/catch
- No blocking operations in request handlers

**Resource Management**:
- Close database connections properly
- Release resources in finally blocks
- Graceful shutdown on SIGTERM/SIGINT

### Monitoring and Profiling

**Performance Metrics**:
- Request duration (p50, p95, p99)
- Database query duration
- Error rate by endpoint
- Throughput (requests per second)
- Active database connections

**Logging**:
- Request/response logging (morgan)
- Error logging with stack traces
- Performance logging for slow queries
- Structured logging (JSON format in production)

**Health Monitoring**:
```javascript
GET /health
Response: {
  status: "OK",
  timestamp: "2026-03-16T10:30:00Z",
  uptime: 3600,
  database: "connected",
  memory: {
    used: 150,
    total: 512,
    unit: "MB"
  }
}
```

### Scalability Considerations

**Horizontal Scaling**:
- Stateless design enables multiple instances
- Load balancer distributes requests
- Shared PostgreSQL database
- Session-less authentication (JWT)

**Vertical Scaling**:
- Increase database connection pool size
- Allocate more memory for Node.js process
- Optimize database queries and indexes

**Future Enhancements**:
- Read replicas for reporting queries
- Message queue for async operations
- Microservices architecture for specific modules
- CDN for static assets

## Deployment Architecture

### Development Environment

```
Developer Machine
├── Node.js 18+
├── PostgreSQL 14+ (local)
├── .env (local configuration)
└── npm run dev (nodemon)
```

### Production Environment

```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
│         SSL/TLS Termination             │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼───┐
│ Node.js│      │Node.js │
│Instance│      │Instance│
│  (PM2) │      │  (PM2) │
└───┬────┘      └────┬───┘
    │                │
    └────────┬───────┘
             │
    ┌────────▼────────┐
    │   PostgreSQL    │
    │   (Primary)     │
    └─────────────────┘
```

### Deployment Checklist

**Pre-Deployment**:
- [ ] Run all tests (unit, integration, property)
- [ ] Check code coverage meets targets
- [ ] Review security configurations
- [ ] Update environment variables
- [ ] Database migrations ready
- [ ] Backup current database

**Deployment Steps**:
1. Pull latest code from repository
2. Install dependencies: `npm ci`
3. Run database migrations
4. Build application (if TypeScript)
5. Restart application with PM2
6. Verify health check endpoint
7. Monitor logs for errors
8. Run smoke tests

**Post-Deployment**:
- [ ] Verify all endpoints responding
- [ ] Check database connections
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Test critical user flows

### Environment Configuration

**Development**:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
LOG_LEVEL=debug
```

**Production**:
```
NODE_ENV=production
PORT=3000
DB_HOST=<production_db_host>
DB_PORT=5432
LOG_LEVEL=info
CORS_ORIGIN=https://floreria.com
```

## API Documentation

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.floreria.com/api`

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Endpoint Summary

**Authentication**:
- POST /auth/login - User login
- GET /auth/me - Get current user

**Dashboard**:
- GET /dashboard - Get business statistics

**Products**:
- GET /productos - List products
- GET /productos/:id - Get product
- POST /productos - Create product (admin)
- PUT /productos/:id - Update product (admin)
- DELETE /productos/:id - Delete product (admin)

**Inventory**:
- GET /inventario - List inventory items
- GET /inventario/:id - Get inventory item
- POST /inventario - Create item (admin)
- PUT /inventario/:id - Update item (admin)
- DELETE /inventario/:id - Delete item (admin)

**Sales**:
- GET /ventas - List sales
- GET /ventas/:id - Get sale
- POST /ventas - Create sale (empleado, admin)

**Orders**:
- GET /pedidos - List orders
- GET /pedidos/:id - Get order
- POST /pedidos - Create order (empleado, admin)
- PUT /pedidos/:id - Update order (empleado, admin)
- DELETE /pedidos/:id - Delete order (admin)

**Clients**:
- GET /clientes - List clients
- GET /clientes/:id - Get client
- GET /clientes/telefono/:telefono - Find by phone
- POST /clientes - Create client
- PUT /clientes/:id - Update client
- DELETE /clientes/:id - Delete client

**Workers**:
- GET /trabajadores - List workers (admin)
- GET /trabajadores/:id - Get worker (admin)
- POST /trabajadores - Create worker (admin)
- PUT /trabajadores/:id - Update worker (admin)
- DELETE /trabajadores/:id - Delete worker (admin)

**Expenses**:
- GET /gastos - List expenses (admin, duena)
- GET /gastos/:id - Get expense (admin, duena)
- POST /gastos - Create expense (admin, duena)
- DELETE /gastos/:id - Delete expense (admin)

**Reports**:
- GET /reportes?mes=YYYY-MM - Get monthly report (admin, duena)

**Cash Register**:
- GET /caja/hoy - Get today's register
- POST /caja/apertura - Open register (empleado, admin)
- POST /caja/cierre - Close register (empleado, admin)
- GET /caja/historial - Get register history (admin, duena)

**Arrangements**:
- GET /arreglos - List arrangements
- GET /arreglos/:id - Get arrangement
- POST /arreglos - Create arrangement (admin)
- PUT /arreglos/:id - Update arrangement (admin)
- DELETE /arreglos/:id - Delete arrangement (admin)

**Promotions**:
- GET /promociones - List promotions
- GET /promociones/:id - Get promotion
- POST /promociones - Create promotion (admin, duena)
- PUT /promociones/:id - Update promotion (admin, duena)
- DELETE /promociones/:id - Delete promotion (admin)

**Events**:
- GET /eventos - List events
- GET /eventos/:id - Get event
- POST /eventos - Create event (admin, duena)
- PUT /eventos/:id - Update event (admin, duena)
- DELETE /eventos/:id - Delete event (admin)

**Health**:
- GET /health - Health check (no auth required)

### Response Examples

See Components and Interfaces section for detailed request/response examples for each module.

## Conclusion

This design document provides a comprehensive blueprint for implementing the complete backend system for "Florería Encantos Eternos". The architecture emphasizes:

- **Security**: Multi-layered security with JWT authentication, bcrypt hashing, parameterized queries, and security headers
- **Performance**: Optimized database queries, connection pooling, pagination, and caching strategies
- **Maintainability**: Clean layered architecture with clear separation of concerns
- **Reliability**: Comprehensive error handling, transaction management, and audit trails
- **Testability**: 53 correctness properties with dual testing approach (unit + property-based)

The system is designed to handle the complete business operations of a flower shop, from sales and inventory management to financial reporting and employee management, while maintaining high standards of code quality, security, and performance.

