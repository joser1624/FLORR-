# Implementation Plan: Frontend-Backend Integration with Inventory Deduction

## Overview

This implementation integrates the frontend HTML pages (Inventario, Laboratorio, Productos, Ventas) with the existing backend REST API. The core feature adds automatic inventory deduction when arrangements are sold, including stock validation, user confirmations, and comprehensive error handling.

The implementation is frontend-only, leveraging existing backend endpoints without any backend modifications.

## Tasks

- [x] 1. Set up API utility module with proper configuration
  - Create or enhance API utility module with base URL configuration
  - Implement authentication token handling in Authorization header
  - Add Content-Type header for POST/PUT requests
  - Implement 401 unauthorized redirect to login page
  - Add error response parsing and handling
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.1 Write property test for API request configuration
  - **Property 1: API Request Configuration**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [x] 2. Integrate Inventario page with backend
  - [x] 2.1 Implement inventory data loading via GET /api/inventario
    - Call API on page load with authentication
    - Parse and store inventory items in local state
    - Handle network errors with fallback demo data
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Implement stock alert display
    - Filter items where stock <= stock_min
    - Display alert badges in UI
    - Show count of low stock items
    - _Requirements: 1.7_
  
  - [ ]* 2.3 Write property test for stock alert display
    - **Property 4: Stock Alert Display**
    - **Validates: Requirements 1.7**
  
  - [x] 2.3 Implement create inventory item via POST /api/inventario
    - Collect form data (nombre, tipo, stock, costo, stock_min, unidad)
    - Send POST request with proper headers
    - Handle validation errors and display to user
    - Refresh inventory list on success
    - _Requirements: 1.3, 1.6_
  
  - [x] 2.4 Implement update inventory item via PUT /api/inventario/:id
    - Support stock adjustment functionality
    - Send PUT request with updated fields
    - Handle errors and display messages
    - Update local state on success
    - _Requirements: 1.4, 1.6_
  
  - [x] 2.5 Implement delete inventory item via DELETE /api/inventario/:id
    - Show confirmation dialog before deletion
    - Send DELETE request with authentication
    - Handle errors and display messages
    - Remove from local state on success
    - _Requirements: 1.5, 1.6_

- [ ] 3. Integrate Laboratorio page with backend
  - [x] 3.1 Implement inventory loading for arrangement creation
    - Call GET /api/inventario on page load
    - Display available inventory items in grid
    - Show stock availability for each item
    - Handle network errors gracefully
    - _Requirements: 2.1, 2.2_
  
  - [x] 3.2 Implement quantity selection with stock validation
    - Validate selected quantity does not exceed available stock
    - Update UI to show selected quantities
    - Calculate total cost in real-time
    - _Requirements: 2.2_
  
  - [x] 3.3 Implement arrangement save via POST /api/arreglos
    - Collect arrangement data (nombre, margen, costo, precio)
    - Build receta array with inventario_id and cantidad
    - Send POST request with complete payload
    - Display success message on completion
    - Handle validation errors
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 3.4 Write property test for arrangement payload completeness
    - **Property 5: Request Payload Completeness**
    - **Validates: Requirements 2.4**

- [ ] 4. Integrate Productos page with backend
  - [ ] 4.1 Implement products loading via GET /api/productos
    - Call API on page load with authentication
    - Parse and store products in local state
    - Display products in table format
    - Handle network errors with fallback data
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.2 Implement profit margin calculation and display
    - Calculate margin as (precio - costo) / precio * 100
    - Display margin percentage and absolute value
    - Add visual indicators (green >= 30%, yellow >= 15%, red < 15%)
    - Update in real-time as user edits precio/costo
    - _Requirements: 3.6_
  
  - [ ]* 4.3 Write property test for profit margin calculation
    - **Property 6: Profit Margin Calculation**
    - **Validates: Requirements 3.6**
  
  - [ ] 4.4 Implement create product via POST /api/productos
    - Collect form data (nombre, categoria, precio, costo, stock, descripcion)
    - Send POST request with proper headers
    - Handle validation errors
    - Refresh products list on success
    - _Requirements: 3.3, 3.7_
  
  - [ ] 4.5 Implement update product via PUT /api/productos/:id
    - Support editing all product fields
    - Send PUT request with updated data
    - Handle errors and display messages
    - Update local state on success
    - _Requirements: 3.4, 3.7_
  
  - [ ] 4.6 Implement delete product via DELETE /api/productos/:id
    - Show confirmation dialog with product name
    - Send DELETE request with authentication
    - Handle errors and display messages
    - Remove from local state on success
    - _Requirements: 3.5, 3.7_

- [ ] 5. Checkpoint - Ensure all CRUD operations work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement arrangement sale processing module
  - [ ] 6.1 Implement obtenerReceta(arregloId) function
    - Send GET request to /api/arreglos/:id
    - Validate response structure (must have items array)
    - Parse inventario_id and cantidad for each item
    - Throw error if recipe is invalid or empty
    - Return recipe object with items array
    - _Requirements: 5.1, 5.2, 5.4, 11.1, 12.1, 12.2_
  
  - [ ]* 6.2 Write property test for recipe retrieval function
    - **Property 21: Recipe Retrieval Function**
    - **Validates: Requirements 11.1**
  
  - [ ] 6.3 Implement validarStock(insumos) function
    - For each insumo, fetch current stock via GET /api/inventario/:id
    - Compare available stock vs required quantity
    - Collect all items with insufficient stock
    - Return validation result with valido flag and faltantes array
    - Handle API errors gracefully
    - _Requirements: 6.2, 6.3, 6.4, 11.2_
  
  - [ ]* 6.4 Write property test for stock validation function
    - **Property 22: Stock Validation Function**
    - **Validates: Requirements 11.2**
  
  - [ ] 6.5 Implement descontarInsumos(insumos) function
    - For each insumo, calculate new stock: current - quantity
    - Send PUT request to /api/inventario/:id with new stock
    - Log success/failure for each item
    - Continue processing even if one fails (no rollback)
    - Return result with exitoso flag, actualizados count, and errores array
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 11.3_
  
  - [ ]* 6.6 Write property test for inventory deduction function
    - **Property 23: Inventory Deduction Function**
    - **Validates: Requirements 11.3**
  
  - [ ] 6.7 Implement procesarVentaArreglo(producto, cantidad) function
    - Show confirmation dialog with inventory warning
    - Retrieve recipe via obtenerReceta()
    - Calculate required quantities (recipe × sale quantity)
    - Validate stock via validarStock()
    - If insufficient: show error and abort
    - If sufficient: proceed (sale creation handled by caller)
    - After sale success: deduct inventory via descontarInsumos()
    - Show success/warning messages based on result
    - _Requirements: 5.1, 5.3, 6.1, 6.5, 7.1, 7.4, 7.5, 8.1, 8.4, 11.4_
  
  - [ ]* 6.8 Write property test for sale processing orchestration
    - **Property 24: Sale Processing Orchestration**
    - **Validates: Requirements 11.4**
  
  - [ ]* 6.9 Write property test for required quantity calculation
    - **Property 11: Required Quantity Calculation**
    - **Validates: Requirements 6.1, 7.3**
  
  - [ ]* 6.10 Write property test for recipe validation
    - **Property 25: Recipe Validation**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

- [ ] 7. Integrate Ventas page with arrangement logic
  - [ ] 7.1 Implement products loading for sales
    - Call GET /api/productos on page load
    - Store products in local state
    - Display products available for sale
    - Handle network errors
    - _Requirements: 4.1, 4.2_
  
  - [ ] 7.2 Enhance registrarVenta() to detect arrangements
    - Check if any sale item has categoria === "Arreglos"
    - For each arrangement: call procesarVentaArreglo()
    - If validation fails or user cancels: abort entire sale
    - If validation passes: proceed with sale creation
    - _Requirements: 5.1, 5.3, 6.5, 8.1_
  
  - [ ] 7.3 Implement sale creation via POST /api/ventas
    - Build payload with productos array (producto_id, cantidad, precio_unitario)
    - Include metodo_pago and trabajador_id
    - Send POST request with proper headers
    - Handle validation errors
    - On success: trigger inventory deduction for arrangements
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ]* 7.4 Write property test for sale payload completeness
    - **Property 7: Sale Payload Completeness**
    - **Validates: Requirements 4.4**
  
  - [ ]* 7.5 Write property test for arrangement detection
    - **Property 8: Arrangement Recipe Retrieval**
    - **Validates: Requirements 5.1**
  
  - [ ]* 7.6 Write property test for non-arrangement sales
    - **Property 9: Non-Arrangement Sale Processing**
    - **Validates: Requirements 5.3**

- [ ] 8. Checkpoint - Ensure arrangement sales work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement user confirmations and error handling
  - [ ] 9.1 Create confirmation dialog for arrangement sales
    - Display modal with warning message
    - List all inventory items that will be deducted
    - Show quantity for each item
    - Provide "Confirm" and "Cancel" buttons
    - Return user's choice (confirmed or cancelled)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 9.2 Write property test for confirmation acceptance
    - **Property 18: Confirmation Acceptance**
    - **Validates: Requirements 8.4**
  
  - [ ]* 9.3 Write property test for confirmation cancellation
    - **Property 19: Confirmation Cancellation**
    - **Validates: Requirements 8.5**
  
  - [ ] 9.2 Create error display for insufficient stock
    - Display modal with clear error title
    - List all items with insufficient stock
    - Show required vs available quantity for each
    - Provide actionable suggestions (adjust quantity, restock)
    - _Requirements: 6.3, 6.4, 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 9.4 Write property test for insufficient stock handling
    - **Property 13: Insufficient Stock Handling**
    - **Validates: Requirements 6.3, 6.4, 9.1, 9.2, 9.3, 9.4**
  
  - [ ] 9.3 Implement partial deduction failure warning
    - Display warning toast when some deductions fail
    - List items that failed to update
    - Suggest manual inventory adjustment
    - Do NOT reverse the sale
    - _Requirements: 7.4_
  
  - [ ]* 9.5 Write property test for partial deduction failure
    - **Property 16: Partial Deduction Failure Handling**
    - **Validates: Requirements 7.4**
  
  - [ ] 9.4 Implement network error handling
    - Detect network errors (NetworkError, Failed to fetch)
    - Display user-friendly error message
    - Log detailed error to console
    - Use fallback demo data where appropriate
    - _Requirements: 1.6, 2.6, 3.7, 4.6_
  
  - [ ]* 9.6 Write property test for error display consistency
    - **Property 2: Error Display Consistency**
    - **Validates: Requirements 1.6, 2.6, 3.7, 4.6, 11.5**
  
  - [ ] 9.5 Implement 401 unauthorized redirect
    - Detect 401 status in API responses
    - Display "Sesión expirada" message
    - Wait 1.5 seconds
    - Redirect to /pages/login.html
    - _Requirements: 10.5_
  
  - [ ]* 9.7 Write property test for unauthorized redirect
    - **Property 20: Unauthorized Redirect**
    - **Validates: Requirements 10.5**
  
  - [ ] 9.6 Implement 409 conflict retry logic
    - Detect 409 Conflict status during stock validation
    - Retry stock validation once
    - If still fails: display error with updated stock info
    - Suggest user adjust quantity or cancel
    - _Requirements: 14.3, 14.4, 14.5_
  
  - [ ]* 9.8 Write property test for conflict retry
    - **Property 26: Conflict Retry**
    - **Validates: Requirements 14.4, 14.5**

- [ ] 10. Implement logging for arrangement sales
  - [ ] 10.1 Add console logging for arrangement sales
    - Log sale details (producto_id, cantidad, timestamp)
    - Log recipe retrieval results
    - Log stock validation results
    - Log inventory deduction operations
    - Log all errors with stack traces
    - Use console.group() for related operations
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ]* 10.2 Write property test for arrangement sale logging
    - **Property 27: Arrangement Sale Logging**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4**

- [ ] 11. Final integration and testing
  - [ ] 11.1 Wire all components together
    - Ensure API utility is imported in all pages
    - Ensure arrangement processing module is imported in Ventas page
    - Verify all event handlers are properly attached
    - Test complete flow from product selection to inventory deduction
    - _Requirements: All_
  
  - [ ]* 11.2 Write unit tests for specific scenarios
    - Test insufficient stock error display
    - Test confirmation dialog display
    - Test partial deduction failure
    - Test 401 redirect
    - Test empty recipe handling
    - Test malformed recipe error
    - Test network error handling
  
  - [ ]* 11.3 Write integration test for complete arrangement sale flow
    - Test end-to-end: select arrangement → confirm → validate → create sale → deduct inventory
    - Verify all API calls are made in correct order
    - Verify error handling at each step
    - Verify success messages and UI updates

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All code uses JavaScript (ES6+) with async/await
- Frontend-only implementation, no backend modifications
- Must handle all edge cases in frontend code
