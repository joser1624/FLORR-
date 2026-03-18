# Pruebas del Sistema de Capital

## ✅ Estado de Implementación

- ✅ Base de datos: Tablas creadas correctamente
- ✅ Backend: Servicio, controlador y rutas implementados
- ✅ Frontend: Dashboard actualizado con card de capital
- ✅ Servidor: Corriendo en http://localhost:3000

## 🧪 Pasos para Probar

### 1. Verificar Base de Datos

Conectarse a PostgreSQL y ejecutar:

```sql
-- Ver capital inicial
SELECT * FROM configuracion WHERE clave = 'capital_inicial';

-- Ver estructura de movimientos_capital
\d movimientos_capital

-- Ver si hay movimientos registrados
SELECT * FROM movimientos_capital ORDER BY fecha DESC;
```

### 2. Probar Endpoints del Backend

#### A. Obtener Capital Actual

```bash
curl -X GET http://localhost:3000/api/capital \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "capital_actual": 10000.00,
    "desglose": {
      "capital_inicial": 10000.00,
      "ingresos": 0,
      "gastos": 0,
      "aportes": 0,
      "retiros": 0
    }
  }
}
```

#### B. Registrar un Aporte (solo admin)

```bash
curl -X POST http://localhost:3000/api/capital/aportes \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 500.00,
    "descripcion": "Aporte de capital para inventario",
    "fecha": "2026-03-18"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "aporte",
    "monto": 500.00,
    "descripcion": "Aporte de capital para inventario",
    "fecha": "2026-03-18",
    "trabajador_id": 1,
    "created_at": "2026-03-18T...",
    "updated_at": "2026-03-18T..."
  }
}
```

#### C. Registrar un Retiro (solo admin)

```bash
curl -X POST http://localhost:3000/api/capital/retiros \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 300.00,
    "descripcion": "Retiro personal",
    "fecha": "2026-03-18"
  }'
```

#### D. Obtener Historial de Movimientos

```bash
curl -X GET "http://localhost:3000/api/capital/movimientos?page=1&limit=20" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "tipo": "retiro",
      "monto": 300.00,
      "descripcion": "Retiro personal",
      "fecha": "2026-03-18",
      "trabajador_id": 1,
      "trabajador_nombre": "Admin User",
      "created_at": "2026-03-18T...",
      "updated_at": "2026-03-18T..."
    },
    {
      "id": 1,
      "tipo": "aporte",
      "monto": 500.00,
      "descripcion": "Aporte de capital para inventario",
      "fecha": "2026-03-18",
      "trabajador_id": 1,
      "trabajador_nombre": "Admin User",
      "created_at": "2026-03-18T...",
      "updated_at": "2026-03-18T..."
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### E. Filtrar Movimientos por Tipo

```bash
# Solo aportes
curl -X GET "http://localhost:3000/api/capital/movimientos?tipo=aporte" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Solo retiros
curl -X GET "http://localhost:3000/api/capital/movimientos?tipo=retiro" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 3. Probar Frontend (Dashboard)

#### A. Abrir Dashboard

1. Abrir navegador en: `file:///C:/Users/josea/Documents/floreria/pages/admin/dashboard.html`
2. Iniciar sesión con usuario administrador

#### B. Verificar Card de Capital

Deberías ver:
- Card con gradiente verde-azul
- Capital actual en grande
- Desglose de 5 componentes:
  - Capital Inicial: S/ 10,000.00
  - Ingresos: S/ 0.00 (o el total de ventas cerradas)
  - Gastos: S/ 0.00 (o el total de gastos registrados)
  - Aportes: S/ 0.00 (o el total de aportes)
  - Retiros: S/ 0.00 (o el total de retiros)

#### C. Probar Botones (solo admin)

Si eres administrador, verás 3 botones:
- `+ Aporte`
- `- Retiro`
- `📋 Historial`

Si eres empleado, solo verás:
- `📋 Ver Historial`

#### D. Registrar un Aporte

1. Click en `+ Aporte`
2. Llenar formulario:
   - Monto: `500.00`
   - Descripción: `Aporte de capital para compra de inventario`
   - Fecha: `2026-03-18` (hoy por defecto)
3. Click en `Registrar Aporte`
4. Verificar:
   - Toast de éxito
   - Capital actual se actualiza
   - Aportes aumenta en S/ 500.00

#### E. Registrar un Retiro

1. Click en `- Retiro`
2. Llenar formulario:
   - Monto: `300.00`
   - Descripción: `Retiro personal`
   - Fecha: `2026-03-18`
3. Click en `Registrar Retiro`
4. Verificar:
   - Toast de éxito
   - Capital actual se actualiza
   - Retiros aumenta en S/ 300.00

#### F. Ver Historial

1. Click en `📋 Historial`
2. Verificar:
   - Modal se abre
   - Tabla muestra todos los movimientos
   - Columnas: Fecha, Tipo, Descripción, Monto, Registrado por
3. Probar filtros:
   - Click en `Todos` - muestra todos
   - Click en `Aportes` - solo aportes
   - Click en `Retiros` - solo retiros
4. Si hay más de 20 registros, probar paginación

### 4. Verificar Cálculo del Capital

El capital debe calcularse correctamente:

```
Capital Actual = Capital Inicial + Ingresos - Gastos + Aportes - Retiros
```

**Ejemplo:**
- Capital Inicial: S/ 10,000.00
- Ingresos (ventas cerradas): S/ 5,000.00
- Gastos: S/ 2,000.00
- Aportes: S/ 500.00
- Retiros: S/ 300.00

**Resultado esperado:**
```
Capital = 10,000 + 5,000 - 2,000 + 500 - 300 = S/ 13,200.00
```

### 5. Probar Permisos

#### Como Administrador:
- ✅ Ver capital
- ✅ Ver historial
- ✅ Registrar aportes
- ✅ Registrar retiros

#### Como Empleado:
- ✅ Ver capital
- ✅ Ver historial
- ❌ Registrar aportes (botón no visible)
- ❌ Registrar retiros (botón no visible)

### 6. Probar Validaciones

#### A. Monto Inválido
- Intentar registrar aporte con monto 0 o negativo
- Debe mostrar: "Ingresa un monto válido"

#### B. Descripción Vacía
- Intentar registrar sin descripción
- Debe mostrar: "Ingresa una descripción"

#### C. Fecha Vacía
- Intentar registrar sin fecha
- Debe mostrar: "Selecciona una fecha"

### 7. Probar Actualización Automática

1. Registrar un aporte de S/ 1,000
2. Verificar que el capital aumenta inmediatamente
3. Cerrar una caja con ventas
4. Recargar dashboard
5. Verificar que los ingresos aumentan
6. Registrar un gasto
7. Recargar dashboard
8. Verificar que los gastos aumentan

## 🐛 Problemas Comunes

### Error: "No autorizado"
- Verificar que el token JWT es válido
- Verificar que el usuario tiene rol 'admin' para aportes/retiros

### Error: "No se pudo cargar capital"
- Verificar que el backend está corriendo
- Verificar que las tablas existen en la base de datos
- Revisar consola del navegador para más detalles

### Capital no se actualiza
- Hacer hard refresh (Ctrl+F5)
- Verificar que no hay errores en la consola
- Verificar que el endpoint `/api/capital` responde correctamente

### Botones no aparecen
- Verificar que el usuario tiene rol 'admin'
- Verificar que `localStorage.getItem('user')` contiene el usuario correcto
- Revisar consola del navegador

## ✅ Checklist de Pruebas

- [ ] Base de datos: Tablas creadas
- [ ] Backend: Servidor corriendo
- [ ] Endpoint GET /api/capital funciona
- [ ] Endpoint POST /api/capital/aportes funciona (admin)
- [ ] Endpoint POST /api/capital/retiros funciona (admin)
- [ ] Endpoint GET /api/capital/movimientos funciona
- [ ] Dashboard: Card de capital visible
- [ ] Dashboard: Desglose correcto
- [ ] Dashboard: Botones visibles (admin)
- [ ] Modal de aporte funciona
- [ ] Modal de retiro funciona
- [ ] Modal de historial funciona
- [ ] Filtros de historial funcionan
- [ ] Paginación funciona
- [ ] Validaciones funcionan
- [ ] Permisos funcionan correctamente
- [ ] Capital se calcula correctamente
- [ ] Actualización automática funciona

## 📊 Datos de Prueba Sugeridos

### Aportes
1. S/ 5,000.00 - "Aporte inicial de la dueña"
2. S/ 2,000.00 - "Aporte para compra de inventario"
3. S/ 1,500.00 - "Aporte para expansión"

### Retiros
1. S/ 1,000.00 - "Retiro personal mensual"
2. S/ 500.00 - "Retiro para gastos personales"
3. S/ 300.00 - "Retiro de emergencia"

## 🎉 Resultado Esperado

Al finalizar las pruebas, deberías tener:
- Capital inicial de S/ 10,000.00
- Varios aportes y retiros registrados
- Historial completo visible
- Capital calculado correctamente
- Sistema funcionando sin errores

---

**Fecha de pruebas:** 18 de marzo de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para probar
