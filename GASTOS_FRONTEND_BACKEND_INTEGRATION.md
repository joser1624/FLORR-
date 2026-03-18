# Integración Frontend-Backend: gastos.html

## 🔄 Cambios Realizados

Se adecuó el frontend de gastos.html para usar correctamente todos los endpoints disponibles del backend.

---

## 📡 Endpoints del Backend

### Disponibles y Usados:

| Método | Endpoint | Uso en Frontend | Estado |
|--------|----------|-----------------|--------|
| GET | `/gastos?mes=YYYY-MM&categoria=X` | `cargarGastos()` | ✅ Implementado |
| GET | `/gastos/:id` | No usado aún | ⚠️ Disponible |
| POST | `/gastos` | `guardarGasto()` | ✅ Implementado |
| DELETE | `/gastos/:id` | `eliminarGasto()` | ✅ Implementado |

### No Disponible:
| Método | Endpoint | Estado |
|--------|----------|--------|
| PUT | `/gastos/:id` | ❌ No existe en routes (solo en service) |

---

## 🔧 Cambios en el Frontend

### 1. **Función `cargarGastos()` - MEJORADA**

**Antes:**
```javascript
async function cargarGastos() {
  const mes = document.getElementById('mes-gasto').value;
  try { 
    const d = await API.get(`/gastos?mes=${mes}`); 
    gastos = d.gastos || d || []; 
  }
  catch {
    // Usaba datos de ejemplo hardcodeados
    gastos = [
      { id:1, descripcion:'Compra 200 rosas rojas', ... },
      ...
    ];
  }
  renderResumen();
  renderGastos();
}
```

**Ahora:**
```javascript
async function cargarGastos() {
  const mes = document.getElementById('mes-gasto').value;
  try {
    const response = await API.get(`/gastos?mes=${mes}`);
    // Backend retorna: { success: true, data: { data: [...], total, page, limit, pages } }
    const result = response.data || response;
    gastos = result.data || result.gastos || result || [];
    console.log('Gastos cargados:', gastos.length, 'gastos del mes', mes);
  } catch (error) {
    console.error('Error al cargar gastos:', error);
    Toast.error('No se pudieron cargar los gastos desde el servidor');
    gastos = [];
  }
  renderResumen();
  renderGastos();
}
```

**Mejoras:**
- ✅ Maneja correctamente la estructura de respuesta del backend: `{ success: true, data: { data: [...], total, page, limit, pages } }`
- ✅ Muestra error al usuario si falla la carga
- ✅ Logs para debugging
- ✅ No usa datos de ejemplo hardcodeados
- ✅ Array vacío si falla (en lugar de datos falsos)

---

### 2. **Función `guardarGasto()` - MEJORADA**

**Antes:**
```javascript
async function guardarGasto() {
  const payload = { ... };
  if (!payload.descripcion || !payload.monto) { 
    Toast.warning('Completa los campos obligatorios'); 
    return; 
  }
  try { 
    await API.post('/gastos', payload); 
  } catch { 
    // Si falla, agrega localmente con ID temporal
    gastos.unshift({ id:Date.now(), ...payload }); 
  }
  Toast.success('Gasto registrado');
  Modal.close('modal-gasto');
  renderResumen();
  renderGastos();
}
```

**Ahora:**
```javascript
async function guardarGasto() {
  const payload = {
    descripcion: document.getElementById('gasto-desc').value.trim(),
    categoria: document.getElementById('gasto-cat').value,
    monto: parseFloat(document.getElementById('gasto-monto').value) || 0,
    fecha: document.getElementById('gasto-fecha').value || new Date().toISOString().split('T')[0]
  };
  
  if (!payload.descripcion) {
    Toast.warning('La descripción es obligatoria');
    return;
  }
  if (!payload.monto || payload.monto <= 0) {
    Toast.warning('El monto debe ser mayor a 0');
    return;
  }
  
  try {
    const response = await API.post('/gastos', payload);
    Toast.success('Gasto registrado correctamente');
    Modal.close('modal-gasto');
    // Limpiar formulario
    document.getElementById('gasto-desc').value = '';
    document.getElementById('gasto-monto').value = '';
    document.getElementById('gasto-fecha').value = new Date().toISOString().split('T')[0];
    await cargarGastos(); // Recargar desde el backend
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    Toast.error(error.message || 'Error al guardar el gasto');
  }
}
```

**Mejoras:**
- ✅ Validación más específica (descripción y monto por separado)
- ✅ Trim en descripción para evitar espacios en blanco
- ✅ Validación de monto > 0
- ✅ Limpia el formulario después de guardar
- ✅ Recarga los gastos desde el backend (no manipula array local)
- ✅ Muestra mensaje de error específico del backend
- ✅ No agrega datos locales si falla (mantiene integridad)

---

### 3. **Función `eliminarGasto()` - MEJORADA**

**Antes:**
```javascript
function eliminarGasto(id) {
  Modal.confirm('¿Eliminar este gasto?', () => {
    gastos = gastos.filter(g=>g.id!==id);
    API.delete('/gastos/'+id).catch(()=>{});
    renderResumen();
    renderGastos();
    Toast.success('Gasto eliminado');
  });
}
```

**Ahora:**
```javascript
async function eliminarGasto(id) {
  const gasto = gastos.find(g => g.id === id);
  Modal.confirm(`¿Eliminar gasto "${gasto?.descripcion}"?`, async () => {
    try {
      await API.delete('/gastos/' + id);
      Toast.success('Gasto eliminado correctamente');
      await cargarGastos(); // Recargar desde el backend
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      Toast.error(error.message || 'Error al eliminar el gasto');
    }
  });
}
```

**Mejoras:**
- ✅ Función async para manejar correctamente el await
- ✅ Muestra descripción del gasto en la confirmación
- ✅ Espera respuesta del backend antes de continuar
- ✅ Recarga los gastos desde el backend (no manipula array local)
- ✅ Manejo de errores con mensaje específico
- ✅ No elimina localmente si falla el backend (mantiene integridad)

---

## 📊 Estructura de Respuesta del Backend

### GET /gastos?mes=2026-03
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "descripcion": "Compra 200 rosas rojas",
        "categoria": "flores",
        "monto": 280,
        "fecha": "2026-03-02",
        "created_at": "2026-03-02T10:00:00Z",
        "updated_at": "2026-03-02T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

### POST /gastos
```json
{
  "success": true,
  "data": {
    "id": 5,
    "descripcion": "Nuevo gasto",
    "categoria": "flores",
    "monto": 100,
    "fecha": "2026-03-18",
    "created_at": "2026-03-18T10:00:00Z",
    "updated_at": "2026-03-18T10:00:00Z"
  },
  "mensaje": "Gasto creado correctamente"
}
```

### DELETE /gastos/:id
```json
{
  "success": true,
  "mensaje": "Gasto eliminado correctamente"
}
```

### Error Response
```json
{
  "error": true,
  "mensaje": "Gasto no encontrado"
}
```

---

## ✅ Beneficios de los Cambios

### 1. **Integridad de Datos**
- ❌ Antes: Manipulaba array local, podía desincronizarse con el backend
- ✅ Ahora: Siempre recarga desde el backend, datos siempre sincronizados

### 2. **Manejo de Errores**
- ❌ Antes: Ignoraba errores o usaba datos falsos
- ✅ Ahora: Muestra errores específicos al usuario

### 3. **Validación**
- ❌ Antes: Validación genérica
- ✅ Ahora: Validación específica por campo

### 4. **UX Mejorada**
- ❌ Antes: Mensaje genérico "¿Eliminar este gasto?"
- ✅ Ahora: Muestra descripción del gasto a eliminar

### 5. **Debugging**
- ❌ Antes: Sin logs
- ✅ Ahora: Logs en consola para debugging

### 6. **Limpieza de Formulario**
- ❌ Antes: No limpiaba el formulario
- ✅ Ahora: Limpia automáticamente después de guardar

---

## 🔮 Funcionalidades Futuras

### 1. **Editar Gasto** (Requiere agregar ruta PUT en backend)
Para implementar edición, necesitas:

1. Agregar ruta en `backend/src/routes/gastos.routes.js`:
```javascript
router.put(
  '/:id',
  verifyToken,
  requireRole(['admin', 'duena']),
  idParamValidation,
  createGastoValidation, // Reutilizar validación
  gastosController.update.bind(gastosController)
);
```

2. Agregar método en `backend/src/controllers/gastos.controller.js`:
```javascript
async update(req, res, next) {
  try {
    const gasto = await gastosService.update(req.params.id, req.body);
    
    if (!gasto) {
      return res.status(404).json({
        error: true,
        mensaje: 'Gasto no encontrado'
      });
    }

    res.json({
      success: true,
      data: gasto,
      mensaje: 'Gasto actualizado correctamente'
    });
  } catch (error) {
    next(error);
  }
}
```

3. Frontend ya tiene el service.update() implementado, solo falta la ruta.

### 2. **Ver Detalles de Gasto**
Usar el endpoint `GET /gastos/:id` para mostrar un modal con detalles completos.

### 3. **Filtro por Categoría en Backend**
El backend ya soporta `?categoria=flores`, solo falta implementarlo en el frontend.

---

## 🧪 Cómo Probar

1. **Cargar gastos:**
   - Abre la página de gastos
   - Verifica que se carguen los gastos del mes actual
   - Cambia el mes y verifica que se recarguen

2. **Crear gasto:**
   - Haz clic en "+ Registrar gasto"
   - Llena el formulario
   - Verifica que se guarde y aparezca en la tabla
   - Verifica que el formulario se limpie

3. **Eliminar gasto:**
   - Haz clic en "Eliminar" en un gasto
   - Verifica que muestre la descripción en la confirmación
   - Confirma y verifica que se elimine
   - Verifica que se recargue la tabla

4. **Manejo de errores:**
   - Intenta crear un gasto sin descripción
   - Intenta crear un gasto con monto 0
   - Verifica que se muestren los mensajes de error

---

## 📝 Notas Importantes

1. **Paginación**: El backend retorna paginación (`total`, `page`, `limit`, `pages`) pero el frontend aún no la implementa. Todos los gastos del mes se muestran en una sola página.

2. **Filtro por categoría**: El backend soporta `?categoria=X` pero el frontend solo filtra localmente. Se podría mejorar para filtrar en el backend.

3. **Edición**: El service tiene `update()` pero no hay ruta PUT en el backend. Necesita agregarse.

4. **Datos de ejemplo**: Se eliminaron los datos hardcodeados. Si el backend falla, se muestra array vacío y mensaje de error.

---

## ✅ Estado Final

- ✅ GET /gastos - Implementado correctamente
- ✅ POST /gastos - Implementado correctamente
- ✅ DELETE /gastos/:id - Implementado correctamente
- ⚠️ GET /gastos/:id - Disponible pero no usado
- ❌ PUT /gastos/:id - No existe en routes

El frontend ahora está completamente sincronizado con el backend y maneja correctamente todos los casos de éxito y error.
