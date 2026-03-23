# 📦 Migración: Sistema de Arqueo de Caja

## 🎯 Objetivo

Implementar control de arqueo de caja con registro de monto físico contado y validación de caja abierta antes de realizar ventas.

## 📋 Cambios Implementados

### 1. Base de Datos

**Nuevas columnas en tabla `caja`:**
- `monto_cierre_fisico` (DECIMAL(10,2)): Monto físico contado al cerrar caja
- `diferencia_cierre` (DECIMAL(10,2)): Diferencia entre esperado y contado
- `observaciones_diferencia` (TEXT): Explicación de diferencias

### 2. Backend

**Archivos modificados:**
- `backend/src/services/caja.service.js`
  - Método `cierre()`: Acepta `montoCierreF isico` y `observacionesDiferencia`
  - Método `getHoy()`: Incluye `saldo_esperado` y `estado_arqueo`
  - Método `getHistorial()`: Incluye `estado_arqueo` en cada registro

- `backend/src/controllers/caja.controller.js`
  - Endpoint `POST /api/caja/cierre`: Acepta campos opcionales en body

- `backend/src/services/ventas.service.js`
  - Método `create()`: Valida caja abierta antes de crear venta

### 3. Validaciones de Negocio

✅ `monto_cierre_fisico >= 0`
✅ Si hay diferencia, `observaciones_diferencia` es obligatorio (mínimo 10 caracteres)
✅ No permitir ventas si no hay caja abierta
✅ No permitir abrir dos cajas el mismo día (ya existía)

### 4. Estados de Arqueo

- **cuadrado**: Diferencia <= S/ 0.01
- **faltante**: Diferencia < -S/ 0.01
- **sobrante**: Diferencia > S/ 0.01

## 🚀 Instrucciones de Migración

### Paso 1: Ejecutar Script de Migración

```bash
cd backend
node src/scripts/add-caja-arqueo-columns.js
```

**Salida esperada:**
```
🔧 Agregando columnas de arqueo a tabla caja...
✅ Columnas agregadas exitosamente:
   - monto_cierre_fisico: Monto físico contado al cerrar
   - diferencia_cierre: Diferencia entre esperado y contado
   - observaciones_diferencia: Explicación de diferencias

✨ Migración completada
```

### Paso 2: Reiniciar Backend

```bash
npm run dev
```

### Paso 3: Verificar Endpoints

**GET /api/caja/hoy** - Debe incluir nuevos campos:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fecha": "2026-03-23",
    "monto_apertura": 100.00,
    "monto_cierre_fisico": null,
    "diferencia_cierre": 0.00,
    "saldo_esperado": 450.00,
    "estado_arqueo": "cuadrado",
    ...
  }
}
```

**POST /api/caja/cierre** - Acepta nuevos campos:
```json
{
  "monto_cierre_fisico": 455.00,
  "observaciones_diferencia": "Cliente pagó de más y no quiso cambio"
}
```

**POST /api/ventas** - Valida caja abierta:
```json
// Si no hay caja abierta:
{
  "error": true,
  "mensaje": "Debe abrir la caja del día antes de realizar ventas"
}
```

## 📊 Ejemplos de Uso

### Cerrar Caja sin Diferencia

```javascript
const response = await API.post('/caja/cierre', {
  monto_cierre_fisico: 450.00
});

// Response:
{
  "success": true,
  "data": {
    "diferencia_cierre": 0.00,
    "estado_arqueo": "cuadrado"
  },
  "mensaje": "Caja cerrada correctamente"
}
```

### Cerrar Caja con Faltante

```javascript
const response = await API.post('/caja/cierre', {
  monto_cierre_fisico": 440.00,
  "observaciones_diferencia": "Faltaron S/ 10 por error en cambio a cliente"
});

// Response:
{
  "success": true,
  "data": {
    "diferencia_cierre": -10.00,
    "estado_arqueo": "faltante"
  },
  "mensaje": "Caja cerrada correctamente. Arqueo con faltante: S/ 10.00",
  "warning": "Hay diferencia en el arqueo"
}
```

### Intentar Venta sin Caja Abierta

```javascript
const response = await API.post('/ventas', {
  productos: [...],
  metodo_pago: "Efectivo"
});

// Response (400):
{
  "error": true,
  "mensaje": "Debe abrir la caja del día antes de realizar ventas"
}
```

## ⚠️ Consideraciones

### Datos Existentes

Las cajas cerradas antes de la migración tendrán:
- `monto_cierre_fisico`: NULL
- `diferencia_cierre`: 0.00
- `observaciones_diferencia`: NULL
- `estado_arqueo`: "cuadrado" (calculado)

### Retrocompatibilidad

✅ El endpoint `POST /api/caja/cierre` sigue funcionando sin los nuevos campos
✅ Si no se proporciona `monto_cierre_fisico`, no se calcula diferencia
✅ Frontend antiguo seguirá funcionando

### Validación de Ventas

⚠️ **IMPORTANTE**: A partir de esta migración, NO se pueden crear ventas sin caja abierta.

**Flujo recomendado:**
1. Abrir caja al inicio del día
2. Realizar ventas normalmente
3. Cerrar caja al final del día con arqueo

## 🧪 Testing

### Test Manual

1. **Abrir caja**:
   ```bash
   curl -X POST http://localhost:3000/api/caja/apertura \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"monto_apertura": 100}'
   ```

2. **Intentar venta sin caja** (debe fallar):
   ```bash
   # Primero cerrar caja si está abierta
   curl -X POST http://localhost:3000/api/caja/cierre \
     -H "Authorization: Bearer <token>"
   
   # Intentar venta (debe retornar 400)
   curl -X POST http://localhost:3000/api/ventas \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"productos":[{"producto_id":1,"cantidad":1,"precio_unitario":50}],"metodo_pago":"Efectivo"}'
   ```

3. **Cerrar caja con arqueo**:
   ```bash
   curl -X POST http://localhost:3000/api/caja/cierre \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"monto_cierre_fisico":455,"observaciones_diferencia":"Sobrante por propina de cliente"}'
   ```

## 📝 Checklist de Migración

- [ ] Ejecutar script de migración
- [ ] Verificar columnas agregadas en BD
- [ ] Reiniciar backend
- [ ] Probar endpoint GET /api/caja/hoy
- [ ] Probar endpoint POST /api/caja/cierre con arqueo
- [ ] Probar validación de caja en ventas
- [ ] Actualizar frontend (siguiente fase)
- [ ] Documentar cambios para el equipo

## 🔄 Rollback

Si necesitas revertir los cambios:

```sql
ALTER TABLE caja 
DROP COLUMN IF EXISTS monto_cierre_fisico,
DROP COLUMN IF EXISTS diferencia_cierre,
DROP COLUMN IF EXISTS observaciones_diferencia;
```

⚠️ **Advertencia**: Esto eliminará todos los datos de arqueo registrados.

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Verificar logs del backend
2. Revisar que PostgreSQL esté actualizado
3. Confirmar que no hay cajas abiertas durante la migración

---

**Fecha de Migración**: Marzo 2026  
**Versión**: 1.1.0  
**Estado**: ✅ Completado (Backend)
