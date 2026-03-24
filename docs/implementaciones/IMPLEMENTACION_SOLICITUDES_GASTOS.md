# Sistema de Solicitudes de Gastos con Aprobación

## Resumen
Sistema completo de solicitudes de gastos donde los empleados crean solicitudes que deben ser aprobadas por el administrador antes de registrarse como gastos reales.

## Características Implementadas

### 1. Base de Datos
- ✅ Tabla `solicitudes_gastos` con todos los campos necesarios
- ✅ Estados: `pendiente`, `aprobada`, `rechazada`
- ✅ Índices para optimizar consultas
- ✅ Triggers para actualizar timestamps
- ✅ Relaciones con usuarios y caja

### 2. Backend (API)

#### Rutas implementadas:
- `POST /api/solicitudes-gastos` - Crear solicitud (empleado, admin, dueña)
- `GET /api/solicitudes-gastos` - Listar solicitudes (filtradas por rol)
- `GET /api/solicitudes-gastos/:id` - Obtener solicitud específica
- `PUT /api/solicitudes-gastos/:id/aprobar` - Aprobar solicitud (admin/dueña)
- `PUT /api/solicitudes-gastos/:id/rechazar` - Rechazar solicitud (admin/dueña)
- `GET /api/solicitudes-gastos/pendientes/count` - Contador para dashboard

#### Validaciones:
- ✅ Solo se pueden crear solicitudes con caja abierta
- ✅ Validación de campos requeridos
- ✅ Validación de permisos por rol
- ✅ Validación de estados (no se puede aprobar/rechazar dos veces)
- ✅ Comentario obligatorio al rechazar

#### Lógica de negocio:
- ✅ Al aprobar: se crea automáticamente un gasto real en la tabla `gastos`
- ✅ Al rechazar: se guarda el comentario del admin
- ✅ Empleados solo ven sus propias solicitudes
- ✅ Admin/Dueña ven todas las solicitudes

### 3. Frontend - caja.html

#### Para Empleados:
- ✅ Botón "💰 Solicitar Gasto" (visible solo con caja abierta)
- ✅ Modal de solicitud con campos:
  - Monto
  - Categoría (flores, transporte, materiales, mantenimiento, otros)
  - Descripción
  - Empresa/Proveedor
  - Número de boleta/factura
- ✅ Sección "Solicitudes de Gastos" con:
  - Filtro por estado (todas, pendientes, aprobadas, rechazadas)
  - Cards con colores según estado:
    - Gris: Pendiente
    - Verde: Aprobada
    - Rojo: Rechazada
  - Información completa de cada solicitud
  - Visualización de comentarios de rechazo

#### Para Admin/Dueña:
- ✅ Mismas funcionalidades que empleados
- ✅ Botón "✅ Revisar" en solicitudes pendientes
- ✅ Modal de revisión con:
  - Detalle completo de la solicitud
  - Botón "Aprobar"
  - Botón "Rechazar" con campo de comentario obligatorio
- ✅ Contador de solicitudes pendientes

### 4. Frontend - dashboard.html

#### Para Admin/Dueña:
- ✅ Alerta destacada cuando hay solicitudes pendientes
- ✅ Contador de solicitudes
- ✅ Botón directo para ir a caja.html
- ✅ Diseño con gradiente amarillo/warning
- ✅ Se oculta automáticamente cuando no hay pendientes

### 5. Permisos

#### Cambios realizados:
- ✅ Empleados NO tienen acceso a `gastos.html`
- ✅ Empleados pueden crear solicitudes desde `caja.html`
- ✅ Admin y Dueña pueden aprobar/rechazar solicitudes
- ✅ Todos los roles pueden ver sus propias solicitudes

### 6. Diseño Responsive

#### Características:
- ✅ Cards adaptables a diferentes tamaños de pantalla
- ✅ Botones con flex-wrap en header
- ✅ Modales responsive
- ✅ Filtros adaptables
- ✅ Compatible con modo claro y oscuro

### 7. Modo Claro/Oscuro

#### Implementación:
- ✅ Variables CSS para colores dinámicos
- ✅ Cards con colores adaptables
- ✅ Badges con colores según estado
- ✅ Gradientes que funcionan en ambos modos

## Flujo de Trabajo

### Empleado:
1. Abre la caja del día
2. Realiza una compra (flores, transporte, etc.)
3. Click en "💰 Solicitar Gasto"
4. Completa el formulario con datos del comprobante
5. Envía la solicitud
6. Ve el estado en la sección "Solicitudes de Gastos"
7. Recibe notificación visual cuando es aprobada/rechazada

### Admin/Dueña:
1. Ve alerta en dashboard si hay solicitudes pendientes
2. Va a caja.html
3. Revisa solicitudes en la sección "Solicitudes de Gastos"
4. Click en "✅ Revisar" en solicitud pendiente
5. Revisa los detalles
6. Decide:
   - **Aprobar**: Se crea el gasto automáticamente
   - **Rechazar**: Ingresa comentario explicando el motivo
7. El empleado ve el resultado en su lista

## Archivos Creados/Modificados

### Backend:
- ✅ `database/solicitudes_gastos.sql` - Schema de la tabla
- ✅ `backend/src/services/solicitudes-gastos.service.js` - Lógica de negocio
- ✅ `backend/src/controllers/solicitudes-gastos.controller.js` - Controladores
- ✅ `backend/src/routes/solicitudes-gastos.routes.js` - Rutas API
- ✅ `backend/src/app.js` - Registro de rutas
- ✅ `backend/src/scripts/create-solicitudes-gastos-table.js` - Script de instalación

### Frontend:
- ✅ `pages/admin/caja.html` - Interfaz completa de solicitudes
- ✅ `pages/admin/dashboard.html` - Alerta de solicitudes pendientes
- ✅ `js/admin-layout.js` - Permisos actualizados

## Instalación

### 1. Crear la tabla en la base de datos:
```bash
cd backend
node src/scripts/create-solicitudes-gastos-table.js
```

### 2. Reiniciar el servidor backend:
```bash
npm start
```

### 3. Probar el sistema:
1. Login como empleado
2. Abrir caja
3. Crear solicitud de gasto
4. Login como admin
5. Ver alerta en dashboard
6. Ir a caja.html
7. Aprobar/rechazar solicitud

## Ventajas del Sistema

1. **Control total**: Admin revisa cada gasto antes de registrarlo
2. **Trazabilidad**: Se guarda quién solicitó, quién aprobó, cuándo
3. **Transparencia**: Empleados ven el estado de sus solicitudes
4. **Justificación**: Cada gasto tiene comprobante y descripción
5. **Auditoría**: Comentarios de rechazo para feedback
6. **Seguridad**: Solo con caja abierta se pueden crear solicitudes
7. **Responsive**: Funciona en móviles, tablets y desktop
8. **Accesible**: Compatible con modo claro y oscuro

## Próximas Mejoras (Opcionales)

- [ ] Notificaciones push cuando se aprueba/rechaza
- [ ] Subir foto del comprobante
- [ ] Exportar reporte de solicitudes
- [ ] Filtros por fecha y categoría
- [ ] Estadísticas de solicitudes por empleado
- [ ] Límite de monto para aprobación automática

## Soporte

Para cualquier duda o problema, revisar:
- Logs del backend en consola
- Logs del frontend en DevTools (F12)
- Verificar que la tabla existe: `SELECT * FROM solicitudes_gastos;`
- Verificar permisos de usuario en `js/admin-layout.js`
