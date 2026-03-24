# 🔐 Sistema de Permisos - Encantos Eternos

## Matriz de Permisos Implementada

| Módulo | Endpoint/Página | Admin | Empleado | Dueña | Notas |
|--------|----------------|-------|----------|-------|-------|
| **Dashboard** | `/api/dashboard` | ✅ Full | ❌ | ✅ Full | Información sensible del negocio |
| **Ventas** | `/api/ventas` | ✅ Full | ✅ Full | ❌ | Operación diaria de empleados |
| **Pedidos** | `/api/pedidos` | ✅ Full | ✅ Full | ❌ | Gestión de pedidos |
| **Caja** | `/api/caja` | ✅ Full | ✅ Full | ❌ | Apertura/cierre de caja |
| **Productos** | `/api/productos` | ✅ Full | 👁️ Read | 👁️ Read | Solo admin modifica catálogo |
| **Inventario** | `/api/inventario` | ✅ Full | ❌ | 👁️ Read | Información sensible (costos) |
| **Laboratorio** | `/api/arreglos` | ✅ Full | ✅ Full | 👁️ Read | Empleados crean arreglos |
| **Clientes** | `/api/clientes` | ✅ Full | 👁️ Read | ✅ Full | Empleados ven para ventas |
| **Trabajadores** | `/api/trabajadores` | ✅ Full | 👁️ Read | ❌ | Empleados ven lista para ventas |
| **Gastos** | `/api/gastos` | ✅ Full | ❌ | ✅ Full | Información financiera |
| **Reportes** | `/api/reportes` | ✅ Full | ❌ | ✅ Full | Análisis de negocio |
| **Promociones** | `/api/promociones` | ✅ Full | ❌ | ✅ Full | Gestión de marketing |
| **Eventos** | `/api/eventos` | ✅ Full | ❌ | ✅ Full | Gestión de contenido |
| **Capital** | `/api/capital` | ✅ Full | 👁️ Read | ❌ | Información financiera crítica |

## Leyenda

- ✅ **Full**: Acceso completo (GET, POST, PUT, DELETE)
- 👁️ **Read**: Solo lectura (GET)
- ❌ **Denied**: Sin acceso (403 Forbidden)

## Roles del Sistema

### 👑 Admin (Administrador)
**Acceso:** Completo a todo el sistema

**Responsabilidades:**
- Gestión completa de productos e inventario
- Administración de trabajadores
- Configuración del sistema
- Acceso a toda la información financiera
- Gestión de capital y aportes/retiros

**Páginas accesibles:**
- ✅ Dashboard
- ✅ Ventas
- ✅ Pedidos
- ✅ Caja
- ✅ Productos
- ✅ Inventario
- ✅ Laboratorio
- ✅ Clientes
- ✅ Trabajadores
- ✅ Gastos
- ✅ Reportes
- ✅ Promociones
- ✅ Eventos

---

### 👤 Empleado
**Acceso:** Operaciones diarias de venta

**Responsabilidades:**
- Registrar ventas
- Gestionar pedidos
- Abrir/cerrar caja
- Crear arreglos en laboratorio
- Consultar productos y stock

**Páginas accesibles:**
- ✅ Ventas (crear, editar, eliminar)
- ✅ Pedidos (crear, editar, eliminar)
- ✅ Caja (apertura, cierre, historial)
- 👁️ Productos (solo consulta - para ver catálogo)
- ✅ Laboratorio (crear arreglos)
- 👁️ Clientes (solo consulta - para buscar en ventas)

**Páginas bloqueadas:**
- ❌ Dashboard
- ❌ Inventario (información sensible: costos)
- ❌ Trabajadores
- ❌ Gastos
- ❌ Reportes
- ❌ Promociones
- ❌ Eventos

---

### 👩‍💼 Dueña
**Acceso:** Supervisión y análisis del negocio

**Responsabilidades:**
- Revisar reportes y estadísticas
- Gestionar gastos
- Supervisar clientes
- Gestionar promociones y eventos
- Consultar inventario y productos

**Páginas accesibles:**
- ✅ Dashboard
- 👁️ Productos (solo consulta)
- 👁️ Inventario (solo consulta)
- 👁️ Laboratorio (solo consulta)
- ✅ Clientes (crear, editar, eliminar)
- ✅ Gastos (crear, editar, eliminar)
- ✅ Reportes (consultar)
- ✅ Promociones (crear, editar, eliminar)
- ✅ Eventos (crear, editar, eliminar)

**Páginas bloqueadas:**
- ❌ Ventas
- ❌ Pedidos
- ❌ Caja
- ❌ Trabajadores

---

## Implementación Técnica

### Frontend (js/admin-layout.js)

```javascript
function canAccess(href, rol) {
  // Admin tiene acceso a todo
  if (rol === 'admin') return true;
  
  // Empleado: Solo operaciones diarias
  if (rol === 'empleado') {
    const empleadoAllowed = [
      'ventas.html', 'pedidos.html', 'caja.html',
      'productos.html', 'inventario.html', 
      'laboratorio.html', 'clientes.html'
    ];
    return empleadoAllowed.some(p => href.includes(p));
  }
  
  // Dueña: Reportes, gastos, contenido
  if (rol === 'duena') {
    const duenaAllowed = [
      'dashboard.html', 'productos.html', 'inventario.html',
      'laboratorio.html', 'clientes.html', 'gastos.html',
      'reportes.html', 'promociones.html', 'eventos.html'
    ];
    return duenaAllowed.some(p => href.includes(p));
  }
  
  return false;
}
```

### Backend (Middleware)

```javascript
// En auth.js
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        mensaje: 'Usuario no autenticado',
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Admin puede acceder a todo
    if (req.user.rol === 'admin' || allowedRoles.includes(req.user.rol)) {
      return next();
    }

    return res.status(403).json({
      error: true,
      mensaje: 'No tienes permisos para acceder a este recurso',
    });
  };
};
```

## Verificación de Acceso

### En el Frontend
1. El sidebar solo muestra páginas permitidas según el rol
2. Al intentar acceder a una página no permitida, se redirige automáticamente
3. Se muestra un mensaje de error: "No tienes permisos para acceder a esta página"

### En el Backend
1. Todos los endpoints verifican el token JWT
2. Se valida el rol del usuario contra los roles permitidos
3. Respuesta 403 si no tiene permisos
4. Respuesta 401 si no está autenticado

## Casos de Uso

### Empleado intenta acceder a Inventario
1. Frontend: No muestra la opción de Inventario en el sidebar
2. Si intenta acceder directamente a la URL, es redirigido a ventas.html
3. Backend: GET /api/inventario sin autenticación (público para laboratorio web)
4. **Razón:** El inventario contiene información sensible (costos, márgenes) que no debe ser visible para empleados

### Empleado intenta acceder a Dashboard
1. Frontend: Detecta que empleado no tiene acceso a dashboard.html
2. Muestra toast de error
3. Redirige a ventas.html (su página principal)

### Dueña intenta crear una venta
1. Frontend: No muestra la opción de Ventas en el sidebar
2. Si intenta acceder directamente a la URL, es redirigida
3. Backend: Si hace una petición POST /api/ventas, recibe 403

### Empleado consulta lista de trabajadores
1. Frontend: Puede ver el select de trabajadores en ventas.html
2. Backend: GET /api/trabajadores permite acceso a empleado (solo lectura)
3. Backend: POST/PUT/DELETE /api/trabajadores devuelve 403 para empleado

## Seguridad

✅ **Doble capa de protección:** Frontend + Backend
✅ **Principio de menor privilegio:** Cada rol solo tiene acceso a lo necesario
✅ **Validación en cada request:** JWT + Role verification
✅ **Mensajes claros:** El usuario sabe por qué no puede acceder
✅ **Redirección automática:** Evita confusión del usuario

### Justificación de Restricciones

#### ¿Por qué Empleados NO ven Inventario?
- **Costos sensibles:** El inventario muestra el costo de cada item
- **Márgenes de ganancia:** Se puede calcular el margen de cada producto
- **Información estratégica:** Conocer los costos puede afectar negociaciones
- **Solución:** Empleados usan el Laboratorio que muestra productos sin costos

#### ¿Por qué Empleados NO ven Dashboard?
- **Información financiera completa:** Ventas totales, ganancias, gastos
- **Métricas de negocio:** ROI, márgenes, tendencias
- **Datos de otros empleados:** Rendimiento individual
- **Solución:** Solo admin y dueña necesitan esta vista estratégica

#### ¿Por qué Dueña NO puede hacer Ventas?
- **Separación de funciones:** La dueña supervisa, no opera
- **Auditoría:** Evita conflictos de interés en reportes
- **Delegación:** Los empleados son responsables de las ventas diarias
- **Solución:** Dueña ve reportes y estadísticas, no registra ventas

#### ¿Por qué Empleados ven Trabajadores (read-only)?
- **Necesario para ventas:** El select de "Atendido por" en ventas.html
- **Solo lectura:** No pueden crear, editar o eliminar trabajadores
- **Información básica:** Solo ven nombre y rol, no datos sensibles
- **Solución:** GET permitido, POST/PUT/DELETE bloqueado

## Mantenimiento

Para agregar un nuevo endpoint:

1. Definir qué roles deben tener acceso
2. Agregar `requireRole(['admin', 'empleado'])` en la ruta
3. Actualizar `canAccess()` en admin-layout.js si es una nueva página
4. Actualizar esta documentación

---

**Última actualización:** 2026-03-23
**Versión:** 1.0
