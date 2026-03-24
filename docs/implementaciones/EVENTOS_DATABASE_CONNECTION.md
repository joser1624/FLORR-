# Conexión de Eventos a la Base de Datos

## Problema Identificado

El archivo `eventos.html` estaba usando `localStorage` (a través de `Storage.js`) en lugar de conectarse al backend. Por eso los eventos no se guardaban en la base de datos.

## Solución Implementada

### 1. Modificaciones en el Frontend

**Archivo: `pages/admin/eventos.html`**

Se reemplazaron todas las funciones que usaban `Storage.js` por llamadas al backend usando `API`:

- ✅ `cargarEventos()` - Ahora usa `API.get('/eventos')`
- ✅ `guardarEvento()` - Ahora usa `API.post('/eventos')` o `API.put('/eventos/:id')`
- ✅ `editarEvento()` - Ahora usa `API.get('/eventos/:id')`
- ✅ `confirmarEliminarEvento()` - Ahora usa `API.delete('/eventos/:id')`

**Estructura de datos enviada al backend:**

```javascript
{
  nombre: "Día de la Madre",
  descripcion: "Descripción del evento",
  emoji: "🌹",
  fecha: "2026-05-10",
  color: "rosa",
  activo: true,
  metadata: JSON.stringify({
    imagen: "https://res.cloudinary.com/...",
    precioOriginal: 150.00,
    precioFinal: 120.00,
    productos: [
      { id: 1, nombre: "Rosa Roja", precio: 5.00, categoria: "Flores" },
      // ... más productos
    ]
  })
}
```

### 2. Modificaciones en el Backend

**Archivo: `database/schema.sql`**

Se agregó el campo `metadata` a la tabla eventos:

```sql
ALTER TABLE eventos ADD COLUMN metadata JSONB;
```

Este campo almacena información adicional en formato JSON:
- `imagen`: URL de Cloudinary
- `precioOriginal`: Precio sin descuento
- `precioFinal`: Precio con descuento
- `productos`: Array de productos incluidos

**Archivo: `backend/src/services/eventos.service.js`**

Se actualizaron los métodos `create()` y `update()` para manejar el campo `metadata`.

### 3. Modificaciones en la UI

**Archivo: `js/ui-eventos.js`**

Se actualizaron las funciones de renderizado para parsear el campo `metadata`:

- `crearCardAdmin()` - Parsea metadata para mostrar imagen, precios y productos
- `crearCardPublico()` - Parsea metadata para la página principal

## Endpoints Disponibles

### GET /api/eventos
Obtiene todos los eventos (público)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Día de la Madre",
      "descripcion": "Honra a mamá con el arreglo perfecto",
      "emoji": "🌹",
      "fecha": "2026-05-10",
      "color": "rosa",
      "activo": true,
      "metadata": {
        "imagen": "https://...",
        "precioOriginal": 150,
        "precioFinal": 120,
        "productos": [...]
      }
    }
  ]
}
```

### GET /api/eventos/:id
Obtiene un evento específico (público)

### POST /api/eventos
Crea un nuevo evento (requiere autenticación: admin/duena)

### PUT /api/eventos/:id
Actualiza un evento existente (requiere autenticación: admin/duena)

### DELETE /api/eventos/:id
Elimina un evento (requiere autenticación: admin/duena)

## Cómo Probar

1. **Iniciar el backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Abrir el panel admin:**
   - URL: `http://localhost:5500/pages/admin/eventos.html`
   - Iniciar sesión como admin o dueña

3. **Crear un evento:**
   - Click en "Nuevo evento"
   - Llenar el formulario
   - Seleccionar productos
   - Guardar

4. **Verificar en la base de datos:**
   ```sql
   SELECT * FROM eventos;
   ```

## Archivos Modificados

- ✅ `pages/admin/eventos.html` - Conexión al backend
- ✅ `backend/src/services/eventos.service.js` - Soporte para metadata
- ✅ `database/schema.sql` - Campo metadata agregado
- ✅ `js/ui-eventos.js` - Renderizado con metadata
- ✅ `backend/src/scripts/add-metadata-to-eventos.js` - Script de migración

## Archivos que ya NO se usan

- ⚠️ `js/storage.js` - Ya no se usa para eventos (solo localStorage)
- ⚠️ Las funciones de Storage relacionadas con eventos están obsoletas

## Notas Importantes

1. **Autenticación requerida:** Para crear, editar o eliminar eventos necesitas estar autenticado como `admin` o `duena`.

2. **Formato de metadata:** El campo metadata es JSONB en PostgreSQL, lo que permite consultas eficientes sobre los datos JSON.

3. **Compatibilidad:** Los eventos antiguos que no tienen metadata seguirán funcionando (se muestran sin imagen/precios).

4. **Migración:** Si tienes eventos en localStorage, necesitarás migrarlos manualmente al backend.

## Próximos Pasos

Si quieres migrar eventos existentes de localStorage al backend:

1. Exportar eventos de localStorage
2. Crear un script de migración
3. Importar a la base de datos

¿Necesitas ayuda con la migración? ¡Avísame!
