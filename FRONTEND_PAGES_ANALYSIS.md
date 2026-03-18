# ANÁLISIS: CÓMO FUNCIONAN INVENTARIO, LABORATORIO Y PRODUCTOS
## Frontend - Páginas HTML

---

## 📊 VISIÓN GENERAL

```
FRONTEND (HTML/JS)
├── pages/admin/inventario.html
│   └── Gestiona flores, materiales, accesorios
│
├── pages/admin/productos.html
│   └── Gestiona productos finales (Ramos, Arreglos, Peluches, etc.)
│
└── pages/admin/laboratorio.html
    └── Crea arreglos personalizados usando inventario
```

---

## 🔵 PÁGINA 1: INVENTARIO.HTML

### ¿Qué es?
Panel para gestionar **flores, materiales y accesorios** disponibles en la tienda.

### Estructura de Datos

```javascript
// Cada ítem de inventario tiene:
{
  id: 1,
  nombre: "Rosas rojas",
  tipo: "flores",           // flores, materiales, accesorios
  stock: 45,                // Cantidad disponible
  stock_min: 10,            // Alerta cuando stock <= stock_min
  unidad: "unidad",         // unidad, docena, metro, rollo, caja
  costo: 3.50               // Costo unitario
}
```

### Funcionalidades

```
1. LISTAR INVENTARIO
   ├── Mostrar todos los ítems
   ├── Filtrar por tipo (flores, materiales, accesorios)
   ├── Filtrar por stock bajo
   └── Buscar por nombre

2. ALERTAS
   ├── Mostrar ítems con stock <= stock_min
   ├── Mostrar ítems agotados (stock = 0)
   └── Mostrar estado (OK, Bajo, Agotado)

3. ACCIONES
   ├── Agregar nuevo ítem
   ├── Ajustar stock (prompt manual)
   ├── Eliminar ítem
   └── Editar ítem

4. CONEXIÓN CON BACKEND
   ├── GET /api/inventario → Cargar ítems
   ├── POST /api/inventario → Crear ítem
   ├── PUT /api/inventario/:id → Actualizar stock
   └── DELETE /api/inventario/:id → Eliminar ítem
```

### Código Clave

```javascript
// Cargar inventario del backend
async function cargarInventario() {
  try {
    const data = await API.get('/inventario');
    items = data.items || data || [];
  } catch {
    // Fallback con datos de demo
    items = [
      { id:1, nombre:'Rosas rojas', tipo:'flores', stock:45, stock_min:10, unidad:'unidad', costo:3.50 },
      { id:2, nombre:'Lirios blancos', tipo:'flores', stock:8, stock_min:10, unidad:'unidad', costo:2.80 },
      // ...
    ];
  }
  renderAlertas();
  renderInv();
}

// Ajustar stock manualmente
function ajustarStock(id) {
  const item = items.find(i => i.id === id);
  const nuevo = prompt(`Stock actual: ${item.stock}\n\nNuevo stock:`, item.stock);
  if (nuevo === null) return;
  item.stock = parseInt(nuevo);
  API.put('/inventario/' + id, { stock: nuevo }).catch(()=>{});
  renderAlertas();
  renderInv();
}
```

### Flujo de Uso

```
1. Admin abre /pages/admin/inventario.html
2. Sistema carga inventario desde /api/inventario
3. Admin ve lista de flores, materiales, accesorios
4. Admin puede:
   ├── Filtrar por tipo
   ├── Ver alertas de stock bajo
   ├── Ajustar stock manualmente
   └── Agregar/eliminar ítems
5. Cambios se sincronizan con backend
```

---

## 🟡 PÁGINA 2: PRODUCTOS.HTML

### ¿Qué es?
Panel para gestionar **productos finales** que se venden (Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros).

### Estructura de Datos

```javascript
// Cada producto tiene:
{
  id: 1,
  nombre: "Ramo romántico de rosas",
  categoria: "Ramos",       // Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros
  precio: 85.00,            // Precio de venta
  costo: 52.00,             // Costo del producto
  stock: 15,                // Stock disponible
  descripcion: "12 rosas premium",
  activo: true,
  imagen_url: null
}
```

### Funcionalidades

```
1. LISTAR PRODUCTOS
   ├── Mostrar todos los productos
   ├── Filtrar por categoría (Ramos, Arreglos, Peluches, etc.)
   ├── Filtrar por stock bajo
   ├── Buscar por nombre
   └── Mostrar margen de ganancia

2. CÁLCULO DE MARGEN
   ├── Margen = (precio - costo) / precio * 100
   ├── Mostrar en % y en S/
   ├── Indicador visual (verde >= 30%, amarillo >= 15%, rojo < 15%)
   └── Actualizar en tiempo real

3. ACCIONES
   ├── Crear nuevo producto
   ├── Editar producto
   ├── Eliminar producto (soft delete)
   └── Ver estado (Activo, Inactivo)

4. CONEXIÓN CON BACKEND
   ├── GET /api/productos → Cargar productos
   ├── POST /api/productos → Crear producto
   ├── PUT /api/productos/:id → Actualizar producto
   └── DELETE /api/productos/:id → Eliminar producto
```

### Código Clave

```javascript
// Cargar productos del backend
async function cargarProductos() {
  try {
    const data = await API.get('/productos');
    todosProductos = data.productos || data || [];
  } catch {
    // Fallback con datos de demo
    todosProductos = [
      { id:1, nombre:'Ramo romántico de rosas', categoria:'Ramos', precio:85, costo:52, stock:15 },
      { id:2, nombre:'Arreglo primaveral en caja', categoria:'Arreglos', precio:120, costo:68, stock:3 },
      // ...
    ];
  }
  renderTabla();
}

// Calcular margen en tiempo real
function calcMargen() {
  const precio = parseFloat(document.getElementById('prod-precio').value) || 0;
  const costo  = parseFloat(document.getElementById('prod-costo').value) || 0;
  const gan  = precio - costo;
  const pct  = precio > 0 ? (gan / precio * 100) : 0;
  
  // Mostrar indicador visual
  if (pct >= 30) { bar.style.background = 'var(--success)'; }
  else if (pct >= 15) { bar.style.background = 'var(--warning)'; }
  else { bar.style.background = 'var(--danger)'; }
}

// Guardar producto
async function guardarProducto(e) {
  e.preventDefault();
  const payload = {
    nombre:      document.getElementById('prod-nombre').value,
    precio:      parseFloat(document.getElementById('prod-precio').value),
    costo:       parseFloat(document.getElementById('prod-costo').value),
    stock:       parseInt(document.getElementById('prod-stock').value),
    categoria:   document.getElementById('prod-categoria').value,
    descripcion: document.getElementById('prod-descripcion').value,
  };
  try {
    const res = await API.post('/productos', payload);
    Toast.success('Producto creado');
  } catch {
    Toast.error('Error al guardar');
  }
}
```

### Flujo de Uso

```
1. Admin abre /pages/admin/productos.html
2. Sistema carga productos desde /api/productos
3. Admin ve tabla con:
   ├── Nombre del producto
   ├── Categoría
   ├── Precio de venta
   ├── Costo
   ├── Margen (%)
   ├── Stock
   └── Estado
4. Admin puede:
   ├── Crear nuevo producto
   ├── Editar producto (actualiza precio, costo, stock)
   ├── Eliminar producto
   └── Ver margen de ganancia en tiempo real
5. Cambios se sincronizan con backend
```

---

## 🟣 PÁGINA 3: LABORATORIO.HTML

### ¿Qué es?
Panel para **crear arreglos personalizados** usando inventario disponible, con cálculo automático de costo y precio.

### Estructura de Datos

```javascript
// Selección de flores/materiales:
{
  1: 6,    // inventario_id: cantidad
  5: 1,    // 6 rosas rojas, 1 papel dorado
  14: 1    // 1 cinta satinada
}

// Arreglo creado:
{
  nombre: "Ramo personalizado primavera",
  margen: 40,           // 40% de ganancia
  costo_total: 45.50,   // Suma de (costo × cantidad)
  precio_venta: 75.83,  // costo_total / (1 - margen/100)
  items: [
    { inventario_id: 1, cantidad: 6 },
    { inventario_id: 5, cantidad: 1 },
    { inventario_id: 14, cantidad: 1 }
  ]
}
```

### Funcionalidades

```
1. SELECCIONAR FLORES/MATERIALES
   ├── Mostrar inventario disponible
   ├── Filtrar por tipo (flores, materiales, accesorios)
   ├── Mostrar stock disponible
   ├── Mostrar costo unitario
   └── Agregar/quitar cantidad con botones +/-

2. CÁLCULO AUTOMÁTICO
   ├── Costo total = suma de (costo × cantidad)
   ├── Margen configurable (slider 5-100%)
   ├── Precio venta = costo_total / (1 - margen/100)
   └── Actualizar en tiempo real

3. RESUMEN DEL ARREGLO
   ├── Mostrar flores seleccionadas
   ├── Mostrar cantidad de cada una
   ├── Mostrar costo total
   ├── Mostrar margen
   └── Mostrar precio de venta sugerido

4. ACCIONES
   ├── Guardar como producto
   ├── Enviar por WhatsApp
   └── Limpiar selección

5. CONEXIÓN CON BACKEND
   ├── GET /api/inventario → Cargar inventario
   └── POST /api/arreglos → Guardar arreglo personalizado
```

### Código Clave

```javascript
// Cargar inventario para laboratorio
async function cargarInventarioLab() {
  try {
    const data = await API.get('/inventario');
    inventario = data.items || data || [];
  } catch {
    // Fallback con datos de demo
    inventario = [
      { id:1, nombre:'Rosas rojas', tipo:'flores', stock:45, costo:3.50 },
      { id:2, nombre:'Lirios blancos', tipo:'flores', stock:8, costo:2.80 },
      // ...
    ];
  }
  renderGrid();
}

// Cambiar cantidad de un ítem
function cambiarQty(id, delta) {
  const item = inventario.find(i => i.id === id);
  const actual = seleccion[id] || 0;
  const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
  if (nuevo === 0) delete seleccion[id];
  else seleccion[id] = nuevo;
  renderGrid();
  renderResumen();
}

// Recalcular precio con margen
function recalcular() {
  const pct = parseInt(document.getElementById('lab-margen').value);
  document.getElementById('lab-margen-pct').textContent = pct + '%';
  renderResumen();
}

// Renderizar resumen
function renderResumen() {
  const ids = Object.keys(seleccion);
  let costoTotal = 0;
  
  // Calcular costo total
  ids.forEach(id => {
    const item = inventario.find(i => i.id == id);
    const qty = seleccion[id];
    costoTotal += item.costo * qty;
  });
  
  // Calcular precio con margen
  const margen = parseInt(document.getElementById('lab-margen').value) / 100;
  const precioVenta = costoTotal / (1 - margen);
  
  document.getElementById('lab-costo').textContent = Fmt.moneda(costoTotal);
  document.getElementById('lab-precio').textContent = Fmt.moneda(precioVenta);
}

// Guardar arreglo personalizado
async function guardarArreglo() {
  const nombre = document.getElementById('lab-nombre').value;
  const ids = Object.keys(seleccion);
  const margen = parseInt(document.getElementById('lab-margen').value);
  const costoTotal = ids.reduce((s,id) => s + inventario.find(i=>i.id==id).costo * seleccion[id], 0);
  const precioVenta = costoTotal / (1 - margen/100);
  
  const payload = {
    nombre, margen,
    costo: costoTotal,
    precio: parseFloat(precioVenta.toFixed(2)),
    receta: ids.map(id => ({ inventario_id: parseInt(id), cantidad: seleccion[id] })),
  };
  
  try {
    await API.post('/arreglos', payload);
    Toast.success(`"${nombre}" guardado como producto`);
  } catch {
    Toast.error('Error al guardar');
  }
}
```

### Flujo de Uso

```
1. Florista abre /pages/admin/laboratorio.html
2. Sistema carga inventario desde /api/inventario
3. Florista:
   ├── Ingresa nombre del arreglo
   ├── Selecciona flores/materiales del inventario
   ├── Ajusta cantidad de cada elemento
   ├── Configura margen de ganancia (slider)
   └── Ve precio de venta sugerido en tiempo real
4. Florista puede:
   ├── Guardar como producto (POST /api/arreglos)
   ├── Enviar por WhatsApp
   └── Limpiar selección
5. Arreglo se guarda en backend
```

---

## 🔗 RELACIONES ENTRE LAS TRES PÁGINAS

### Diagrama de Flujo

```
INVENTARIO.HTML
├── Gestiona: Flores, materiales, accesorios
├── Tabla: inventario
├── Datos: id, nombre, tipo, stock, stock_min, unidad, costo
└── Acciones: CRUD

        ↓ (usa)

LABORATORIO.HTML
├── Carga inventario desde /api/inventario
├── Permite seleccionar flores/materiales
├── Calcula costo y precio automáticamente
├── Crea arreglos personalizados
├── Tabla: arreglos + arreglos_inventario
└── Acciones: Crear arreglo, enviar por WhatsApp

        ↓ (crea)

PRODUCTOS.HTML
├── Gestiona: Productos finales (Ramos, Arreglos, Peluches, etc.)
├── Tabla: productos
├── Datos: id, nombre, categoria, precio, costo, stock, descripcion
└── Acciones: CRUD
```

### Flujo de Datos

```
1. INVENTARIO → LABORATORIO
   ├── Laboratorio carga inventario: GET /api/inventario
   ├── Muestra flores/materiales disponibles
   ├── Permite seleccionar cantidad
   └── Calcula costo total

2. LABORATORIO → PRODUCTOS
   ├── Laboratorio crea arreglo: POST /api/arreglos
   ├── Arreglo se guarda en tabla arreglos
   ├── Se crea receta en arreglos_inventario
   └── Arreglo aparece en productos (categoría "Arreglos")

3. PRODUCTOS → VENTAS
   ├── Vendedor ve productos en /api/productos
   ├── Vende producto (descuenta stock)
   ├── Stock se actualiza en productos
   └── Venta se registra en tabla ventas
```

---

## 📊 TABLA COMPARATIVA

| Aspecto | Inventario | Laboratorio | Productos |
|---------|-----------|-------------|-----------|
| **Propósito** | Gestionar flores/materiales | Crear arreglos personalizados | Gestionar productos finales |
| **Tabla Backend** | `inventario` | `arreglos` + `arreglos_inventario` | `productos` |
| **Datos** | Flores, materiales, accesorios | Recetas personalizadas | Productos finales |
| **Stock** | Stock independiente | Receta (no descuenta) | Stock directo |
| **Costo** | Costo unitario | Calculado desde receta | Costo fijo |
| **Precio** | No tiene | Calculado con margen | Precio fijo |
| **Acciones** | CRUD | Crear, enviar WA | CRUD |
| **Conexión** | GET/POST/PUT/DELETE /api/inventario | GET /api/inventario, POST /api/arreglos | GET/POST/PUT/DELETE /api/productos |

---

## 🔴 PROBLEMAS ACTUALES

### Problema 1: Laboratorio NO descuenta inventario
```javascript
// ACTUAL: Crea arreglo pero NO descuenta inventario
async function guardarArreglo() {
  const payload = {
    nombre, margen,
    costo: costoTotal,
    precio: parseFloat(precioVenta.toFixed(2)),
    receta: ids.map(id => ({ inventario_id: parseInt(id), cantidad: seleccion[id] })),
  };
  await API.post('/api/arreglos', payload);
  // ❌ NO descuenta del inventario
}

// DEBERÍA: Descontar inventario después de crear
// ✅ Actualizar inventario.stock para cada ítem
```

### Problema 2: Laboratorio NO valida stock
```javascript
// ACTUAL: No valida que hay stock disponible
function cambiarQty(id, delta) {
  const item = inventario.find(i => i.id === id);
  const actual = seleccion[id] || 0;
  const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
  // ✅ Sí valida (limita a stock disponible)
  seleccion[id] = nuevo;
}

// PERO: Backend NO valida al guardar
// ❌ Backend debería validar stock antes de crear arreglo
```

### Problema 3: Productos y Arreglos confundidos
```javascript
// ACTUAL: Arreglos aparecen como categoría en productos
// Categorías: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros

// PROBLEMA: ¿Cuál es la diferencia?
// - Arreglo como PRODUCTO: stock fijo, precio fijo
// - Arreglo PERSONALIZADO: stock dinámico, precio calculado

// DEBERÍA: Diferenciar en la UI
```

---

## ✅ CÓMO FUNCIONAN ACTUALMENTE

### Flujo Completo

```
1. ADMIN ABRE INVENTARIO
   ├── Carga flores/materiales desde /api/inventario
   ├── Ve stock disponible
   ├── Puede ajustar stock manualmente
   └── Cambios se sincronizan con backend

2. FLORISTA ABRE LABORATORIO
   ├── Carga inventario desde /api/inventario
   ├── Selecciona flores/materiales
   ├── Ajusta cantidad de cada una
   ├── Sistema calcula costo total
   ├── Sistema calcula precio con margen
   └── Florista ve precio sugerido

3. FLORISTA GUARDA ARREGLO
   ├── Envía POST /api/arreglos con receta
   ├── Backend crea arreglo
   ├── Backend crea receta en arreglos_inventario
   ├── ❌ Backend NO descuenta inventario
   └── Arreglo aparece en productos

4. VENDEDOR ABRE PRODUCTOS
   ├── Carga productos desde /api/productos
   ├── Ve todos los productos (incluyendo arreglos)
   ├── Puede crear/editar/eliminar productos
   └── Cambios se sincronizan con backend

5. VENDEDOR VENDE PRODUCTO
   ├── Registra venta en /api/ventas
   ├── Backend descuenta stock de productos
   ├── ❌ Backend NO descuenta inventario
   └── Venta se registra
```

---

## 🎯 CONCLUSIÓN

### Cómo están relacionados actualmente

```
INVENTARIO
    ↓ (proporciona)
LABORATORIO
    ↓ (crea)
PRODUCTOS (Arreglos)
    ↓ (se venden)
VENTAS
```

### Problemas principales

1. ❌ Laboratorio NO descuenta inventario al crear arreglo
2. ❌ Laboratorio NO valida stock en backend
3. ❌ Arreglos confundidos (producto vs personalizado)
4. ❌ No hay diferenciación visual en UI

### Solución propuesta

1. ✅ Backend valida stock antes de crear arreglo
2. ✅ Backend descuenta inventario al crear arreglo
3. ✅ Frontend diferencia arreglos de productos
4. ✅ Frontend muestra alertas de stock bajo

---

**Análisis completado**: 2026-03-17  
**Próximo paso**: Implementar correcciones en backend

