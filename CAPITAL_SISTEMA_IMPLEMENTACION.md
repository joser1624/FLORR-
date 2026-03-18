# Sistema de Capital - Implementación Completa

## 📊 Resumen

Se ha implementado el sistema de capital para el dashboard con la siguiente fórmula:

```
Capital = Capital_Inicial + Ingresos - Gastos + Aportes - Retiros
```

## ✅ Componentes Implementados

### 1. Base de Datos

#### Tabla `configuracion`
```sql
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- Capital inicial: S/ 10,000.00
- Valor configurable pero irremovible

#### Tabla `movimientos_capital`
```sql
CREATE TABLE movimientos_capital (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('aporte', 'retiro')),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    trabajador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- Registra aportes y retiros de capital
- Incluye descripción y fecha
- Vinculado al trabajador que lo registró

### 2. Backend

#### Servicio: `capital.service.js`
- `getCapitalActual()` - Obtiene capital actual con desglose completo
- `registrarAporte()` - Registra un nuevo aporte
- `registrarRetiro()` - Registra un nuevo retiro
- `getMovimientos()` - Obtiene historial con paginación y filtros
- `getCapitalInicial()` - Obtiene el capital inicial

#### Controlador: `capital.controller.js`
- Maneja las peticiones HTTP
- Valida datos de entrada
- Retorna respuestas estructuradas

#### Rutas: `capital.routes.js`
```
GET    /api/capital              - Obtener capital actual (todos)
GET    /api/capital/inicial      - Obtener capital inicial (todos)
GET    /api/capital/movimientos  - Historial de movimientos (todos)
POST   /api/capital/aportes      - Registrar aporte (solo admin)
POST   /api/capital/retiros      - Registrar retiro (solo admin)
```

### 3. Frontend

#### Dashboard (`dashboard.html`)

**Card de Capital:**
- Diseño estético con gradiente verde-azul
- Capital actual destacado en grande
- Desglose de 5 componentes:
  - Capital Inicial (blanco)
  - Ingresos (verde claro)
  - Gastos (rosa claro)
  - Aportes (verde claro)
  - Retiros (rosa claro)

**Botones (solo para administradores):**
- `+ Aporte` - Abre modal para registrar aporte
- `- Retiro` - Abre modal para registrar retiro
- `📋 Historial` - Abre modal con historial completo

**Modales:**
1. Modal Registrar Aporte
   - Monto (S/)
   - Descripción
   - Fecha

2. Modal Registrar Retiro
   - Monto (S/)
   - Descripción
   - Fecha

3. Modal Historial de Movimientos
   - Tabla con todos los movimientos
   - Filtros: Todos / Aportes / Retiros
   - Paginación (20 por página)
   - Columnas: Fecha, Tipo, Descripción, Monto, Registrado por

## 🔐 Permisos

- **Ver capital**: Todos los usuarios autenticados
- **Registrar aportes/retiros**: Solo administradores (`rol = 'admin'`)
- **Ver historial**: Todos los usuarios autenticados

## 📈 Cálculo del Capital

```javascript
Capital Actual = 
  Capital Inicial (configuracion)
  + Ingresos (SUM de caja.total_ventas WHERE estado='cerrada')
  - Gastos (SUM de gastos.monto)
  + Aportes (SUM de movimientos_capital WHERE tipo='aporte')
  - Retiros (SUM de movimientos_capital WHERE tipo='retiro')
```

## 🚀 Instalación

### Paso 1: Ejecutar script de base de datos

```bash
cd backend
node src/scripts/add-capital-tables.js
```

Este script:
- Crea tabla `configuracion`
- Inserta capital inicial de S/ 10,000.00
- Crea tabla `movimientos_capital`
- Crea índices y triggers

### Paso 2: Reiniciar servidor backend

```bash
# Detener servidor actual (Ctrl+C)
npm start
```

### Paso 3: Verificar en el dashboard

1. Abrir `pages/admin/dashboard.html`
2. Verificar que aparece el card de Capital
3. Si eres admin, verás los botones de Aporte/Retiro/Historial
4. Si no eres admin, solo verás el botón de Ver Historial

## 🎨 Diseño Visual

### Card de Capital
```
┌─────────────────────────────────────────────────────────┐
│  💰 Capital del Negocio                    [Botones]    │
│  S/ 45,230.50                                           │
│  ─────────────────────────────────────────────────────  │
│  Capital    + Ingresos  - Gastos   + Aportes  - Retiros│
│  Inicial                                                │
│  S/ 10,000  S/ 85,450   S/ 48,219  S/ 5,000   S/ 7,000 │
└─────────────────────────────────────────────────────────┘
```

- Fondo: Gradiente verde-azul
- Texto: Blanco
- Números positivos: Verde claro
- Números negativos: Rosa claro

## 📝 Ejemplos de Uso

### Registrar un Aporte

1. Click en botón `+ Aporte`
2. Ingresar monto: `500.00`
3. Descripción: `Aporte de capital para compra de inventario`
4. Fecha: `2026-03-18`
5. Click en `Registrar Aporte`
6. El capital se actualiza automáticamente

### Registrar un Retiro

1. Click en botón `- Retiro`
2. Ingresar monto: `300.00`
3. Descripción: `Retiro personal`
4. Fecha: `2026-03-18`
5. Click en `Registrar Retiro`
6. El capital se actualiza automáticamente

### Ver Historial

1. Click en botón `📋 Historial`
2. Ver todos los movimientos
3. Filtrar por tipo: Todos / Aportes / Retiros
4. Navegar por páginas si hay muchos registros

## 🔄 Actualización Diaria

El capital se actualiza automáticamente cada vez que:
- Se cierra una caja (suma ingresos)
- Se registra un gasto (resta gastos)
- Se registra un aporte (suma aportes)
- Se registra un retiro (resta retiros)

No requiere intervención manual.

## 📊 Datos de Origen

| Componente | Origen | Tabla |
|------------|--------|-------|
| Capital Inicial | Configuración fija | `configuracion` |
| Ingresos | Cierres de caja | `caja.total_ventas` |
| Gastos | Gastos operativos | `gastos.monto` |
| Aportes | Movimientos de capital | `movimientos_capital` (tipo='aporte') |
| Retiros | Movimientos de capital | `movimientos_capital` (tipo='retiro') |

## ✨ Características

- ✅ Cálculo automático en tiempo real
- ✅ Desglose visual completo
- ✅ Historial completo con paginación
- ✅ Filtros por tipo de movimiento
- ✅ Permisos por rol (admin/empleado)
- ✅ Validaciones de datos
- ✅ Diseño estético y profesional
- ✅ Responsive y accesible
- ✅ Integración completa con sistema existente

## 🎯 Próximos Pasos (Opcional)

1. Agregar gráfico de evolución del capital en el tiempo
2. Exportar historial a PDF/Excel
3. Notificaciones cuando el capital baja de cierto umbral
4. Comparativa mes a mes
5. Proyecciones de capital futuro

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que las tablas se crearon correctamente
2. Revisa que el backend esté corriendo
3. Verifica que el usuario tenga rol 'admin' para registrar movimientos
4. Revisa la consola del navegador para errores

---

**Implementado el:** 18 de marzo de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo y funcional
