# 🚀 Instalación del Sistema de Solicitudes de Gastos

## Pasos de Instalación

### 1️⃣ Crear la tabla en la base de datos

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
node src/scripts/create-solicitudes-gastos-table.js
```

Deberías ver:
```
📋 Creando tabla solicitudes_gastos...
✅ Tabla solicitudes_gastos creada correctamente
✅ Sistema de solicitudes de gastos listo para usar
```

### 2️⃣ Reiniciar el servidor backend

Si el servidor está corriendo, detenlo (Ctrl+C) y vuelve a iniciarlo:

```bash
npm start
```

Deberías ver:
```
╔═══════════════════════════════════════════════════════════╗
║   🌸 Florería Encantos Eternos - Backend API 🌸          ║
║   Server running on: http://localhost:3000                ║
╚═══════════════════════════════════════════════════════════╝
```

### 3️⃣ Verificar el frontend

El frontend ya está actualizado, solo necesitas refrescar el navegador (F5).

## 🧪 Probar el Sistema

### Como Empleado:

1. **Login**: Ingresa con credenciales de empleado
2. **Ir a Caja**: Click en "Caja del día" en el menú lateral
3. **Abrir Caja**: Click en "Abrir caja" e ingresa monto inicial
4. **Solicitar Gasto**: 
   - Verás el botón verde "💰 Solicitar Gasto"
   - Click en el botón
   - Completa el formulario:
     - Monto: Ej. 50.00
     - Categoría: Selecciona una (flores, transporte, etc.)
     - Descripción: Ej. "Compra de rosas rojas"
     - Empresa: Ej. "Flores del Valle"
     - N° Comprobante: Ej. "B001-12345"
   - Click en "💰 Enviar Solicitud"
5. **Ver Estado**: 
   - Verás tu solicitud en la sección "Solicitudes de Gastos"
   - Estado: ⏳ Pendiente (gris)

### Como Admin:

1. **Login**: Ingresa con credenciales de admin
   - Email: `admin@encantoseternos.com`
   - Password: `admin123`
2. **Dashboard**: 
   - Verás una alerta amarilla: "💰 1 Solicitud de gasto pendiente"
   - Click en "📋 Revisar solicitud"
3. **Revisar Solicitud**:
   - En caja.html, verás la sección "Solicitudes de Gastos"
   - Click en "✅ Revisar" en la solicitud pendiente
4. **Aprobar o Rechazar**:
   - **Para Aprobar**: Click en "✅ Aprobar"
     - Se crea automáticamente el gasto
     - El empleado verá estado: ✅ Aprobada (verde)
   - **Para Rechazar**: 
     - Click en "❌ Rechazar"
     - Ingresa un comentario: Ej. "Falta firma en el comprobante"
     - Click en "Confirmar Rechazo"
     - El empleado verá estado: ❌ Rechazada (rojo) con tu comentario

## ✅ Verificación

### Verificar que todo funciona:

1. ✅ Empleado puede crear solicitudes (solo con caja abierta)
2. ✅ Empleado ve sus solicitudes con colores según estado
3. ✅ Admin ve alerta en dashboard cuando hay pendientes
4. ✅ Admin puede aprobar solicitudes
5. ✅ Admin puede rechazar con comentario
6. ✅ Solicitudes aprobadas se convierten en gastos reales
7. ✅ Empleado NO tiene acceso a gastos.html
8. ✅ Sistema es responsive (prueba en móvil)
9. ✅ Funciona en modo claro y oscuro

## 🐛 Solución de Problemas

### Error: "No hay caja abierta"
- **Solución**: Abre la caja primero desde caja.html

### Error: "Tabla solicitudes_gastos no existe"
- **Solución**: Ejecuta el script de creación de tabla (Paso 1)

### No veo el botón "Solicitar Gasto"
- **Solución**: Verifica que la caja esté abierta y refresca la página (F5)

### No veo la alerta en dashboard
- **Solución**: 
  1. Verifica que hay solicitudes pendientes
  2. Verifica que estás logueado como admin o dueña
  3. Refresca la página (F5)

### Empleado puede ver gastos.html
- **Solución**: Limpia el caché del navegador (Ctrl+Shift+Delete)

## 📊 Verificar en Base de Datos

Si quieres verificar directamente en la base de datos:

```sql
-- Ver todas las solicitudes
SELECT * FROM solicitudes_gastos ORDER BY fecha_solicitud DESC;

-- Ver solicitudes pendientes
SELECT * FROM solicitudes_gastos WHERE estado = 'pendiente';

-- Ver solicitudes aprobadas
SELECT * FROM solicitudes_gastos WHERE estado = 'aprobada';
```

## 🎉 ¡Listo!

El sistema de solicitudes de gastos está completamente funcional. Los empleados ahora pueden solicitar gastos que serán revisados y aprobados por el administrador antes de registrarse.
