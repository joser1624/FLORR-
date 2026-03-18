# Análisis: Sistema de Capital para Dashboard

## 📊 Tu Propuesta

```
Capital = Capital_Inicial + Ingresos - Gastos + Aportes - Retiros
```

Donde:
- **Capital Inicial**: Valor fijo inicial (por ahora irremovible)
- **Ingresos**: Del cierre de caja diario
- **Gastos**: De la sección gastos.html
- **Aportes**: Falta implementar
- **Retiros**: De la sección gastos.html

---

## 🔍 Análisis del Sistema Actual

### 1. **Estructura de Base de Datos**

#### Tabla `caja` (Cash Register)
```sql
CREATE TABLE caja (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    monto_apertura DECIMAL(10, 2) NOT NULL DEFAULT 0,
    monto_cierre DECIMAL(10, 2),
    total_efectivo DECIMAL(10, 2) DEFAULT 0,
    total_digital DECIMAL(10, 2) DEFAULT 0,
    total_tarjeta DECIMAL(10, 2) DEFAULT 0,
    total_ventas DECIMAL(10, 2) DEFAULT 0,    -- ✅ INGRESOS
    total_gastos DECIMAL(10, 2) DEFAULT 0,    -- ✅ GASTOS
    trabajador_apertura_id INTEGER,
    trabajador_cierre_id INTEGER,
    estado VARCHAR(50) NOT NULL DEFAULT 'abierta'
);
```

#### Tabla `gastos` (Expenses)
```sql
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,  -- flores, transporte, materiales, mantenimiento, otros
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL
);
```

### 2. **Flujo Actual del Sistema**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DIARIO ACTUAL                       │
└─────────────────────────────────────────────────────────────┘

1. APERTURA DE CAJA (mañana)
   ├─ Se registra monto_apertura (efectivo inicial)
   └─ Estado: "abierta"

2. OPERACIONES DEL DÍA
   ├─ Ventas → tabla ventas (total_ventas)
   │   ├─ Efectivo
   │   ├─ Digital (Yape/Plin)
   │   └─ Tarjeta/Transferencia
   │
   └─ Gastos → tabla gastos (total_gastos)
       ├─ Compra flores
       ├─ Transporte
       ├─ Materiales
       ├─ Mantenimiento
       └─ Otros

3. CIERRE DE CAJA (noche)
   ├─ Calcula total_ventas del día
   ├─ Calcula total_gastos del día
   ├─ Registra totales por método de pago
   └─ Estado: "cerrada"
```

---

## 🎯 Evaluación de Tu Propuesta

### ✅ Aspectos Positivos

1. **Fórmula Clara y Contable**
   ```
   Capital = Capital_Inicial + Ingresos - Gastos + Aportes - Retiros
   ```
   Esta es la fórmula estándar de contabilidad básica.

2. **Datos Ya Disponibles**
   - ✅ Ingresos: `caja.total_ventas` (cierre diario)
   - ✅ Gastos: `gastos.monto` (suma por período)

3. **Visión Financiera Completa**
   - Permite ver la salud financiera real del negocio
   - Útil para toma de decisiones

### ⚠️ Aspectos a Considerar

1. **Confusión Conceptual: Gastos vs Retiros**
   
   En tu propuesta mencionas:
   - "Gastos de la sección gastos.html"
   - "Retiros de la sección gastos.html"
   
   **Problema**: Actualmente `gastos.html` solo maneja GASTOS operativos, no retiros.
   
   **Diferencia importante:**
   - **Gastos**: Dinero usado para operar el negocio (flores, transporte, materiales)
   - **Retiros**: Dinero que la dueña saca para uso personal (no es gasto del negocio)

2. **Tabla `gastos` Actual**
   ```sql
   categoria: flores, transporte, materiales, mantenimiento, otros
   ```
   
   No tiene categoría para "retiros" ni "aportes".

3. **Duplicación de Gastos**
   
   Actualmente:
   - `caja.total_gastos` = Gastos del día (calculado al cierre)
   - `gastos` tabla = Registro detallado de gastos
   
   Ambos deberían estar sincronizados.

---

## 💡 Recomendación: Diseño Mejorado

### Opción 1: **Sistema Simple (Recomendado para empezar)**

#### Estructura:

```
Capital = Capital_Inicial + Σ(Ingresos_Diarios) - Σ(Gastos_Diarios) + Σ(Aportes) - Σ(Retiros)
```

#### Implementación:

1. **Agregar tabla `movimientos_capital`**
   ```sql
   CREATE TABLE movimientos_capital (
       id SERIAL PRIMARY KEY,
       tipo VARCHAR(50) NOT NULL,  -- 'aporte' | 'retiro' | 'capital_inicial'
       monto DECIMAL(10, 2) NOT NULL,
       descripcion TEXT,
       fecha DATE NOT NULL,
       trabajador_id INTEGER REFERENCES usuarios(id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Agregar tabla `configuracion`** (para capital inicial)
   ```sql
   CREATE TABLE configuracion (
       id SERIAL PRIMARY KEY,
       clave VARCHAR(100) UNIQUE NOT NULL,
       valor TEXT NOT NULL,
       descripcion TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Insertar capital inicial
   INSERT INTO configuracion (clave, valor, descripcion)
   VALUES ('capital_inicial', '5000.00', 'Capital inicial del negocio');
   ```

3. **Cálculo del Capital**
   ```javascript
   async function calcularCapital() {
     // 1. Capital inicial
     const capitalInicial = await query(
       "SELECT valor FROM configuracion WHERE clave = 'capital_inicial'"
     );
     
     // 2. Suma de ingresos (cierres de caja)
     const ingresos = await query(
       "SELECT COALESCE(SUM(total_ventas), 0) as total FROM caja WHERE estado = 'cerrada'"
     );
     
     // 3. Suma de gastos
     const gastos = await query(
       "SELECT COALESCE(SUM(monto), 0) as total FROM gastos"
     );
     
     // 4. Suma de aportes
     const aportes = await query(
       "SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_capital WHERE tipo = 'aporte'"
     );
     
     // 5. Suma de retiros
     const retiros = await query(
       "SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_capital WHERE tipo = 'retiro'"
     );
     
     const capital = parseFloat(capitalInicial.rows[0].valor) +
                     parseFloat(ingresos.rows[0].total) -
                     parseFloat(gastos.rows[0].total) +
                     parseFloat(aportes.rows[0].total) -
                     parseFloat(retiros.rows[0].total);
     
     return capital;
   }
   ```

#### Ventajas:
- ✅ Separación clara entre gastos operativos y movimientos de capital
- ✅ Historial completo de aportes y retiros
- ✅ Capital inicial configurable (aunque por ahora irremovible)
- ✅ Fácil de auditar

---

### Opción 2: **Sistema Avanzado (Para el futuro)**

Agregar más detalle:

```sql
CREATE TABLE movimientos_capital (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,  -- 'aporte' | 'retiro' | 'prestamo' | 'pago_prestamo'
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    categoria VARCHAR(100),  -- 'personal' | 'inversion' | 'emergencia'
    trabajador_id INTEGER REFERENCES usuarios(id),
    aprobado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🏗️ Propuesta de Implementación

### Fase 1: Base de Datos

1. **Crear tabla `configuracion`**
   ```sql
   CREATE TABLE configuracion (
       id SERIAL PRIMARY KEY,
       clave VARCHAR(100) UNIQUE NOT NULL,
       valor TEXT NOT NULL,
       descripcion TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   INSERT INTO configuracion (clave, valor, descripcion)
   VALUES ('capital_inicial', '10000.00', 'Capital inicial del negocio');
   ```

2. **Crear tabla `movimientos_capital`**
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
   
   CREATE INDEX idx_movimientos_capital_tipo ON movimientos_capital(tipo);
   CREATE INDEX idx_movimientos_capital_fecha ON movimientos_capital(fecha);
   ```

### Fase 2: Backend

1. **Crear servicio `capital.service.js`**
   ```javascript
   class CapitalService {
     async getCapitalActual() { ... }
     async registrarAporte(data) { ... }
     async registrarRetiro(data) { ... }
     async getMovimientos(filters) { ... }
     async getCapitalInicial() { ... }
   }
   ```

2. **Crear rutas `capital.routes.js`**
   ```javascript
   GET    /api/capital              // Obtener capital actual
   GET    /api/capital/movimientos  // Historial de movimientos
   POST   /api/capital/aportes      // Registrar aporte
   POST   /api/capital/retiros      // Registrar retiro
   GET    /api/capital/inicial      // Obtener capital inicial
   ```

3. **Actualizar `dashboard.service.js`**
   ```javascript
   async getDashboardStats() {
     // ... stats actuales ...
     
     // Agregar capital
     const capital = await capitalService.getCapitalActual();
     
     return {
       ...stats,
       capital_actual: capital
     };
   }
   ```

### Fase 3: Frontend

1. **Agregar card en dashboard**
   ```html
   <div class="stat-card success">
     <span class="stat-icon">💰</span>
     <div class="stat-label">Capital Actual</div>
     <div class="stat-value" id="capital-actual">S/ 0.00</div>
   </div>
   ```

2. **Crear página `capital.html`** (opcional)
   - Mostrar capital actual
   - Historial de movimientos
   - Formulario para registrar aportes
   - Formulario para registrar retiros

---

## 📊 Visualización en Dashboard

### Card de Capital (Propuesta)

```
┌─────────────────────────────────────┐
│  💰 Capital Actual                  │
│  S/ 45,230.50                       │
│                                     │
│  ↗️ +S/ 2,500 vs mes anterior      │
└─────────────────────────────────────┘

Desglose:
├─ Capital Inicial:  S/ 10,000.00
├─ Ingresos:        +S/ 85,450.00
├─ Gastos:          -S/ 48,219.50
├─ Aportes:         +S/ 5,000.00
└─ Retiros:         -S/ 7,000.00
    ─────────────────────────────────
    Total:           S/ 45,230.50
```

---

## ✅ Conclusión y Recomendación

### Tu idea es EXCELENTE y está bien fundamentada. Aquí está mi recomendación:

1. **Implementar Opción 1 (Sistema Simple)**
   - Crear tabla `configuracion` para capital inicial
   - Crear tabla `movimientos_capital` para aportes/retiros
   - Separar claramente gastos operativos de movimientos de capital

2. **Ubicación de Aportes/Retiros**
   - **Opción A**: Crear nueva sección "Capital" en el menú
     - Ventaja: Separación clara, más profesional
     - Desventaja: Un menú más
   
   - **Opción B**: Agregar en "Gastos" con categorías especiales
     - Ventaja: Todo en un lugar
     - Desventaja: Puede confundir gastos con retiros
   
   - **Recomendación**: **Opción A** - Crear sección "Capital" separada

3. **Mostrar en Dashboard**
   - Card principal con capital actual
   - Desglose de componentes (inicial, ingresos, gastos, aportes, retiros)
   - Comparativa con mes anterior

4. **Flujo de Datos**
   ```
   Dashboard
   ├─ Capital Inicial (configuracion)
   ├─ Ingresos (caja.total_ventas)
   ├─ Gastos (gastos.monto)
   ├─ Aportes (movimientos_capital tipo='aporte')
   └─ Retiros (movimientos_capital tipo='retiro')
   ```

---

## 🚀 Siguiente Paso

¿Quieres que implemente esta funcionalidad? Puedo:

1. ✅ Crear las tablas en la base de datos
2. ✅ Crear el servicio y rutas del backend
3. ✅ Crear la interfaz en el dashboard
4. ✅ Crear la sección "Capital" para gestionar aportes/retiros

¿Procedemos con la implementación?
