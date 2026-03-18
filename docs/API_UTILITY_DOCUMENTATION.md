# API Utility Module Documentation

## Overview

The API utility module (`js/main.js`) provides a centralized interface for making HTTP requests to the backend REST API. It handles authentication, error responses, and provides consistent error handling across all frontend pages.

## Configuration

### Base URL
```javascript
const API_BASE = 'http://localhost:3000/api';
```

All API requests are made relative to this base URL.

## Features

### 1. Authentication Token Handling

The API utility automatically includes the authentication token in the `Authorization` header for all requests:

```javascript
headers: () => ({
  'Content-Type': 'application/json',
  ...(Auth.getToken() ? { Authorization: `Bearer ${Auth.getToken()}` } : {})
})
```

**Requirements Satisfied:** 10.2

### 2. Content-Type Header

All POST and PUT requests automatically include `Content-Type: application/json` header.

**Requirements Satisfied:** 10.1

### 3. HTTP Methods

The API utility supports all standard HTTP methods:

- `API.get(endpoint)` - GET requests
- `API.post(endpoint, data)` - POST requests
- `API.put(endpoint, data)` - PUT requests
- `API.delete(endpoint)` - DELETE requests
- `API.postForm(endpoint, formData)` - POST with FormData (for file uploads)

**Requirements Satisfied:** 10.4

### 4. Error Response Parsing

The `handleResponse` method parses all API responses and extracts error information:

```javascript
handleResponse: async (response) => {
  // Handle 401 Unauthorized
  if (response.status === 401) {
    Auth.clear();
    Toast.warning('Sesión expirada. Redirigiendo al login...');
    setTimeout(() => {
      window.location.href = '/pages/admin/login.html';
    }, 1500);
    throw new Error('Unauthorized');
  }

  // Parse JSON response
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`Error del servidor (${response.status})`);
  }

  // Handle error responses
  if (!response.ok) {
    const errorMsg = data.error || data.mensaje || data.message || `Error ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.detalles = data.detalles || data.details || [];
    throw error;
  }

  return data;
}
```

**Requirements Satisfied:** 10.5

### 5. 401 Unauthorized Redirect

When the backend returns a 401 status code (unauthorized), the API utility:

1. Clears the authentication session
2. Shows a warning toast message
3. Waits 1.5 seconds
4. Redirects to the login page

**Requirements Satisfied:** 10.5

### 6. Network Error Handling

The `handleError` method detects network connectivity issues and provides user-friendly error messages:

```javascript
handleError: (error) => {
  // Network errors
  if (error.message.includes('NetworkError') || 
      error.message.includes('Failed to fetch') ||
      error.name === 'TypeError') {
    console.error('Network error:', error);
    throw new Error('Error de conexión. Verifica tu conexión a internet.');
  }
  // Re-throw other errors
  throw error;
}
```

**Requirements Satisfied:** 10.5

## Usage Examples

### GET Request

```javascript
async function cargarInventario() {
  try {
    const data = await API.get('/inventario');
    items = data.items || data || [];
    renderInv();
  } catch (error) {
    Toast.error(error.message);
    console.error('Error loading inventory:', error);
  }
}
```

### POST Request

```javascript
async function guardarItem() {
  const payload = {
    nombre: 'Rosas rojas',
    tipo: 'flores',
    stock: 50,
    costo: 3.50
  };
  
  try {
    const result = await API.post('/inventario', payload);
    Toast.success('Ítem agregado');
    cargarInventario();
  } catch (error) {
    Toast.error(error.message);
    console.error('Error saving item:', error);
  }
}
```

### PUT Request

```javascript
async function actualizarStock(id, nuevoStock) {
  try {
    await API.put(`/inventario/${id}`, { stock: nuevoStock });
    Toast.success('Stock actualizado');
  } catch (error) {
    Toast.error(error.message);
    console.error('Error updating stock:', error);
  }
}
```

### DELETE Request

```javascript
async function eliminarItem(id) {
  try {
    await API.delete(`/inventario/${id}`);
    Toast.success('Ítem eliminado');
    cargarInventario();
  } catch (error) {
    Toast.error(error.message);
    console.error('Error deleting item:', error);
  }
}
```

## Error Handling Best Practices

### Always Use Try-Catch

All API calls should be wrapped in try-catch blocks:

```javascript
try {
  const data = await API.get('/endpoint');
  // Handle success
} catch (error) {
  // Handle error
  Toast.error(error.message);
  console.error('Operation failed:', error);
}
```

### Display User-Friendly Messages

Use the Toast utility to show error messages to users:

```javascript
catch (error) {
  Toast.error(error.message);
}
```

### Log Detailed Errors

Always log errors to the console for debugging:

```javascript
catch (error) {
  console.error('Detailed error:', error);
  if (error.detalles) {
    console.error('Validation errors:', error.detalles);
  }
}
```

### Handle Validation Errors

Backend validation errors are available in the `detalles` property:

```javascript
catch (error) {
  if (error.status === 400 && error.detalles) {
    const mensajes = error.detalles.map(d => d.msg).join(', ');
    Toast.error(`Errores de validación: ${mensajes}`);
  } else {
    Toast.error(error.message);
  }
}
```

## Testing

A test page is available at `tests/frontend/api-utility.test.html` to verify:

1. API configuration (base URL, methods)
2. Authentication header handling
3. Content-Type header
4. Error response parsing
5. 401 unauthorized redirect
6. Network error handling

To run tests:

1. Open `tests/frontend/api-utility.test.html` in a browser
2. Click individual test buttons
3. Verify results

## Requirements Traceability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| 10.1 | Content-Type header for POST/PUT | `headers()` method |
| 10.2 | Authentication token in Authorization header | `headers()` method |
| 10.3 | Base URL configuration | `API_BASE` constant |
| 10.4 | Correct HTTP methods | `get()`, `post()`, `put()`, `delete()` |
| 10.5 | 401 redirect and error handling | `handleResponse()`, `handleError()` |

## Related Files

- `js/main.js` - API utility implementation
- `tests/frontend/api-utility.test.html` - Test page
- All HTML pages in `pages/admin/` - Usage examples
