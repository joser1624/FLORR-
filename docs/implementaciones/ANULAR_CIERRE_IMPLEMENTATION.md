# Implementación: Anular Cierre de Caja

## Descripción
Sistema de anulación de cierres de caja con auditoría completa. Permite a administradores reabrir una caja cerrada por error, manteniendo un registro permanente de la acción.

## Características

### Seguridad y Control
- ✅ Solo administradores y dueña pueden anular cierres
- ✅ Solo se puede anular el cierre del mismo día
- ✅ Requiere motivo obligatorio (mínimo 10 caracteres)
- ✅ Confirmación adicional antes de ejecutar
- ✅ Registro permanente en tabla de auditoría

### Auditoría Completa
La tabla `caja_cierre_anulado` registra:
- Snapshot completo del cierre anulado (totales, montos, etc.)
- Quién cerró originalmente la caja
- Quién anuló el cierre
- Motivo de la anulación
- Fecha y hora de la anulación

### Flujo de Trabajo
1. Admin cierra la caja por error
2. Aparece botón "🔓 Anular Cierre" (solo para admin/dueña)
3. Admin hace clic y se abre modal
4. Ingresa motivo detallado
5. Confirma la acción
6. Sistema:
   - Guarda snapshot en tabla de auditoría
   - Cambia estado de caja a "abierta"
   - Limpia datos de cierre
   - Permite continuar operaciones

## Archivos Creados/Modificados

### Base de Datos
- `database/caja_cierre_anulado.sql` - Tabla de auditoría
- `backend/install-anular-cierre.js` - Script de instalación

### Backend
- `backend/src/services/caja.service.js`
  - `anularCierre(adminId, motivoAnulacion)` - Anula cierre y registra auditoría
  - `getAnulaciones(limit)` - Obtiene historial de anulaciones

- `backend/src/controllers/caja.controller.js`
  - `POST /api/caja/anular-cierre` - Endpoint para anular
  - `GET /api/caja/anulaciones` - Endpoint para ver historial

- `backend/src/routes/caja.routes.js`
  - Rutas con autenticación y autorización (solo admin/dueña)

### Frontend
- `pages/admin/caja.html`
  - Botón "🔓 Anular Cierre" (visible solo cuando caja cerrada + admin)
  - Modal con formulario de motivo
  - Funciones JavaScript: `abrirModalAnularCierre()`, `confirmarAnularCierre()`
  - Actualización de `actualizarBotones()` para mostrar/ocultar botón

## Instalación

### 1. Crear tabla de auditoría
```bash
node backend/install-anular-cierre.js
```

O manualmente:
```bash
psql -U postgres -d floreria_system_core -f database/caja_cierre_anulado.sql
```

### 2. Reiniciar backend
```bash
cd backend
npm start
```

### 3. Probar funcionalidad
1. Abrir caja como admin
2. Cerrar caja
3. Verificar que aparece botón "🔓 Anular Cierre"
4. Hacer clic y completar formulario
5. Confirmar anulación
6. Verificar que caja vuelve a estado "abierta"

## Endpoints API

### POST /api/caja/anular-cierre
Anula el cierre de caja del día actual.

**Autenticación:** Requerida (admin/dueña)

**Body:**
```json
{
  "motivo": "Error en el conteo de efectivo, faltó registrar una venta"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { /* caja reabierta */ },
  "mensaje": "Cierre anulado correctamente. La caja ha sido reabierta."
}
```

**Errores:**
- 400: Motivo vacío o caja no cerrada hoy
- 403: Usuario no es admin/dueña
- 404: No hay caja cerrada hoy

### GET /api/caja/anulaciones
Obtiene historial de anulaciones (auditoría).

**Autenticación:** Requerida (admin/dueña)

**Query params:**
- `limit` (opcional): Número de registros (default: 50)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "caja_id": 123,
      "fecha_cierre": "2024-03-24T18:30:00Z",
      "trabajador_cierre_nombre": "Juan Pérez",
      "monto_cierre": 1500.00,
      "total_ventas": 2000.00,
      "anulado_por_nombre": "Admin",
      "motivo_anulacion": "Error en conteo",
      "fecha_anulacion": "2024-03-24T18:45:00Z"
    }
  ]
}
```

## Tabla de Auditoría

### Estructura: caja_cierre_anulado
```sql
- id: SERIAL PRIMARY KEY
- caja_id: INTEGER (FK a caja)
- fecha_cierre: TIMESTAMP
- trabajador_cierre_id: INTEGER (FK a usuarios)
- monto_cierre: DECIMAL(10,2)
- total_efectivo: DECIMAL(10,2)
- total_digital: DECIMAL(10,2)
- total_tarjeta: DECIMAL(10,2)
- total_ventas: DECIMAL(10,2)
- total_gastos: DECIMAL(10,2)
- anulado_por_id: INTEGER (FK a usuarios)
- motivo_anulacion: TEXT
- fecha_anulacion: TIMESTAMP
- created_at: TIMESTAMP
```

### Índices
- `idx_caja_cierre_anulado_caja` - Búsqueda por caja
- `idx_caja_cierre_anulado_fecha` - Búsqueda por fecha
- `idx_caja_cierre_anulado_anulado_por` - Búsqueda por usuario

## Validaciones

### Backend
- ✅ Usuario debe ser admin o dueña
- ✅ Debe existir caja cerrada HOY
- ✅ Motivo no puede estar vacío
- ✅ Se guarda snapshot completo antes de anular

### Frontend
- ✅ Botón solo visible para admin/dueña
- ✅ Botón solo visible cuando caja está cerrada
- ✅ Motivo mínimo 10 caracteres
- ✅ Confirmación adicional con alert

## Casos de Uso

### Caso 1: Error en conteo
Admin cierra caja con monto incorrecto → Anula cierre → Corrige conteo → Cierra nuevamente

### Caso 2: Venta después del cierre
Empleado registra venta después de cerrar → Admin anula cierre → Venta se registra → Cierra nuevamente

### Caso 3: Gasto olvidado
Se olvidó registrar un gasto → Admin anula cierre → Registra gasto → Cierra nuevamente

## Notas Importantes

1. **No se puede anular cierres de días anteriores** - Solo del día actual
2. **Todas las anulaciones quedan registradas** - Auditoría permanente
3. **No se pierden datos** - El snapshot del cierre se guarda antes de anular
4. **Requiere motivo válido** - Mínimo 10 caracteres para evitar anulaciones sin justificación

## Testing

### Pruebas Manuales
1. ✅ Anular cierre como admin
2. ✅ Intentar anular como empleado (debe fallar)
3. ✅ Intentar anular sin motivo (debe fallar)
4. ✅ Verificar que caja vuelve a estado abierta
5. ✅ Verificar registro en tabla de auditoría
6. ✅ Verificar que botón solo aparece cuando caja cerrada

### Consultas de Auditoría
```sql
-- Ver todas las anulaciones
SELECT * FROM caja_cierre_anulado ORDER BY fecha_anulacion DESC;

-- Ver anulaciones por usuario
SELECT a.*, u.nombre 
FROM caja_cierre_anulado a
JOIN usuarios u ON a.anulado_por_id = u.id
WHERE u.nombre = 'Admin';

-- Ver anulaciones del mes
SELECT * FROM caja_cierre_anulado 
WHERE DATE_TRUNC('month', fecha_anulacion) = DATE_TRUNC('month', CURRENT_DATE);
```

## Seguridad

- ✅ Autenticación JWT requerida
- ✅ Autorización por rol (admin/dueña)
- ✅ Validación de datos en backend
- ✅ Registro de auditoría inmutable
- ✅ No se pueden eliminar registros de auditoría

## Mejoras Futuras

- [ ] Notificación por email cuando se anula un cierre
- [ ] Dashboard de auditoría con estadísticas
- [ ] Límite de anulaciones por día/mes
- [ ] Requerir contraseña adicional para anular
- [ ] Exportar historial de anulaciones a PDF
