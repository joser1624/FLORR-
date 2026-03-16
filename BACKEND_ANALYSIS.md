# BACKEND ANALYSIS & PLANNING DOCUMENT
## Detalles y Regalos Encantos Eternos - Florería System

---

## 1. FRONTEND ANALYSIS

### 1.1 Identified Entities

Based on comprehensive frontend analysis:

#### **USUARIOS (Users/Workers)**
- id
- nombre (full name)
- email
- password (hashed)
- telefono
- cargo (position: Vendedor/a, Florista, Delivery, Administrador/a)
- rol (system role: admin, empleado, duena)
- fecha_ingreso (hire date)
- ventas_mes (monthly sales - calculated)
- activo (boolean)
- created_at
- updated_at

#### **PRODUCTOS (Products)**
- id
- nombre
- descripcion
- categoria (Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros)
- precio (sale price)
- costo (cost)
- stock
- activo (boolean)
- imagen_url (optional)
- created_at
- updated_at

#### **INVENTARIO (Inventory Items)**
- id
- nombre
- tipo (flores, materiales, accesorios)
- stock
- stock_min (minimum stock threshold)
- unidad (unidad, docena, metro, rollo, caja)
- costo (unit cost)
- created_at
- updated_at

#### **CLIENTES (Clients)**
- id
- nombre
- telefono
- direccion (optional)
- email (optional)
- total_pedidos (calculated)
- ultima_compra (date)
- created_at
- updated_at

#### **PEDIDOS (Orders)**
- id
- cliente_id (FK)
- cliente_nombre (denormalized for quick access)
- cliente_telefono
- direccion
- fecha_pedido (order date)
- fecha_entrega (delivery date)
- descripcion (order description)
- total
- metodo_pago (Efectivo, Yape, Plin, Tarjeta, Transferencia bancaria)
- estado (pendiente, en preparación, listo para entrega, entregado, cancelado)
- trabajador_id (FK - who handled it)
- created_at
- updated_at

#### **VENTAS (Sales)**
- id
- fecha (timestamp)
- total
- metodo_pago
- trabajador_id (FK)
- cliente_id (FK - optional)
- created_at
- updated_at

#### **VENTAS_PRODUCTOS (Sales Items - junction table)**
- id
- venta_id (FK)
- producto_id (FK)
- cantidad
- precio_unitario (price at time of sale)
- subtotal

#### **GASTOS (Expenses)**
- id
- descripcion
- categoria (flores, transporte, materiales, mantenimiento, otros)
- monto
- fecha
- created_at
- updated_at

#### **ARREGLOS (Custom Arrangements)**
- id
- nombre
- margen (profit margin %)
- costo_total
- precio_venta
- created_at
- updated_at

#### **ARREGLOS_INVENTARIO (Arrangement Recipe - junction table)**
- id
- arreglo_id (FK)
- inventario_id (FK)
- cantidad

#### **PROMOCIONES (Promotions)**
- id
- titulo
- descripcion
- descuento (percentage)
- tipo (porcentaje, 2x1, precio_fijo, regalo)
- fecha_desde
- fecha_hasta
- activa (boolean)
- created_at
- updated_at

#### **EVENTOS (Special Events)**
- id
- nombre
- descripcion
- emoji
- fecha
- color (rosa, dorado, rojo, morado)
- activo (boolean)
- created_at
- updated_at

#### **CAJA (Cash Register)**
- id
- fecha
- monto_apertura (opening amount)
- monto_cierre (closing amount - optional)
- total_efectivo
- total_digital
- total_tarjeta
- total_ventas
- total_gastos
- trabajador_apertura_id (FK)
- trabajador_cierre_id (FK - optional)
- estado (abierta, cerrada)
- created_at
- updated_at

---

## 2. API ENDPOINTS REQUIRED

### 2.1 Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### 2.2 Dashboard
```
GET    /api/dashboard
  Response: {
    ventas_dia, ventas_mes, ganancia_mes, margen_mes,
    pedidos_pendientes, pedidos_hoy, pedidos_mes,
    stock_bajo: [],
    ventas_semana: [],
    top_productos: [],
    pedidos_recientes: [],
    ventas_trabajadores: []
  }
```

### 2.3 Productos
```
GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
```

### 2.4 Inventario
```
GET    /api/inventario
GET    /api/inventario/:id
POST   /api/inventario
PUT    /api/inventario/:id
DELETE /api/inventario/:id
GET    /api/inventario?stock_bajo=true
```

### 2.5 Ventas
```
GET    /api/ventas
GET    /api/ventas/:id
POST   /api/ventas
GET    /api/ventas?fecha=YYYY-MM-DD
GET    /api/ventas?metodo=Yape
GET    /api/ventas?trabajador_id=1
```

### 2.6 Pedidos
```
GET    /api/pedidos
GET    /api/pedidos/:id
POST   /api/pedidos
PUT    /api/pedidos/:id
DELETE /api/pedidos/:id
GET    /api/pedidos?estado=pendiente
GET    /api/pedidos/cliente?telefono=987654321
```

### 2.7 Clientes
```
GET    /api/clientes
GET    /api/clientes/:id
POST   /api/clientes
PUT    /api/clientes/:id
DELETE /api/clientes/:id
```

### 2.8 Trabajadores
```
GET    /api/trabajadores
GET    /api/trabajadores/:id
POST   /api/trabajadores
PUT    /api/trabajadores/:id
DELETE /api/trabajadores/:id
```

### 2.9 Gastos
```
GET    /api/gastos
GET    /api/gastos/:id
POST   /api/gastos
DELETE /api/gastos/:id
GET    /api/gastos?mes=YYYY-MM
```

### 2.10 Reportes
```
GET    /api/reportes?mes=YYYY-MM
  Response: {
    ventas_total, gastos_total, total_pedidos,
    ventas_dias: [],
    metodos_pago: [],
    top_productos: [],
    ventas_trabajadores: []
  }
```

### 2.11 Caja
```
GET    /api/caja/hoy
POST   /api/caja/apertura
POST   /api/caja/cierre
GET    /api/caja/historial
```

### 2.12 Arreglos (Custom Arrangements)
```
GET    /api/arreglos
GET    /api/arreglos/:id
POST   /api/arreglos
PUT    /api/arreglos/:id
DELETE /api/arreglos/:id
```

### 2.13 Promociones
```
GET    /api/promociones
GET    /api/promociones/:id
POST   /api/promociones
PUT    /api/promociones/:id
DELETE /api/promociones/:id
GET    /api/promociones?activa=true
```

### 2.14 Eventos
```
GET    /api/eventos
GET    /api/eventos/:id
POST   /api/eventos
PUT    /api/eventos/:id
DELETE /api/eventos/:id
GET    /api/eventos?activo=true
```

---

## 3. DATABASE DESIGN

### 3.1 Entity Relationship Diagram (ERD)

```
USUARIOS (trabajadores)
├── VENTAS (1:N)
├── PEDIDOS (1:N)
└── CAJA (1:N)

PRODUCTOS
├── VENTAS_PRODUCTOS (1:N)
└── stock management

INVENTARIO
└── ARREGLOS_INVENTARIO (1:N)

CLIENTES
├── VENTAS (1:N)
└── PEDIDOS (1:N)

VENTAS
├── VENTAS_PRODUCTOS (1:N)
├── USUARIOS (N:1)
└── CLIENTES (N:1)

PEDIDOS
├── CLIENTES (N:1)
└── USUARIOS (N:1)

ARREGLOS
└── ARREGLOS_INVENTARIO (1:N)

GASTOS (standalone)
PROMOCIONES (standalone)
EVENTOS (standalone)
CAJA (linked to USUARIOS)
```

### 3.2 Indexes Strategy
- Primary keys on all tables
- Foreign keys with indexes
- Index on usuarios.email (unique)
- Index on clientes.telefono
- Index on ventas.fecha
- Index on pedidos.estado
- Index on pedidos.fecha_entrega
- Index on productos.categoria
- Index on inventario.tipo

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 JWT Strategy
- Access token: 24h expiration
- Refresh token: 7 days (optional for v1)
- Token payload: { id, email, rol, nombre }

### 4.2 Password Security
- bcrypt with salt rounds: 10
- Minimum password length: 6 characters

### 4.3 Role-Based Access Control (RBAC)

**admin:**
- Full access to all endpoints
- Can manage users, products, inventory, orders, reports

**empleado:**
- Can access: ventas, pedidos, caja, productos (read), inventario (read), clientes, laboratorio
- Cannot access: trabajadores, gastos, reportes

**duena:**
- Can access: dashboard, reportes, productos, inventario, laboratorio, promociones
- Cannot access: ventas, pedidos, caja (operational)

### 4.4 Middleware Chain
```javascript
auth.required → auth.roles(['admin', 'empleado']) → controller
```

---

## 5. BACKEND ARCHITECTURE

### 5.1 Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── server.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validateRequest.js
│   │   └── cors.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── productos.routes.js
│   │   ├── inventario.routes.js
│   │   ├── ventas.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── clientes.routes.js
│   │   ├── trabajadores.routes.js
│   │   ├── gastos.routes.js
│   │   ├── reportes.routes.js
│   │   ├── caja.routes.js
│   │   ├── arreglos.routes.js
│   │   ├── promociones.routes.js
│   │   └── eventos.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── productos.controller.js
│   │   ├── inventario.controller.js
│   │   ├── ventas.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── clientes.controller.js
│   │   ├── trabajadores.controller.js
│   │   ├── gastos.controller.js
│   │   ├── reportes.controller.js
│   │   ├── caja.controller.js
│   │   ├── arreglos.controller.js
│   │   ├── promociones.controller.js
│   │   └── eventos.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── dashboard.service.js
│   │   ├── productos.service.js
│   │   ├── inventario.service.js
│   │   ├── ventas.service.js
│   │   ├── pedidos.service.js
│   │   ├── clientes.service.js
│   │   ├── trabajadores.service.js
│   │   ├── gastos.service.js
│   │   ├── reportes.service.js
│   │   ├── caja.service.js
│   │   ├── arreglos.service.js
│   │   ├── promociones.service.js
│   │   └── eventos.service.js
│   ├── models/
│   │   └── db.js (query helpers)
│   ├── utils/
│   │   ├── logger.js
│   │   └── validators.js
│   └── app.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### 5.2 Technology Stack
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 6. BUSINESS LOGIC REQUIREMENTS

### 6.1 Ventas (Sales)
- When a sale is created:
  - Deduct stock from productos
  - Update trabajador's ventas_mes
  - Update cliente's total_pedidos and ultima_compra
  - Record in caja if open

### 6.2 Pedidos (Orders)
- Status workflow: pendiente → en preparación → listo para entrega → entregado
- Can be canceled at any stage
- Track who handles each order

### 6.3 Inventario (Inventory)
- Alert when stock <= stock_min
- Track usage in arreglos

### 6.4 Caja (Cash Register)
- Only one caja can be open per day
- Calculate totals by payment method
- Track apertura and cierre

### 6.5 Dashboard
- Real-time calculations
- Aggregate data from multiple tables
- Performance metrics

### 6.6 Reportes (Reports)
- Monthly aggregations
- Sales by day, method, worker, product
- Profit calculations (ventas - gastos)

---

## 7. ERROR HANDLING

### 7.1 HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (no token or invalid)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate entry)
- 500: Internal Server Error

### 7.2 Error Response Format
```json
{
  "error": true,
  "mensaje": "Error description",
  "detalles": [] // optional validation errors
}
```

### 7.3 Success Response Format
```json
{
  "success": true,
  "data": {},
  "mensaje": "Optional success message"
}
```

---

## 8. SECURITY CONSIDERATIONS

1. **SQL Injection Prevention**: Use parameterized queries
2. **XSS Prevention**: Sanitize inputs
3. **CORS**: Configure allowed origins
4. **Rate Limiting**: Implement for auth endpoints
5. **Helmet**: Security headers
6. **Environment Variables**: Sensitive data in .env
7. **Password Policy**: Minimum 6 characters, bcrypt hashing
8. **JWT Secret**: Strong random string

---

## 9. PERFORMANCE OPTIMIZATION

1. **Database Indexes**: On frequently queried columns
2. **Connection Pooling**: PostgreSQL pool configuration
3. **Query Optimization**: Avoid N+1 queries
4. **Caching Strategy**: Consider Redis for dashboard (future)
5. **Pagination**: For large datasets (productos, ventas, pedidos)

---

## 10. TESTING STRATEGY (Future)

1. Unit tests for services
2. Integration tests for API endpoints
3. Authentication flow tests
4. Database transaction tests

---

## 11. DEPLOYMENT CONSIDERATIONS

1. Environment variables for production
2. Database migrations strategy
3. Logging configuration
4. Process manager (PM2)
5. Reverse proxy (Nginx)
6. SSL/TLS certificates

---

## 12. API RESPONSE EXAMPLES

### Login
```javascript
POST /api/auth/login
Request: { email: "admin@floreria.com", password: "admin123" }
Response: {
  success: true,
  token: "eyJhbGc...",
  user: {
    id: 1,
    nombre: "Admin User",
    email: "admin@floreria.com",
    rol: "admin",
    cargo: "Administrador/a"
  }
}
```

### Get Products
```javascript
GET /api/productos
Response: {
  success: true,
  productos: [
    {
      id: 1,
      nombre: "Ramo romántico de rosas",
      categoria: "Ramos",
      precio: 85.00,
      costo: 52.00,
      stock: 15,
      descripcion: "12 rosas premium",
      activo: true
    }
  ]
}
```

### Create Sale
```javascript
POST /api/ventas
Request: {
  productos: [
    { producto_id: 1, cantidad: 2, precio: 85.00 }
  ],
  metodo_pago: "Yape",
  trabajador_id: 1,
  cliente_id: 5
}
Response: {
  success: true,
  venta: { id: 101, total: 170.00, fecha: "2026-03-16T10:30:00Z" },
  mensaje: "Venta registrada correctamente"
}
```

---

## NEXT STEPS: IMPLEMENTATION PHASE

1. ✅ Analysis Complete
2. ⏭️ Create database schema SQL
3. ⏭️ Create seed data SQL
4. ⏭️ Initialize Node.js project
5. ⏭️ Implement database connection
6. ⏭️ Implement authentication system
7. ⏭️ Implement all routes and controllers
8. ⏭️ Test all endpoints
9. ⏭️ Document API usage

---

**Analysis Date**: 2026-03-16
**Project**: Florería Encantos Eternos Backend
**Status**: Planning Complete ✅
