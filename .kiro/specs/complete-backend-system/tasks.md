# Implementation Plan: Complete Backend System

## Overview

This implementation plan covers the complete backend system for "Florería Encantos Eternos" flower shop management. The backend is built with Node.js + Express.js + PostgreSQL and implements 14 modules with authentication, authorization, CRUD operations, real-time statistics, and reporting capabilities.

The implementation follows a clean layered architecture (routes → controllers → services → database) with comprehensive security, validation, and error handling. The system supports three user roles (admin, empleado, duena) with role-based access control.

## Tasks

- [x] 1. Set up core infrastructure and configuration
  - Create database connection module with connection pooling (min: 2, max: 10 connections)
  - Create JWT configuration module with token generation and verification utilities
  - Configure environment variables validation (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, PORT, CORS_ORIGIN)
  - Implement health check endpoint with database connectivity test
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

- [x] 2. Implement authentication and authorization system
  - [x] 2.1 Implement authentication service
    - Create login function with credential validation
    - Implement password hashing with bcrypt (10 salt rounds)
    - Implement password comparison for login
    - Generate JWT tokens with 24h expiration including user payload (id, email, rol, nombre)
    - Handle inactive account validation
    - Return appropriate error messages for invalid credentials (401) and inactive accounts (403)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Implement authentication middleware
    - Extract and validate JWT token from Authorization header
    - Verify token signature and expiration
    - Attach decoded user data to request object
    - Return 401 for missing or invalid tokens
    - _Requirements: 2.1, 2.2, 2.3, 2.7_

  - [x] 2.3 Implement role-based authorization middleware
    - Create middleware factory function accepting allowed roles array
    - Check authenticated user role against allowed roles
    - Return 403 for insufficient permissions
    - Support multiple role combinations (admin, empleado, duena)
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 2.4 Implement authentication controller and routes
    - Create POST /api/auth/login endpoint
    - Create GET /api/auth/me endpoint (returns current user info)
    - Create POST /api/auth/logout endpoint (client-side token removal)
    - Implement request validation for login (email, password required)
    - Return standardized success responses with token and user data
    - _Requirements: 1.1, 1.2, 1.3, 20.1, 20.2, 20.3, 20.6_

- [x] 3. Checkpoint - Test authentication system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement middleware infrastructure
  - [x] 4.1 Implement request validation middleware
    - Create validation middleware using express-validator
    - Validate required fields presence
    - Validate data types and formats
    - Validate numeric ranges and constraints
    - Validate email format with regex
    - Validate date formats (ISO 8601)
    - Sanitize string inputs
    - Return 400 errors with detailed validation messages
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [x] 4.2 Implement error handling middleware
    - Create centralized error handler
    - Return standardized error responses (error: true, mensaje, detalles)
    - Handle 400, 401, 403, 404, 500 errors with appropriate messages
    - Log full stack traces for 500 errors
    - Prevent internal details exposure in production
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [x] 4.3 Implement security middleware
    - Configure helmet for security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security)
    - Configure CORS with allowed origins from environment
    - Set allowed HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
    - Set allowed headers (Content-Type, Authorization)
    - Reject requests from unauthorized origins with 403
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8_

  - [x] 4.4 Implement logging middleware
    - Configure morgan for request logging
    - Log all incoming requests with method, path, timestamp
    - Log authentication attempts with success/failure status
    - Log database queries in development mode
    - _Requirements: 19.8, 19.9, 19.10_

- [x] 5. Implement Products module
  - [x] 5.1 Implement products service
    - Create getAll function with filtering by categoria and activo
    - Create getById function
    - Create create function with validation (nombre not empty, precio >= 0, costo >= 0, stock >= 0, categoria in allowed list)
    - Create update function preserving created_at and updating updated_at
    - Create delete function (soft delete: set activo = false)
    - Use parameterized queries for all database operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

  - [x] 5.2 Implement products controller
    - Create controller functions for all CRUD operations
    - Handle service errors and return appropriate HTTP status codes
    - Return standardized success responses
    - _Requirements: 20.1, 20.2, 20.7, 20.8, 20.9_

  - [x] 5.3 Implement products routes
    - Create GET /api/productos (all roles)
    - Create GET /api/productos/:id (all roles)
    - Create POST /api/productos (admin only)
    - Create PUT /api/productos/:id (admin only)
    - Create DELETE /api/productos/:id (admin only)
    - Apply authentication and authorization middleware
    - Apply request validation middleware
    - _Requirements: 2.4, 2.5, 2.6, 17.1, 17.2, 17.3_

- [x] 6. Implement Inventory module
  - [x] 6.1 Implement inventory service
    - Create getAll function with filtering by tipo and stock_bajo (stock <= stock_min)
    - Create getById function
    - Create create function with validation (nombre not empty, tipo in allowed list, stock >= 0, costo >= 0)
    - Create update function updating updated_at timestamp
    - Create delete function
    - Order low stock items by stock ascending
    - Use parameterized queries for all operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 6.2 Implement inventory controller and routes
    - Create GET /api/inventario with optional stock_bajo query parameter
    - Create GET /api/inventario/:id
    - Create POST /api/inventario
    - Create PUT /api/inventario/:id
    - Create DELETE /api/inventario/:id
    - Apply authentication middleware (all roles)
    - Apply request validation
    - _Requirements: 20.1, 20.2, 20.7, 20.8_

- [x] 7. Implement Sales module
  - [x] 7.1 Implement sales service with transaction support
    - Create create function with database transaction
    - Validate productos array not empty
    - Validate metodo_pago in allowed list (Efectivo, Yape, Plin, Tarjeta, Transferencia bancaria)
    - Calculate total as sum of all subtotals
    - Create ventas record with trabajador_id from authenticated user
    - Create ventas_productos records for each product
    - Deduct cantidad from productos.stock for each product
    - Check stock sufficiency before deduction, return 400 if insufficient
    - Update cliente ultima_compra if cliente_id provided
    - Rollback transaction on any error
    - Use parameterized queries
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.14, 24.1, 24.2_

  - [x] 7.2 Implement sales query service
    - Create getAll function with filtering by fecha, metodo_pago, trabajador_id
    - Create getById function with ventas_productos details
    - Use parameterized queries
    - _Requirements: 6.11, 6.12, 6.13, 6.14_

  - [x] 7.3 Implement sales controller and routes
    - Create POST /api/ventas (empleado, admin roles)
    - Create GET /api/ventas with query parameters
    - Create GET /api/ventas/:id
    - Apply authentication and authorization middleware
    - Apply request validation
    - Return 201 for successful creation
    - _Requirements: 2.5, 20.1, 20.2, 20.6, 20.7_

- [x] 8. Checkpoint - Test core modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Orders module
  - [x] 9.1 Implement orders service
    - Create getAll function with filtering by estado, cliente_telefono, fecha_entrega
    - Create getById function
    - Create create function with validation (cliente_nombre, cliente_telefono, fecha_entrega, descripcion not empty)
    - Set estado to "pendiente" and fecha_pedido to current timestamp on creation
    - Create update function with estado validation (pendiente, en preparación, listo para entrega, entregado, cancelado)
    - Update updated_at timestamp on updates
    - Create delete function
    - Order pending orders by fecha_entrega ascending
    - Use parameterized queries
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 7.13_

  - [x] 9.2 Implement orders controller and routes
    - Create GET /api/pedidos with query parameters
    - Create GET /api/pedidos/:id
    - Create GET /api/pedidos/cliente (filter by telefono)
    - Create POST /api/pedidos
    - Create PUT /api/pedidos/:id
    - Create DELETE /api/pedidos/:id
    - Apply authentication middleware (empleado, admin roles)
    - Apply request validation
    - _Requirements: 2.5, 20.1, 20.2, 20.6, 20.7_

- [x] 10. Implement Clients module
  - [x] 10.1 Implement clients service
    - Create getAll function with pagination support
    - Create getById function
    - Create getByTelefono function
    - Create create function with validation (nombre, telefono not empty)
    - Create update function updating updated_at
    - Create delete function
    - Use parameterized queries
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 10.2 Implement clients controller and routes
    - Create GET /api/clientes with pagination (page, limit query parameters)
    - Create GET /api/clientes/:id
    - Create POST /api/clientes
    - Create PUT /api/clientes/:id
    - Create DELETE /api/clientes/:id
    - Apply authentication middleware (all roles)
    - Apply request validation
    - _Requirements: 21.6, 21.7, 20.1, 20.2_

- [x] 11. Implement Workers module (admin only)
  - [x] 11.1 Implement workers service
    - Create getAll function
    - Create getById function
    - Create create function with validation (nombre, email not empty, email unique, password min 6 chars, rol in allowed list)
    - Hash password with bcrypt (10 salt rounds) on creation
    - Set activo to true by default
    - Create update function with email uniqueness check
    - Hash password if password is being updated
    - Create delete function (soft delete: set activo = false)
    - Use parameterized queries
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.11_

  - [x] 11.2 Implement workers controller and routes
    - Create GET /api/trabajadores (admin only)
    - Create GET /api/trabajadores/:id (admin only)
    - Create POST /api/trabajadores (admin only)
    - Create PUT /api/trabajadores/:id (admin only)
    - Create DELETE /api/trabajadores/:id (admin only)
    - Apply authentication and authorization middleware (admin role required)
    - Apply request validation
    - Return 403 for non-admin users
    - _Requirements: 9.10, 2.4, 20.1, 20.2_

- [x] 12. Implement Expenses module
  - [x] 12.1 Implement expenses service
    - Create getAll function with filtering by mes (YYYY-MM) and categoria
    - Create getById function
    - Create create function with validation (descripcion not empty, categoria in allowed list, monto >= 0, fecha not empty)
    - Create delete function
    - Use parameterized queries
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 12.2 Implement expenses controller and routes
    - Create GET /api/gastos with query parameters (mes, categoria)
    - Create GET /api/gastos/:id
    - Create POST /api/gastos
    - Create DELETE /api/gastos/:id
    - Apply authentication middleware (admin, duena roles)
    - Apply request validation
    - _Requirements: 2.6, 20.1, 20.2_

- [x] 13. Implement Dashboard module
  - [x] 13.1 Implement dashboard service with optimized queries
    - Calculate ventas_dia (total sales for current day)
    - Calculate ventas_mes (total sales for current month)
    - Calculate ganancia_mes (sales minus expenses for current month)
    - Calculate margen_mes (profit margin percentage)
    - Count pedidos_pendientes (orders with estado pendiente or en preparación)
    - Count pedidos_hoy (orders for current day)
    - Count pedidos_mes (orders for current month)
    - Get stock_bajo items (stock <= stock_min)
    - Get ventas_semana (sales totals for last 7 days grouped by date)
    - Get top_productos (top 5 products by sales quantity for current month)
    - Get ventas_trabajadores (sales totals by worker for current month)
    - Optimize queries to complete within 2 seconds
    - Use database indexes for performance
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 21.2_

  - [x] 13.2 Implement dashboard controller and routes
    - Create GET /api/dashboard
    - Apply authentication middleware (all roles)
    - Return all statistics in single response
    - _Requirements: 20.1, 20.2, 20.9_

- [x] 14. Implement Reports module
  - [x] 14.1 Implement reports service
    - Validate mes parameter format (YYYY-MM)
    - Calculate ventas_total for specified month
    - Calculate gastos_total for specified month
    - Calculate total_pedidos for specified month
    - Get ventas_dias (daily sales totals grouped by date)
    - Get metodos_pago (sales totals grouped by payment method)
    - Get top_productos (top 10 products by sales quantity)
    - Get ventas_trabajadores (sales totals by worker)
    - Complete report generation within 3 seconds
    - Use parameterized queries
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 21.3_

  - [x] 14.2 Implement reports controller and routes
    - Create GET /api/reportes with mes query parameter
    - Apply authentication middleware (admin, duena roles)
    - Apply request validation for mes format
    - _Requirements: 2.6, 20.1, 20.2_

- [x] 15. Checkpoint - Test business logic modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement Cash Register module
  - [x] 16.1 Implement cash register service
    - Create apertura function validating no other register open for same date
    - Validate monto_apertura >= 0
    - Set estado to "abierta" and record trabajador_apertura_id
    - Create cierre function validating register is open for current date
    - Calculate total_efectivo from sales with metodo_pago "Efectivo"
    - Calculate total_digital from sales with metodo_pago "Yape" or "Plin"
    - Calculate total_tarjeta from sales with metodo_pago "Tarjeta" or "Transferencia bancaria"
    - Calculate total_ventas as sum of all payment methods
    - Calculate total_gastos from expenses for current date
    - Set estado to "cerrada" and record trabajador_cierre_id
    - Create getHoy function returning register for current date (404 if not found)
    - Create getHistorial function with pagination
    - Use parameterized queries
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13, 12.14, 12.15, 12.16_

  - [x] 16.2 Implement cash register controller and routes
    - Create GET /api/caja/hoy
    - Create POST /api/caja/apertura
    - Create POST /api/caja/cierre
    - Create GET /api/caja/historial
    - Apply authentication middleware (empleado, admin roles)
    - Apply request validation
    - _Requirements: 2.5, 20.1, 20.2, 20.8_

- [x] 17. Implement Custom Arrangements module
  - [x] 17.1 Implement arrangements service with transaction support
    - Create getAll function including recipe items with inventario details
    - Create getById function with full recipe details
    - Create create function with validation (nombre not empty, margen 0-100)
    - Calculate costo_total as sum of (inventario_item.costo × cantidad) for all recipe items
    - Calculate precio_venta as costo_total × (1 + margen/100)
    - Create arreglos_inventario records for each recipe item
    - Use database transaction for creation
    - Create update function recalculating costo_total and precio_venta
    - Create delete function removing associated arreglos_inventario records (cascade)
    - Use parameterized queries
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 24.1, 24.8_

  - [x] 17.2 Implement arrangements controller and routes
    - Create GET /api/arreglos
    - Create GET /api/arreglos/:id
    - Create POST /api/arreglos
    - Create PUT /api/arreglos/:id
    - Create DELETE /api/arreglos/:id
    - Apply authentication middleware (all roles)
    - Apply request validation
    - _Requirements: 20.1, 20.2, 20.6_

- [x] 18. Implement Promotions module
  - [x] 18.1 Implement promotions service
    - Create getAll function with filtering by activa and date range
    - Create getById function
    - Create create function with validation (titulo not empty, tipo in allowed list, descuento 0-100, fecha_desde <= fecha_hasta)
    - Create update function updating updated_at
    - Create delete function
    - Use parameterized queries
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

  - [x] 18.2 Implement promotions controller and routes
    - Create GET /api/promociones with query parameters
    - Create GET /api/promociones/:id
    - Create POST /api/promociones
    - Create PUT /api/promociones/:id
    - Create DELETE /api/promociones/:id
    - Apply authentication middleware (admin, duena roles)
    - Apply request validation
    - _Requirements: 2.6, 20.1, 20.2_

- [x] 19. Implement Events module
  - [x] 19.1 Implement events service
    - Create getAll function with filtering by activo and fecha, ordered by fecha ascending
    - Create getById function
    - Create create function with validation (nombre not empty, color in allowed list)
    - Create update function updating updated_at
    - Create delete function
    - Use parameterized queries
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [x] 19.2 Implement events controller and routes
    - Create GET /api/eventos with query parameters
    - Create GET /api/eventos/:id
    - Create POST /api/eventos
    - Create PUT /api/eventos/:id
    - Create DELETE /api/eventos/:id
    - Apply authentication middleware (admin, duena roles)
    - Apply request validation
    - _Requirements: 2.6, 20.1, 20.2_

- [x] 20. Implement database integrity and constraints
  - Verify foreign key constraints on all relationship columns (cliente_id, trabajador_id, producto_id, etc.)
  - Verify check constraints on numeric fields (precio >= 0, stock >= 0, descuento 0-100, margen 0-100)
  - Verify unique constraints on usuarios.email and caja.fecha
  - Verify RESTRICT constraint on ventas_productos.producto_id (prevent product deletion if referenced)
  - Verify CASCADE constraint on ventas_productos.venta_id (delete items when sale deleted)
  - Verify CASCADE constraint on arreglos_inventario.arreglo_id (delete recipe when arrangement deleted)
  - Test transaction rollback on errors
  - _Requirements: 24.3, 24.4, 24.5, 24.6, 24.7, 24.8_

- [x] 21. Implement audit trail and timestamps
  - Verify created_at is set automatically on record creation for all tables
  - Verify updated_at is set automatically on record creation for all tables
  - Verify updated_at is automatically updated on record modification via database triggers
  - Verify created_at is never modified on updates
  - Verify all timestamps use UTC timezone
  - Test timestamp behavior across all modules
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

- [x] 22. Implement performance optimizations
  - Verify database indexes exist on frequently queried columns (usuarios.email, ventas.fecha, pedidos.estado, pedidos.fecha_entrega, productos.categoria, inventario.tipo, clientes.telefono)
  - Implement pagination for list endpoints (productos, inventario, ventas, pedidos, clientes, trabajadores, gastos) with default page size 50
  - Test CRUD operations complete within 200ms
  - Test dashboard statistics complete within 2 seconds
  - Test monthly reports complete within 3 seconds
  - Test system handles 50 concurrent requests without degradation
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

- [x] 23. Final integration and testing
  - Test complete authentication flow (login, token validation, role-based access)
  - Test complete sales flow (create sale, deduct stock, update client, record in caja)
  - Test complete order workflow (create, update status, track delivery)
  - Test cash register flow (open, record transactions, close with calculations)
  - Test dashboard real-time statistics accuracy
  - Test monthly reports data accuracy
  - Test error handling for all edge cases
  - Test input validation for all endpoints
  - Test security headers and CORS configuration
  - Test database transaction rollback on errors
  - Verify all API responses follow consistent format
  - _Requirements: 1.1-25.7 (comprehensive integration)_

- [x] 24. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks reference specific requirements for traceability
- Database schema and seed data already exist in database/ directory
- Backend skeleton structure already exists with routes, controllers, and services files
- Focus on implementing business logic, validation, and database operations
- Use parameterized queries throughout to prevent SQL injection
- Implement database transactions for multi-step operations (sales, arrangements)
- All monetary values use DECIMAL(10,2) precision
- All timestamps use UTC timezone
- Password hashing uses bcrypt with 10 salt rounds
- JWT tokens expire after 24 hours
- Connection pooling configured for 2-10 connections
- Checkpoints ensure incremental validation and user feedback
