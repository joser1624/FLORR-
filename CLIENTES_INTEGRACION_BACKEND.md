# Integración Backend: Clientes

## ✅ Estado Actual

La sección `clientes.html` ahora está completamente integrada con el backend.

## 🔄 Cambios Realizados

### 1. Carga de Datos desde Backend

**Antes:**
```javascript
// Usaba datos mock hardcodeados con fallback
clientes = [
  { id:1, nombre:'Ana García', telefono:'987654321', ... },
  ...
];
```

**Ahora:**
```javascript
// Carga desde el backend con paginación
const response = await API.get(`/clientes?page=${pagina}&limit=${LIMITE_POR_PAGINA}`);
const result = response.data || response;
clientes = result.clientes || [];
```

### 2. Crear Cliente

**Antes:**
```javascript
// Agregaba al array local sin guardar en BD
clientes.unshift({ id: Date.now(), ...payload });
```

**Ahora:**
```javascript
// Guarda en el backend y recarga
await API.post('/clientes', payload);
await cargarClientes(paginaActual);
```

### 3. Editar Cliente (Nuevo)

**Antes:**
- No existía la funcionalidad

**Ahora:**
```javascript
// Carga el cliente y permite editarlo
await API.get('/clientes/' + id);
// Actualiza en el backend
await API.put('/clientes/' + id, payload);
```

### 4. Eliminar Cliente (Nuevo)

**Antes:**
- No existía la funcionalidad

**Ahora:**
```javascript
// Elimina del backend con confirmación
await API.delete('/clientes/' + id);
await cargarClientes(paginaActual);
```

### 5. Ver Detalles (Nuevo)

**Antes:**
- Solo mostraba un toast con el nombre

**Ahora:**
- Modal completo con todos los datos del cliente
- Información de registro y última actualización
- Botón para editar desde los detalles

### 6. Ordenamiento (Nuevo)

**Agregado:**
- Ordenar por Nombre A-Z / Z-A
- Ordenar por Teléfono
- Ordenar por Fecha (más reciente / más antiguo)

### 7. Paginación (Nuevo)

**Agregado:**
- Soporte para paginación con 50 clientes por página
- Navegación entre páginas
- Contador total de clientes

### 8. Validaciones Mejoradas

**Agregadas:**
- ✅ Nombre obligatorio
- ✅ Teléfono obligatorio (9 dígitos)
- ✅ Email opcional (formato válido)
- ✅ Dirección opcional
- ✅ Mensajes de error específicos

### 9. Interfaz Mejorada

**Cambios:**
- Columna de Email agregada
- Columna "Registrado" en lugar de "Total pedidos"
- Botones de Ver detalles, Editar y Eliminar
- Link de WhatsApp en el teléfono
- Avatar con iniciales del cliente
- Contador de clientes totales

## 📋 Endpoints Utilizados

### GET /api/clientes
```javascript
// Obtener todos los clientes con paginación
const response = await API.get('/clientes?page=1&limit=50');

// Respuesta:
{
  success: true,
  data: {
    clientes: [
      {
        id: 1,
        nombre: "Ana García",
        telefono: "987654321",
        email: "ana@ejemplo.com",
        direccion: "Av. Los Rosales 123",
        created_at: "2026-03-18T...",
        updated_at: "2026-03-18T..."
      },
      ...
    ],
    total: 150,
    page: 1,
    limit: 50,
    pages: 3
  }
}
```

### GET /api/clientes/:id
```javascript
// Obtener un cliente específico
const response = await API.get('/clientes/1');

// Respuesta:
{
  success: true,
  data: {
    id: 1,
    nombre: "Ana García",
    telefono: "987654321",
    email: "ana@ejemplo.com",
    direccion: "Av. Los Rosales 123",
    created_at: "2026-03-18T...",
    updated_at: "2026-03-18T..."
  }
}
```

### GET /api/clientes/telefono/:telefono
```javascript
// Buscar cliente por teléfono
const response = await API.get('/clientes/telefono/987654321');

// Respuesta:
{
  success: true,
  data: {
    id: 1,
    nombre: "Ana García",
    ...
  }
}
```

### POST /api/clientes
```javascript
// Crear nuevo cliente
await API.post('/clientes', {
  nombre: "María López",
  telefono: "912345678",
  email: "maria@ejemplo.com",
  direccion: "Calle Jardín 456"
});

// Respuesta:
{
  success: true,
  data: {
    id: 2,
    nombre: "María López",
    ...
  },
  mensaje: "Cliente creado correctamente"
}
```

### PUT /api/clientes/:id
```javascript
// Actualizar cliente existente
await API.put('/clientes/2', {
  nombre: "María López García",
  telefono: "912345678",
  email: "maria.lopez@ejemplo.com",
  direccion: "Calle Jardín 456, Dpto 3"
});

// Respuesta:
{
  success: true,
  data: {
    id: 2,
    nombre: "María López García",
    ...
  },
  mensaje: "Cliente actualizado correctamente"
}
```

### DELETE /api/clientes/:id
```javascript
// Eliminar cliente
await API.delete('/clientes/2');

// Respuesta:
{
  success: true,
  mensaje: "Cliente eliminado correctamente"
}
```

## 🎨 Interfaz

### Tabla de Clientes

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Cliente          │ Teléfono      │ Email              │ Dirección         │
├────────────────────────────────────────────────────────────────────────────┤
│ [AG] Ana García  │ 📱 987 654 321│ ana@ejemplo.com    │ Av. Los Rosales   │
│                  │               │                    │ [ℹ️] [✏️] [🗑️]    │
└────────────────────────────────────────────────────────────────────────────┘
```

### Modal Nuevo/Editar Cliente

```
┌─────────────────────────────────────────┐
│ Nuevo cliente                       [×] │
├─────────────────────────────────────────┤
│                                         │
│ Nombre completo: *                      │
│ [Ana García                        ]   │
│                                         │
│ Teléfono: *                             │
│ [987654321                         ]   │
│                                         │
│ Email (opcional):                       │
│ [ana@ejemplo.com                   ]   │
│                                         │
│ Dirección (opcional):                   │
│ [Av. Los Rosales 123               ]   │
│                                         │
├─────────────────────────────────────────┤
│                    [Cancelar] [Guardar] │
└─────────────────────────────────────────┘
```

### Modal Detalles del Cliente

```
┌─────────────────────────────────────────┐
│ Detalles del cliente                [×] │
├─────────────────────────────────────────┤
│                                         │
│  [AG]  Ana García                       │
│        ID: 1                            │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Teléfono              Email             │
│ 📱 987 654 321        ana@ejemplo.com   │
│                                         │
│ Dirección                               │
│ Av. Los Rosales 123                     │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Registrado            Última actualiz.  │
│ 18 de marzo de 2026   18 mar 2026 14:30│
│                                         │
├─────────────────────────────────────────┤
│                      [Cerrar] [Editar]  │
└─────────────────────────────────────────┘
```

## 🔍 Funcionalidades

### Búsqueda
- ✅ Buscar por nombre (case-insensitive)
- ✅ Buscar por teléfono
- ✅ Buscar por email
- ✅ Búsqueda en tiempo real

### Ordenamiento
- ✅ Nombre A-Z
- ✅ Nombre Z-A
- ✅ Teléfono
- ✅ Más reciente
- ✅ Más antiguo

### Paginación
- ✅ 50 clientes por página
- ✅ Navegación entre páginas
- ✅ Contador total de clientes
- ✅ Botones Anterior/Siguiente
- ✅ Números de página con puntos suspensivos

### CRUD Completo
- ✅ Crear cliente
- ✅ Leer/Ver detalles
- ✅ Actualizar cliente
- ✅ Eliminar cliente

## ✅ Validaciones

### Frontend
- ✅ Nombre no vacío
- ✅ Teléfono no vacío (9 dígitos)
- ✅ Email formato válido (opcional)
- ✅ Mensajes de error claros

### Backend
- ✅ Nombre requerido (string no vacío)
- ✅ Teléfono requerido (string no vacío)
- ✅ Email opcional (formato válido)
- ✅ Dirección opcional
- ✅ Actualización automática de `updated_at`

## 🔄 Flujo Completo

### Crear Cliente

```
1. Usuario: Click en "+ Nuevo cliente"
2. Frontend: Abre modal
3. Usuario: Llena formulario
4. Usuario: Click en "Guardar"
5. Frontend: Valida datos (nombre, teléfono, email)
6. Frontend: POST /api/clientes
7. Backend: Valida datos
8. Backend: INSERT en tabla clientes
9. Backend: Retorna cliente creado
10. Frontend: Muestra toast de éxito
11. Frontend: Recarga lista desde backend
12. Frontend: Muestra nuevo cliente
```

### Editar Cliente

```
1. Usuario: Click en "✏️ Editar"
2. Frontend: GET /api/clientes/:id
3. Backend: Retorna datos del cliente
4. Frontend: Llena formulario con datos
5. Usuario: Modifica datos
6. Usuario: Click en "Guardar"
7. Frontend: Valida datos
8. Frontend: PUT /api/clientes/:id
9. Backend: UPDATE en tabla clientes
10. Backend: Retorna cliente actualizado
11. Frontend: Muestra toast de éxito
12. Frontend: Recarga lista
```

### Ver Detalles

```
1. Usuario: Click en "ℹ️ Ver detalles"
2. Frontend: GET /api/clientes/:id
3. Backend: Retorna datos completos
4. Frontend: Muestra modal con detalles
5. Usuario: Puede editar desde aquí
```

### Eliminar Cliente

```
1. Usuario: Click en "🗑️ Eliminar"
2. Frontend: Muestra confirmación
3. Usuario: Confirma
4. Frontend: DELETE /api/clientes/:id
5. Backend: DELETE en tabla clientes
6. Backend: Retorna éxito
7. Frontend: Muestra toast de éxito
8. Frontend: Recarga lista
9. Frontend: Si era el último de la página, va a la anterior
```

## 📊 Datos Mostrados

### Por Cliente
- ✅ Nombre completo
- ✅ Teléfono (con link a WhatsApp)
- ✅ Email
- ✅ Dirección
- ✅ Fecha de registro
- ✅ Avatar con iniciales

### Filtros y Ordenamiento
- ✅ Búsqueda por nombre, teléfono o email
- ✅ Ordenar por nombre, teléfono o fecha
- ✅ Contador total de clientes

## 🐛 Manejo de Errores

### Sin Conexión al Backend
```javascript
catch (error) {
  console.error('Error al cargar clientes:', error);
  Toast.error('No se pudieron cargar los clientes');
  clientes = [];
}
```

### Error al Guardar
```javascript
catch (error) {
  console.error('Error al guardar cliente:', error);
  Toast.error(error.message || 'Error al registrar el cliente');
}
```

### Error al Eliminar
```javascript
catch (error) {
  console.error('Error al eliminar cliente:', error);
  Toast.error(error.message || 'Error al eliminar el cliente');
}
```

## 🔒 Seguridad

### Autenticación
- ✅ Todas las rutas requieren token JWT
- ✅ Verificado con middleware `verifyToken`

### Autorización
- ✅ Todos los roles autenticados pueden acceder
- ✅ No requiere rol específico (empleados y admins)

### Validación
- ✅ Validación en frontend y backend
- ✅ Sanitización de datos (trim)
- ✅ Queries parametrizadas (SQL injection protection)

## 📝 Notas Importantes

1. **Paginación**: 50 clientes por página por defecto
2. **Búsqueda**: Se realiza en el frontend sobre los datos cargados
3. **WhatsApp**: Link directo con código de país +51 (Perú)
4. **Email**: Campo opcional, validado si se proporciona
5. **Timestamps**: `created_at` y `updated_at` automáticos

## 🚀 Mejoras Futuras (Opcional)

1. Historial de pedidos por cliente
2. Total gastado por cliente
3. Última compra del cliente
4. Clientes frecuentes (badge especial)
5. Exportar lista de clientes (CSV/Excel)
6. Importar clientes desde archivo
7. Búsqueda en el backend (para grandes volúmenes)
8. Filtros avanzados (por fecha de registro, etc.)

---

**Implementado el:** 18 de marzo de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completamente integrado con backend  
**Archivo:** `pages/admin/clientes.html`
