# Requirements Document

## Introduction

This document specifies the requirements for integrating the frontend HTML pages with the existing backend API for the Florería Encantos Eternos system. The system currently has a functional backend (Node.js + PostgreSQL) with REST API endpoints, but the frontend pages for Inventory, Laboratory (custom arrangements), and Products/Sales are not properly connected. Additionally, when an arrangement is sold, the system does not deduct the raw materials (inventory items) used in the arrangement recipe.

The primary objectives are:
1. Establish proper frontend-to-backend communication for Inventory, Laboratory, and Products/Sales sections
2. Implement inventory deduction logic when arrangements are sold

## Glossary

- **Frontend**: HTML and JavaScript pages located in `/pages/admin/` directory
- **Backend**: Node.js REST API server running on `http://localhost:3000`
- **Inventario_Page**: Frontend page at `/pages/admin/inventario.html` for managing raw materials
- **Laboratorio_Page**: Frontend page at `/pages/admin/laboratorio.html` for creating custom arrangements
- **Productos_Page**: Frontend page at `/pages/admin/productos.html` for managing final products
- **Ventas_Page**: Frontend page at `/pages/admin/ventas.html` for registering sales
- **API_Endpoint**: Backend REST API route (e.g., `/api/inventario`, `/api/productos`)
- **Inventario_Item**: Raw material stored in `inventario` table (flowers, materials, accessories)
- **Producto**: Final product stored in `productos` table (Ramos, Arreglos, Peluches, etc.)
- **Arreglo**: Custom arrangement created in Laboratory with a recipe of inventory items
- **Receta**: Recipe stored in `arreglos_inventario` table linking arrangement to inventory items with quantities
- **Stock**: Available quantity of an item
- **HTTP_Method**: REST API method (GET, POST, PUT, PATCH, DELETE)
- **Content_Type_Header**: HTTP header specifying `application/json`
- **Venta**: Sale transaction recorded in `ventas` table

## Requirements

### Requirement 1: Frontend Inventory Page Integration

**User Story:** As an administrator, I want the Inventory page to communicate with the backend API, so that I can view and manage real inventory data.

#### Acceptance Criteria

1. WHEN THE Inventario_Page loads, THE Frontend SHALL send a GET request to `/api/inventario` with authentication token
2. WHEN THE Backend returns inventory data, THE Inventario_Page SHALL display all Inventario_Items in a table format
3. WHEN an administrator creates a new Inventario_Item, THE Frontend SHALL send a POST request to `/api/inventario` with Content_Type_Header set to `application/json`
4. WHEN an administrator updates an Inventario_Item, THE Frontend SHALL send a PUT request to `/api/inventario/:id` with Content_Type_Header set to `application/json`
5. WHEN an administrator deletes an Inventario_Item, THE Frontend SHALL send a DELETE request to `/api/inventario/:id` with authentication token
6. WHEN THE Backend returns an error response, THE Inventario_Page SHALL display the error message to the user
7. THE Inventario_Page SHALL display stock alerts for items where stock is less than or equal to stock_min

### Requirement 2: Frontend Laboratory Page Integration

**User Story:** As a florist, I want the Laboratory page to load real inventory data and save arrangements to the backend, so that I can create custom arrangements with accurate pricing.

#### Acceptance Criteria

1. WHEN THE Laboratorio_Page loads, THE Frontend SHALL send a GET request to `/api/inventario` with authentication token
2. WHEN THE Backend returns inventory data, THE Laboratorio_Page SHALL display available Inventario_Items for selection
3. WHEN a florist saves an Arreglo, THE Frontend SHALL send a POST request to `/api/arreglos` with Content_Type_Header set to `application/json`
4. THE Frontend SHALL include in the POST request the arrangement name, profit margin, total cost, sale price, and Receta array
5. WHEN THE Backend successfully creates the Arreglo, THE Laboratorio_Page SHALL display a success message
6. WHEN THE Backend returns an error response, THE Laboratorio_Page SHALL display the error message to the user

### Requirement 3: Frontend Products Page Integration

**User Story:** As an administrator, I want the Products page to communicate with the backend API, so that I can view and manage real product data.

#### Acceptance Criteria

1. WHEN THE Productos_Page loads, THE Frontend SHALL send a GET request to `/api/productos` with authentication token
2. WHEN THE Backend returns product data, THE Productos_Page SHALL display all Productos in a table format
3. WHEN an administrator creates a new Producto, THE Frontend SHALL send a POST request to `/api/productos` with Content_Type_Header set to `application/json`
4. WHEN an administrator updates a Producto, THE Frontend SHALL send a PUT request to `/api/productos/:id` with Content_Type_Header set to `application/json`
5. WHEN an administrator deletes a Producto, THE Frontend SHALL send a DELETE request to `/api/productos/:id` with authentication token
6. THE Productos_Page SHALL calculate and display profit margin as `(precio - costo) / precio * 100`
7. WHEN THE Backend returns an error response, THE Productos_Page SHALL display the error message to the user

### Requirement 4: Frontend Sales Page Integration

**User Story:** As a salesperson, I want the Sales page to load real products and register sales through the backend, so that I can process customer transactions.

#### Acceptance Criteria

1. WHEN THE Ventas_Page loads, THE Frontend SHALL send a GET request to `/api/productos` with authentication token
2. WHEN THE Backend returns product data, THE Ventas_Page SHALL display available Productos for sale
3. WHEN a salesperson registers a sale, THE Frontend SHALL send a POST request to `/api/ventas` with Content_Type_Header set to `application/json`
4. THE Frontend SHALL include in the POST request the productos array, metodo_pago, trabajador_id, and optional cliente_id
5. WHEN THE Backend successfully creates the Venta, THE Ventas_Page SHALL display a success message
6. WHEN THE Backend returns an error response, THE Ventas_Page SHALL display the error message to the user

### Requirement 5: Arrangement Recipe Retrieval

**User Story:** As a system, I need to retrieve arrangement recipes from the database, so that I can determine which inventory items to deduct when an arrangement is sold.

#### Acceptance Criteria

1. WHEN a Producto with categoria "Arreglos" is sold, THE Frontend SHALL send a GET request to `/api/arreglos/:id` to retrieve the Receta
2. THE Backend SHALL return the Arreglo with all associated Inventario_Items and quantities from the arreglos_inventario table
3. IF THE Producto is not linked to an Arreglo, THE Frontend SHALL proceed with the sale without inventory deduction
4. WHEN THE Backend returns the Receta, THE Frontend SHALL extract the inventario_id and cantidad for each item

### Requirement 6: Stock Validation Before Sale

**User Story:** As a system, I need to validate that sufficient inventory stock exists before completing a sale, so that I can prevent overselling and maintain accurate inventory records.

#### Acceptance Criteria

1. WHEN a Producto with categoria "Arreglos" is being sold, THE Frontend SHALL calculate the required quantity as `cantidad_receta × cantidad_vendida` for each Inventario_Item
2. FOR EACH Inventario_Item in the Receta, THE Frontend SHALL send a GET request to `/api/inventario/:id` to retrieve current stock
3. IF any Inventario_Item has insufficient stock, THE Frontend SHALL cancel the sale and display an error message listing the items with insufficient stock
4. THE error message SHALL include the item name, required quantity, and available stock
5. IF all Inventario_Items have sufficient stock, THE Frontend SHALL proceed with the sale

### Requirement 7: Inventory Deduction on Arrangement Sale

**User Story:** As a system, I need to deduct inventory items when an arrangement is sold, so that inventory levels accurately reflect material usage.

#### Acceptance Criteria

1. WHEN a Venta is successfully created for a Producto with categoria "Arreglos", THE Frontend SHALL deduct inventory for each item in the Receta
2. FOR EACH Inventario_Item in the Receta, THE Frontend SHALL send a PUT request to `/api/inventario/:id` with the updated stock value
3. THE updated stock value SHALL be calculated as `current_stock - (cantidad_receta × cantidad_vendida)`
4. IF any inventory deduction fails, THE Frontend SHALL display an error message but SHALL NOT reverse the sale
5. WHEN all inventory deductions succeed, THE Frontend SHALL display a success message confirming the sale and inventory update

### Requirement 8: User Confirmation for Arrangement Sales

**User Story:** As a salesperson, I want to be notified before completing an arrangement sale that inventory will be deducted, so that I can confirm the transaction with full awareness.

#### Acceptance Criteria

1. WHEN a salesperson attempts to sell a Producto with categoria "Arreglos", THE Frontend SHALL display a confirmation dialog
2. THE confirmation dialog SHALL state "Esta venta descontará insumos del inventario"
3. THE confirmation dialog SHALL list all Inventario_Items that will be deducted with their quantities
4. IF THE salesperson confirms, THE Frontend SHALL proceed with stock validation and sale processing
5. IF THE salesperson cancels, THE Frontend SHALL abort the sale without making any backend requests

### Requirement 9: Error Handling for Insufficient Stock

**User Story:** As a salesperson, I want to receive clear error messages when an arrangement cannot be sold due to insufficient inventory, so that I can inform the customer and take appropriate action.

#### Acceptance Criteria

1. WHEN stock validation fails for an arrangement sale, THE Frontend SHALL display an error message
2. THE error message SHALL state "Stock insuficiente para completar el arreglo"
3. THE error message SHALL list each Inventario_Item with insufficient stock, showing required quantity and available stock
4. THE Frontend SHALL NOT create the Venta when stock validation fails
5. THE Frontend SHALL allow the salesperson to modify the sale quantity or cancel the transaction

### Requirement 10: HTTP Request Configuration

**User Story:** As a developer, I need all frontend API requests to be properly configured, so that the backend can process them correctly.

#### Acceptance Criteria

1. THE Frontend SHALL set the Content_Type_Header to `application/json` for all POST and PUT requests
2. THE Frontend SHALL include the authentication token in the Authorization header for all API requests
3. THE Frontend SHALL use the base URL `http://localhost:3000` for all API_Endpoints
4. THE Frontend SHALL use the correct HTTP_Method for each operation: GET for retrieval, POST for creation, PUT for updates, DELETE for deletion
5. WHEN THE Backend returns a 401 Unauthorized response, THE Frontend SHALL redirect the user to the login page

### Requirement 11: Modular JavaScript Functions

**User Story:** As a developer, I need modular and reusable JavaScript functions for arrangement sales, so that the code is maintainable and testable.

#### Acceptance Criteria

1. THE Frontend SHALL implement a function `obtenerReceta(arregloId)` that returns the Receta for a given Arreglo
2. THE Frontend SHALL implement a function `validarStock(insumos)` that validates sufficient stock for all required Inventario_Items
3. THE Frontend SHALL implement a function `descontarInsumos(insumos)` that deducts stock for all Inventario_Items in the Receta
4. THE Frontend SHALL implement a function `procesarVenta(producto, cantidad)` that orchestrates the complete sale process including validation and inventory deduction
5. EACH function SHALL handle errors gracefully and return meaningful error messages

### Requirement 12: Arrangement Recipe Parser

**User Story:** As a system, I need to parse arrangement recipes correctly, so that I can accurately calculate inventory requirements.

#### Acceptance Criteria

1. WHEN THE Frontend receives a Receta from `/api/arreglos/:id`, THE Frontend SHALL parse the JSON response into an array of objects
2. EACH object in the array SHALL contain inventario_id, cantidad, and optionally the item nombre and costo
3. THE Frontend SHALL validate that each inventario_id is a positive integer
4. THE Frontend SHALL validate that each cantidad is a positive number
5. IF THE Receta is malformed or missing required fields, THE Frontend SHALL display an error message and abort the sale

### Requirement 13: Round-Trip Data Integrity

**User Story:** As a system, I need to ensure data integrity when creating arrangements, so that the recipe can be accurately retrieved and used for inventory deduction.

#### Acceptance Criteria

1. WHEN an Arreglo is created via POST `/api/arreglos`, THE Backend SHALL store all Receta items in the arreglos_inventario table
2. WHEN THE same Arreglo is retrieved via GET `/api/arreglos/:id`, THE Backend SHALL return all Receta items with the same inventario_id and cantidad values
3. THE Frontend SHALL verify that the retrieved Receta matches the original recipe by comparing inventario_id and cantidad for each item
4. IF any discrepancy is detected, THE Frontend SHALL log an error and notify the administrator
5. THE Frontend SHALL NOT proceed with inventory deduction if recipe integrity cannot be verified

### Requirement 14: Concurrent Sale Handling

**User Story:** As a system, I need to handle concurrent sales of the same arrangement, so that inventory is not over-deducted or under-deducted.

#### Acceptance Criteria

1. WHEN multiple sales of the same Arreglo occur simultaneously, THE Backend SHALL process inventory updates sequentially
2. THE Backend SHALL use database transactions to ensure atomic inventory updates
3. IF a concurrent sale causes insufficient stock, THE Backend SHALL return an error response with status code 409 Conflict
4. THE Frontend SHALL retry the stock validation when receiving a 409 response
5. THE Frontend SHALL display an error message if stock becomes insufficient after retry

### Requirement 15: Arrangement Sale Logging

**User Story:** As an administrator, I want all arrangement sales and inventory deductions to be logged, so that I can audit transactions and troubleshoot issues.

#### Acceptance Criteria

1. WHEN an Arreglo is sold, THE Frontend SHALL log the sale details including producto_id, cantidad, and timestamp
2. WHEN inventory is deducted, THE Frontend SHALL log each Inventario_Item deduction including inventario_id, cantidad_deducted, and new stock value
3. THE Frontend SHALL log all API requests and responses for arrangement sales
4. THE Frontend SHALL log all errors encountered during the sale process
5. THE logs SHALL be accessible via the browser console for debugging purposes

