# Requirements Document

## Introduction

This document specifies the functional and non-functional requirements for the complete backend system of "Florería Encantos Eternos" (Eternal Charms Flower Shop). The backend provides a RESTful API to support a flower shop management system, including authentication, authorization, product catalog, inventory management, sales processing, order tracking, cash register operations, reporting, and administrative functions.

The system serves three user roles: administrators (admin) with full access, employees (empleado) with operational access, and owners (duena) with reporting and analytics access. The backend implements a clean layered architecture with Express.js and PostgreSQL, ensuring security, performance, and maintainability.

## Glossary

- **API**: Application Programming Interface - the RESTful web service interface
- **Authentication_System**: The JWT-based authentication mechanism
- **Authorization_System**: The role-based access control mechanism
- **Backend_API**: The complete Express.js server application
- **Cash_Register_Service**: Service managing daily cash register operations
- **Client_Database**: The clientes table and associated operations
- **Dashboard_Service**: Service providing real-time statistics and metrics
- **Database_Layer**: PostgreSQL database with connection pooling
- **Expense_Service**: Service managing business expenses
- **Inventory_Service**: Service managing flowers and materials stock
- **JWT_Token**: JSON Web Token used for authentication
- **Order_Service**: Service managing customer orders
- **Password_Hasher**: bcrypt-based password hashing utility
- **Product_Service**: Service managing product catalog
- **Report_Service**: Service generating monthly reports and analytics
- **Request_Validator**: Input validation middleware
- **Sales_Service**: Service managing sales transactions
- **Security_Middleware**: Helmet, CORS, and security headers
- **User**: A system user (worker) with a specific role
- **Worker_Service**: Service managing employee accounts

## Requirements

### Requirement 1: User Authentication

**User Story:** As a worker, I want to securely log in to the system, so that I can access features appropriate to my role.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE Authentication_System SHALL generate a JWT_Token with 24-hour expiration
2. WHEN a user submits invalid credentials, THE Authentication_System SHALL return a 401 error with message "Credenciales inválidas"
3. WHEN a user's account is inactive, THE Authentication_System SHALL return a 403 error with message "Cuenta inactiva"
4. THE Password_Hasher SHALL use bcrypt with 10 salt rounds for all password operations
5. WHEN a JWT_Token is generated, THE Authentication_System SHALL include user id, email, rol, and nombre in the payload
6. THE Authentication_System SHALL validate password minimum length of 6 characters
7. FOR ALL valid user credentials, hashing the password then comparing with bcrypt SHALL return true (round-trip property)

### Requirement 2: Token-Based Authorization

**User Story:** As a system administrator, I want role-based access control, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN a request includes a valid JWT_Token, THE Authorization_System SHALL extract the user role from the token
2. WHEN a request lacks a JWT_Token, THE Authorization_System SHALL return a 401 error with message "Token no proporcionado"
3. WHEN a JWT_Token is expired or invalid, THE Authorization_System SHALL return a 401 error with message "Token inválido o expirado"
4. WHERE a route requires admin role, THE Authorization_System SHALL deny access to empleado and duena roles with 403 error
5. WHERE a route requires empleado role, THE Authorization_System SHALL allow access to admin and empleado roles only
6. WHERE a route requires duena role, THE Authorization_System SHALL allow access to admin and duena roles only
7. THE Authorization_System SHALL validate JWT_Token signature using the configured secret key

### Requirement 3: Dashboard Statistics

**User Story:** As a manager, I want to view real-time business statistics, so that I can monitor performance and make informed decisions.

#### Acceptance Criteria

1. WHEN dashboard data is requested, THE Dashboard_Service SHALL calculate total sales for current day
2. WHEN dashboard data is requested, THE Dashboard_Service SHALL calculate total sales for current month
3. WHEN dashboard data is requested, THE Dashboard_Service SHALL calculate profit for current month (sales minus expenses)
4. WHEN dashboard data is requested, THE Dashboard_Service SHALL calculate profit margin percentage for current month
5. WHEN dashboard data is requested, THE Dashboard_Service SHALL count pending orders
6. WHEN dashboard data is requested, THE Dashboard_Service SHALL count orders for current day
7. WHEN dashboard data is requested, THE Dashboard_Service SHALL return inventory items where stock is less than or equal to stock_min
8. WHEN dashboard data is requested, THE Dashboard_Service SHALL return sales totals for the last 7 days grouped by date
9. WHEN dashboard data is requested, THE Dashboard_Service SHALL return top 5 products by sales quantity for current month
10. WHEN dashboard data is requested, THE Dashboard_Service SHALL return sales totals by worker for current month
11. THE Dashboard_Service SHALL complete all calculations within 2 seconds

### Requirement 4: Product Management

**User Story:** As an administrator, I want to manage the product catalog, so that I can maintain accurate product information and pricing.

#### Acceptance Criteria

1. WHEN a product is created, THE Product_Service SHALL validate that nombre is not empty
2. WHEN a product is created, THE Product_Service SHALL validate that precio is greater than or equal to zero
3. WHEN a product is created, THE Product_Service SHALL validate that costo is greater than or equal to zero
4. WHEN a product is created, THE Product_Service SHALL validate that stock is greater than or equal to zero
5. WHEN a product is created, THE Product_Service SHALL validate that categoria is one of: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros
6. WHEN a product is updated, THE Product_Service SHALL preserve the created_at timestamp
7. WHEN a product is updated, THE Product_Service SHALL update the updated_at timestamp to current time
8. WHEN a product is deleted, THE Product_Service SHALL set activo to false instead of removing the record
9. WHEN products are listed, THE Product_Service SHALL support filtering by categoria
10. WHEN products are listed, THE Product_Service SHALL support filtering by activo status
11. THE Product_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 5: Inventory Management

**User Story:** As an inventory manager, I want to track flowers and materials stock, so that I can maintain adequate supplies and receive low stock alerts.

#### Acceptance Criteria

1. WHEN an inventory item is created, THE Inventory_Service SHALL validate that nombre is not empty
2. WHEN an inventory item is created, THE Inventory_Service SHALL validate that tipo is one of: flores, materiales, accesorios
3. WHEN an inventory item is created, THE Inventory_Service SHALL validate that stock is greater than or equal to zero
4. WHEN an inventory item is created, THE Inventory_Service SHALL validate that costo is greater than or equal to zero
5. WHEN an inventory item is updated, THE Inventory_Service SHALL update the updated_at timestamp
6. WHEN inventory items are queried with stock_bajo filter, THE Inventory_Service SHALL return only items where stock is less than or equal to stock_min
7. WHEN inventory items are listed, THE Inventory_Service SHALL support filtering by tipo
8. THE Inventory_Service SHALL order low stock items by stock ascending
9. THE Inventory_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 6: Sales Transaction Processing

**User Story:** As a sales employee, I want to process sales transactions, so that I can record customer purchases and update inventory.

#### Acceptance Criteria

1. WHEN a sale is created, THE Sales_Service SHALL validate that productos array is not empty
2. WHEN a sale is created, THE Sales_Service SHALL validate that metodo_pago is one of: Efectivo, Yape, Plin, Tarjeta, Transferencia bancaria
3. WHEN a sale is created, THE Sales_Service SHALL calculate total as sum of all producto subtotals
4. WHEN a sale is created, THE Sales_Service SHALL create ventas_productos records for each product
5. WHEN a sale is created, THE Sales_Service SHALL deduct cantidad from productos.stock for each product
6. WHEN a sale is created and stock becomes insufficient, THE Sales_Service SHALL return a 400 error with message "Stock insuficiente"
7. WHEN a sale is created, THE Sales_Service SHALL record the trabajador_id from the authenticated user
8. WHEN a sale is created with cliente_id, THE Sales_Service SHALL update cliente ultima_compra to current date
9. WHEN a sale is created, THE Sales_Service SHALL use a database transaction to ensure atomicity
10. IF a database error occurs during sale creation, THEN THE Sales_Service SHALL rollback all changes
11. WHEN sales are queried, THE Sales_Service SHALL support filtering by fecha
12. WHEN sales are queried, THE Sales_Service SHALL support filtering by metodo_pago
13. WHEN sales are queried, THE Sales_Service SHALL support filtering by trabajador_id
14. THE Sales_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 7: Order Management

**User Story:** As an employee, I want to manage customer orders, so that I can track order status from creation to delivery.

#### Acceptance Criteria

1. WHEN an order is created, THE Order_Service SHALL validate that cliente_nombre is not empty
2. WHEN an order is created, THE Order_Service SHALL validate that cliente_telefono is not empty
3. WHEN an order is created, THE Order_Service SHALL validate that fecha_entrega is not empty
4. WHEN an order is created, THE Order_Service SHALL validate that descripcion is not empty
5. WHEN an order is created, THE Order_Service SHALL set estado to "pendiente"
6. WHEN an order is created, THE Order_Service SHALL set fecha_pedido to current timestamp
7. WHEN an order status is updated, THE Order_Service SHALL validate that new estado is one of: pendiente, en preparación, listo para entrega, entregado, cancelado
8. WHEN an order is updated, THE Order_Service SHALL update the updated_at timestamp
9. WHEN orders are queried, THE Order_Service SHALL support filtering by estado
10. WHEN orders are queried, THE Order_Service SHALL support filtering by cliente_telefono
11. WHEN orders are queried, THE Order_Service SHALL support filtering by fecha_entrega
12. WHEN pending orders are listed, THE Order_Service SHALL order by fecha_entrega ascending
13. THE Order_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 8: Client Database Management

**User Story:** As an employee, I want to manage client information, so that I can maintain customer contact details and purchase history.

#### Acceptance Criteria

1. WHEN a client is created, THE Client_Database SHALL validate that nombre is not empty
2. WHEN a client is created, THE Client_Database SHALL validate that telefono is not empty
3. WHEN a client is updated, THE Client_Database SHALL update the updated_at timestamp
4. WHEN a client is queried by telefono, THE Client_Database SHALL return the matching client record
5. WHEN clients are listed, THE Client_Database SHALL support pagination
6. THE Client_Database SHALL use parameterized queries to prevent SQL injection

### Requirement 9: Worker Account Management

**User Story:** As an administrator, I want to manage worker accounts, so that I can control system access and assign appropriate roles.

#### Acceptance Criteria

1. WHEN a worker is created, THE Worker_Service SHALL validate that nombre is not empty
2. WHEN a worker is created, THE Worker_Service SHALL validate that email is not empty and is unique
3. WHEN a worker is created, THE Worker_Service SHALL validate that password meets minimum length of 6 characters
4. WHEN a worker is created, THE Worker_Service SHALL validate that rol is one of: admin, empleado, duena
5. WHEN a worker is created, THE Worker_Service SHALL hash the password using bcrypt with 10 salt rounds
6. WHEN a worker is created, THE Worker_Service SHALL set activo to true by default
7. WHEN a worker is updated, THE Worker_Service SHALL not allow email changes if new email already exists
8. WHEN a worker password is updated, THE Worker_Service SHALL hash the new password
9. WHEN a worker is deleted, THE Worker_Service SHALL set activo to false instead of removing the record
10. WHERE the requester role is not admin, THE Worker_Service SHALL deny all operations with 403 error
11. THE Worker_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 10: Expense Tracking

**User Story:** As a manager, I want to track business expenses, so that I can monitor costs and calculate profitability.

#### Acceptance Criteria

1. WHEN an expense is created, THE Expense_Service SHALL validate that descripcion is not empty
2. WHEN an expense is created, THE Expense_Service SHALL validate that categoria is one of: flores, transporte, materiales, mantenimiento, otros
3. WHEN an expense is created, THE Expense_Service SHALL validate that monto is greater than or equal to zero
4. WHEN an expense is created, THE Expense_Service SHALL validate that fecha is not empty
5. WHEN expenses are queried, THE Expense_Service SHALL support filtering by mes (YYYY-MM format)
6. WHEN expenses are queried, THE Expense_Service SHALL support filtering by categoria
7. THE Expense_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 11: Monthly Reports

**User Story:** As a manager, I want to generate monthly reports, so that I can analyze business performance and trends.

#### Acceptance Criteria

1. WHEN a monthly report is requested, THE Report_Service SHALL validate that mes parameter is in YYYY-MM format
2. WHEN a monthly report is requested, THE Report_Service SHALL calculate total sales for the specified month
3. WHEN a monthly report is requested, THE Report_Service SHALL calculate total expenses for the specified month
4. WHEN a monthly report is requested, THE Report_Service SHALL calculate total orders for the specified month
5. WHEN a monthly report is requested, THE Report_Service SHALL return daily sales totals grouped by date
6. WHEN a monthly report is requested, THE Report_Service SHALL return sales totals grouped by metodo_pago
7. WHEN a monthly report is requested, THE Report_Service SHALL return top 10 products by sales quantity
8. WHEN a monthly report is requested, THE Report_Service SHALL return sales totals by worker
9. THE Report_Service SHALL complete report generation within 3 seconds

### Requirement 12: Cash Register Operations

**User Story:** As an employee, I want to manage daily cash register operations, so that I can track cash flow and reconcile daily totals.

#### Acceptance Criteria

1. WHEN a cash register is opened, THE Cash_Register_Service SHALL validate that no other register is open for the same date
2. WHEN a cash register is opened, THE Cash_Register_Service SHALL validate that monto_apertura is greater than or equal to zero
3. WHEN a cash register is opened, THE Cash_Register_Service SHALL set estado to "abierta"
4. WHEN a cash register is opened, THE Cash_Register_Service SHALL record trabajador_apertura_id from authenticated user
5. WHEN a cash register is opened, THE Cash_Register_Service SHALL set fecha to current date
6. WHEN a cash register is closed, THE Cash_Register_Service SHALL validate that a register is open for current date
7. WHEN a cash register is closed, THE Cash_Register_Service SHALL calculate total_efectivo from sales with metodo_pago "Efectivo"
8. WHEN a cash register is closed, THE Cash_Register_Service SHALL calculate total_digital from sales with metodo_pago "Yape" or "Plin"
9. WHEN a cash register is closed, THE Cash_Register_Service SHALL calculate total_tarjeta from sales with metodo_pago "Tarjeta" or "Transferencia bancaria"
10. WHEN a cash register is closed, THE Cash_Register_Service SHALL calculate total_ventas as sum of all payment methods
11. WHEN a cash register is closed, THE Cash_Register_Service SHALL calculate total_gastos from expenses for current date
12. WHEN a cash register is closed, THE Cash_Register_Service SHALL set estado to "cerrada"
13. WHEN a cash register is closed, THE Cash_Register_Service SHALL record trabajador_cierre_id from authenticated user
14. WHEN current cash register is queried, THE Cash_Register_Service SHALL return the register for current date
15. IF no register exists for current date, THEN THE Cash_Register_Service SHALL return a 404 error with message "No hay caja abierta"
16. THE Cash_Register_Service SHALL use parameterized queries to prevent SQL injection

### Requirement 13: Custom Arrangement Management

**User Story:** As a florist, I want to create and manage custom flower arrangements with recipes, so that I can calculate costs and pricing accurately.

#### Acceptance Criteria

1. WHEN an arrangement is created, THE Backend_API SHALL validate that nombre is not empty
2. WHEN an arrangement is created, THE Backend_API SHALL validate that margen is between 0 and 100
3. WHEN an arrangement is created, THE Backend_API SHALL calculate costo_total as sum of (inventario_item.costo × cantidad) for all recipe items
4. WHEN an arrangement is created, THE Backend_API SHALL calculate precio_venta as costo_total × (1 + margen/100)
5. WHEN an arrangement is created, THE Backend_API SHALL create arreglos_inventario records for each recipe item
6. WHEN an arrangement is updated, THE Backend_API SHALL recalculate costo_total and precio_venta
7. WHEN an arrangement is deleted, THE Backend_API SHALL remove associated arreglos_inventario records
8. WHEN arrangements are listed, THE Backend_API SHALL include recipe items with inventario details
9. THE Backend_API SHALL use parameterized queries to prevent SQL injection

### Requirement 14: Promotion Management

**User Story:** As a marketing manager, I want to manage promotions and discounts, so that I can run special offers and increase sales.

#### Acceptance Criteria

1. WHEN a promotion is created, THE Backend_API SHALL validate that titulo is not empty
2. WHEN a promotion is created, THE Backend_API SHALL validate that tipo is one of: porcentaje, 2x1, precio_fijo, regalo
3. WHEN a promotion is created, THE Backend_API SHALL validate that descuento is between 0 and 100
4. WHEN a promotion is created, THE Backend_API SHALL validate that fecha_desde is before or equal to fecha_hasta
5. WHEN a promotion is updated, THE Backend_API SHALL update the updated_at timestamp
6. WHEN promotions are queried with activa filter, THE Backend_API SHALL return only promotions where activa is true
7. WHEN promotions are queried, THE Backend_API SHALL support filtering by date range
8. THE Backend_API SHALL use parameterized queries to prevent SQL injection

### Requirement 15: Special Events Management

**User Story:** As a manager, I want to manage special events calendar, so that I can plan for high-demand periods like Valentine's Day and Mother's Day.

#### Acceptance Criteria

1. WHEN an event is created, THE Backend_API SHALL validate that nombre is not empty
2. WHEN an event is created, THE Backend_API SHALL validate that color is one of: rosa, dorado, rojo, morado
3. WHEN an event is updated, THE Backend_API SHALL update the updated_at timestamp
4. WHEN events are queried with activo filter, THE Backend_API SHALL return only events where activo is true
5. WHEN events are queried, THE Backend_API SHALL support filtering by fecha
6. WHEN events are listed, THE Backend_API SHALL order by fecha ascending
7. THE Backend_API SHALL use parameterized queries to prevent SQL injection

### Requirement 16: Database Connection Management

**User Story:** As a system administrator, I want reliable database connections, so that the system can handle concurrent requests efficiently.

#### Acceptance Criteria

1. THE Database_Layer SHALL use connection pooling with minimum 2 connections
2. THE Database_Layer SHALL use connection pooling with maximum 10 connections
3. WHEN a database query fails, THE Database_Layer SHALL return a descriptive error message
4. WHEN a database connection is lost, THE Database_Layer SHALL attempt to reconnect automatically
5. THE Database_Layer SHALL close idle connections after 30 seconds
6. THE Database_Layer SHALL validate connection health before executing queries

### Requirement 17: Input Validation and Sanitization

**User Story:** As a security officer, I want all user inputs validated and sanitized, so that the system is protected from injection attacks and malformed data.

#### Acceptance Criteria

1. WHEN a request is received, THE Request_Validator SHALL validate all required fields are present
2. WHEN a request is received, THE Request_Validator SHALL validate data types match expected types
3. WHEN a request contains invalid data, THE Request_Validator SHALL return a 400 error with detailed validation messages
4. THE Request_Validator SHALL sanitize string inputs to remove potentially harmful characters
5. THE Request_Validator SHALL validate email format using standard email regex
6. THE Request_Validator SHALL validate numeric fields are within acceptable ranges
7. THE Request_Validator SHALL validate date fields are in valid ISO 8601 format

### Requirement 18: Security Headers and CORS

**User Story:** As a security officer, I want security headers and CORS configured, so that the API is protected from common web vulnerabilities.

#### Acceptance Criteria

1. THE Security_Middleware SHALL set X-Content-Type-Options header to "nosniff"
2. THE Security_Middleware SHALL set X-Frame-Options header to "DENY"
3. THE Security_Middleware SHALL set X-XSS-Protection header to "1; mode=block"
4. THE Security_Middleware SHALL set Strict-Transport-Security header for HTTPS connections
5. THE Security_Middleware SHALL configure CORS to allow requests only from configured frontend origin
6. THE Security_Middleware SHALL allow HTTP methods: GET, POST, PUT, DELETE, OPTIONS
7. THE Security_Middleware SHALL allow headers: Content-Type, Authorization
8. WHERE the request origin is not in the allowed list, THE Security_Middleware SHALL reject the request with 403 error

### Requirement 19: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error handling and logging, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN an error occurs, THE Backend_API SHALL return a standardized error response with error, mensaje, and optional detalles fields
2. WHEN a 400 error occurs, THE Backend_API SHALL include validation error details in the response
3. WHEN a 401 error occurs, THE Backend_API SHALL return message "No autorizado"
4. WHEN a 403 error occurs, THE Backend_API SHALL return message "Acceso denegado"
5. WHEN a 404 error occurs, THE Backend_API SHALL return message "Recurso no encontrado"
6. WHEN a 500 error occurs, THE Backend_API SHALL log the full error stack trace
7. WHEN a 500 error occurs, THE Backend_API SHALL return a generic error message without exposing internal details
8. THE Backend_API SHALL log all incoming requests with method, path, and timestamp
9. THE Backend_API SHALL log all database queries in development mode
10. THE Backend_API SHALL log all authentication attempts with success or failure status

### Requirement 20: API Response Format Consistency

**User Story:** As a frontend developer, I want consistent API response formats, so that I can handle responses predictably.

#### Acceptance Criteria

1. WHEN an operation succeeds, THE Backend_API SHALL return a response with success: true
2. WHEN an operation succeeds, THE Backend_API SHALL include the result data in a data field
3. WHEN an operation succeeds with a message, THE Backend_API SHALL include the message in a mensaje field
4. WHEN an operation fails, THE Backend_API SHALL return a response with error: true
5. WHEN an operation fails, THE Backend_API SHALL include an error message in a mensaje field
6. WHEN a resource is created, THE Backend_API SHALL return HTTP status 201
7. WHEN a resource is successfully retrieved or updated, THE Backend_API SHALL return HTTP status 200
8. WHEN a resource is not found, THE Backend_API SHALL return HTTP status 404
9. THE Backend_API SHALL return all responses with Content-Type: application/json

### Requirement 21: Performance and Scalability

**User Story:** As a system administrator, I want the API to perform efficiently under load, so that users experience fast response times.

#### Acceptance Criteria

1. WHEN a simple CRUD operation is requested, THE Backend_API SHALL respond within 200 milliseconds
2. WHEN dashboard statistics are requested, THE Backend_API SHALL respond within 2 seconds
3. WHEN a monthly report is requested, THE Backend_API SHALL respond within 3 seconds
4. THE Backend_API SHALL support at least 50 concurrent requests without degradation
5. THE Database_Layer SHALL use indexes on frequently queried columns (email, fecha, estado, categoria)
6. THE Backend_API SHALL implement pagination for list endpoints with default page size of 50 items
7. WHEN a list endpoint is queried, THE Backend_API SHALL support page and limit query parameters

### Requirement 22: Environment Configuration

**User Story:** As a DevOps engineer, I want environment-based configuration, so that I can deploy the system to different environments without code changes.

#### Acceptance Criteria

1. THE Backend_API SHALL load configuration from environment variables
2. THE Backend_API SHALL require DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD environment variables
3. THE Backend_API SHALL require JWT_SECRET environment variable
4. THE Backend_API SHALL use PORT environment variable with default value 3000
5. THE Backend_API SHALL use JWT_EXPIRES_IN environment variable with default value "24h"
6. THE Backend_API SHALL use CORS_ORIGIN environment variable with default value "http://localhost:5500"
7. IF required environment variables are missing, THEN THE Backend_API SHALL log an error and exit with code 1
8. THE Backend_API SHALL provide an .env.example file with all required variables documented

### Requirement 23: Health Check Endpoint

**User Story:** As a DevOps engineer, I want a health check endpoint, so that I can monitor system availability and database connectivity.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a GET /health endpoint
2. WHEN the health endpoint is requested, THE Backend_API SHALL check database connectivity
3. WHEN the system is healthy, THE Backend_API SHALL return status 200 with message "OK"
4. WHEN the database is unreachable, THE Backend_API SHALL return status 503 with message "Database unavailable"
5. THE Backend_API SHALL respond to health checks within 1 second
6. THE Backend_API SHALL not require authentication for the health endpoint

### Requirement 24: Data Integrity and Transactions

**User Story:** As a database administrator, I want data integrity enforced, so that the database remains consistent even during failures.

#### Acceptance Criteria

1. WHEN a sale is created, THE Sales_Service SHALL use a database transaction to ensure all operations succeed or fail together
2. WHEN a transaction fails, THE Backend_API SHALL rollback all changes made within that transaction
3. THE Database_Layer SHALL enforce foreign key constraints on all relationship columns
4. THE Database_Layer SHALL enforce check constraints on numeric fields (precio >= 0, stock >= 0, descuento between 0 and 100)
5. THE Database_Layer SHALL enforce unique constraints on usuarios.email
6. THE Database_Layer SHALL enforce unique constraints on caja.fecha
7. WHEN a product is referenced in ventas_productos, THE Database_Layer SHALL prevent deletion with RESTRICT constraint
8. WHEN a venta is deleted, THE Database_Layer SHALL cascade delete associated ventas_productos records

### Requirement 25: Audit Trail and Timestamps

**User Story:** As an auditor, I want automatic timestamps on all records, so that I can track when data was created and modified.

#### Acceptance Criteria

1. WHEN a record is created, THE Database_Layer SHALL set created_at to current timestamp
2. WHEN a record is created, THE Database_Layer SHALL set updated_at to current timestamp
3. WHEN a record is updated, THE Database_Layer SHALL automatically update updated_at to current timestamp
4. THE Database_Layer SHALL use database triggers to ensure updated_at is always current
5. THE Backend_API SHALL never allow manual modification of created_at timestamps
6. THE Backend_API SHALL preserve created_at when updating records
7. THE Database_Layer SHALL store all timestamps in UTC timezone

