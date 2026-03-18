# Sistema de Gastos con Actualización Automática de Inventario

## 🎯 Funcionalidad Implementada

Cuando registras un gasto de categoría "Compra de flores" o "Materiales", ahora puedes:

1. ✅ Actualizar el stock de un ítem existente
2. ✅ Crear un nuevo ítem en el inventario
3. ✅ Registrar el gasto sin afectar el inventario

Todo en una sola operación.

## 📋 Flujo de Uso

### Caso 1: Comprar un ítem que YA existe en el inventario

```
1. Ir a Gastos → Registrar gasto
2. Descripción: "Compra de rosas rojas"
3. Categoría: "Compra de flores"
4. Monto: S/ 450.00
5. Fecha: (hoy)
6. Ítem de inventario: Seleccionar "Rosas rojas (Stock actual: 20 unidad)"
7. Cantidad a agregar: 50
8. Guardar

Resultado:
✅ Gasto registrado: -S/ 450.00 del capital
✅ Stock actualizado: Rosas rojas ahora tiene 70 unidades
```

### Caso 2: Comprar un ítem NUEVO que NO existe en el inventario

```
1. Ir a Gastos → Registrar gasto
2. Descripción: "Compra de orquídeas importadas"
3. Categoría: "Compra de flores"
4. Monto: S/ 800.00
5. Fecha: (hoy)
6. Ítem de inventario: Seleccionar "➕ Crear nuevo ítem"
7. Nombre del nuevo ítem: "Orquídeas blancas importadas"
8. Unidad: "unidad"
9. Costo unitario: S/ 16.00
10. Cantidad a agregar: 50
11. Guardar

Resultado:
✅ Nuevo ítem creado en inventario: "Orquídeas blancas importadas"
✅ Stock inicial: 50 unidades
✅ Gasto registrado: -S/ 800.00 del capital
```

### Caso 3: Registrar un gasto SIN afectar el inventario

```
1. Ir a Gastos → Registrar gasto
2. Descripción: "Compra de materiales varios"
3. Categoría: "Materiales"
4. Monto: S/ 150.00
5. Fecha: (hoy)
6. Ítem de inventario: Dejar en "-- No actualizar inventario --"
7. Guardar

Resultado:
✅ Gasto registrado: -S/ 150.00 del capital
❌ Inventario no se modifica
```

## 🎨 Interfaz

### Modal "Registrar gasto"

```
┌─────────────────────────────────────────────────────┐
│ Registrar gasto                                  [×]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ Descripción: [Compra de rosas rojas al proveedor] │
│                                                     │
│ Categoría: [Compra de flores ▼]  Monto: [450.00]  │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 💡 Al registrar este gasto, el stock del ítem  ││
│ │    seleccionado se actualizará automáticamente ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Ítem de inventario:                                │
│ [-- No actualizar inventario --              ▼]   │
│ [➕ Crear nuevo ítem                          ]   │
│ [Rosas rojas (Stock actual: 20 unidad)       ]   │
│ [Girasoles (Stock actual: 15 unidad)         ]   │
│                                                     │
│ Cantidad a agregar: [50]                           │
│                                                     │
│ Fecha: [2026-03-18]                                │
│                                                     │
├─────────────────────────────────────────────────────┤
│                          [Cancelar] [Guardar gasto]│
└─────────────────────────────────────────────────────┘
```

### Cuando seleccionas "➕ Crear nuevo ítem"

```
┌─────────────────────────────────────────────────────┐
│ Ítem de inventario:                                │
│ [➕ Crear nuevo ítem                          ▼]   │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ✨ Se creará un nuevo ítem en el inventario    ││
│ │    con los datos ingresados                    ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Nombre del nuevo ítem: *                           │
│ [Orquídeas blancas importadas]                     │
│                                                     │
│ Unidad: [unidad ▼]  Costo unitario: [16.00]       │
│                                                     │
│ Cantidad a agregar: * [50]                         │
└─────────────────────────────────────────────────────┘
```

## 🔄 Flujo Técnico

### Backend (gastos.service.js)

```javascript
async create(data) {
  // 1. Validar datos del gasto
  
  // 2. Si se proporciona inventario_id y cantidad:
  if (data.inventario_id && data.cantidad) {
    // Verificar que el ítem existe
    // Actualizar stock: stock = stock + cantidad
  }
  
  // 3. Crear el gasto
  // 4. El capital se actualiza automáticamente
}
```

### Frontend (gastos.html)

```javascript
async guardarGasto() {
  // 1. Si seleccionó "Crear nuevo ítem":
  if (inventarioId === 'nuevo') {
    // Crear ítem en inventario primero
    await API.post('/inventario', { ... });
  }
  
  // 2. Si seleccionó un ítem existente:
  else if (inventarioId && cantidad > 0) {
    // Agregar inventario_id y cantidad al payload
    payload.inventario_id = inventarioId;
    payload.cantidad = cantidad;
  }
  
  // 3. Registrar el gasto
  await API.post('/gastos', payload);
}
```

## 📊 Impacto en el Sistema

### Capital del Negocio

```
Antes de registrar el gasto:
Capital = S/ 10,000.00

Registras gasto de S/ 450.00 (compra de flores)

Después:
Capital = S/ 9,550.00
```

### Inventario

```
Antes:
Rosas rojas: 20 unidades

Registras gasto con cantidad: +50

Después:
Rosas rojas: 70 unidades
```

## ✅ Ventajas

1. **Un solo paso**: Registras el gasto y actualizas el inventario simultáneamente
2. **Menos errores**: No olvidas actualizar el inventario manualmente
3. **Flexibilidad**: Puedes crear ítems nuevos sobre la marcha
4. **Trazabilidad**: El gasto queda vinculado al inventario
5. **Automático**: El capital se actualiza sin intervención manual

## 🎯 Casos de Uso

### Florería

1. **Compra semanal de flores**
   - Categoría: Compra de flores
   - Seleccionar ítems existentes
   - Actualizar stock automáticamente

2. **Nueva variedad de flores**
   - Categoría: Compra de flores
   - Crear nuevo ítem
   - Establecer stock inicial

3. **Materiales de empaque**
   - Categoría: Materiales
   - Seleccionar o crear ítems
   - Actualizar stock

4. **Gastos operativos**
   - Categoría: Transporte, Mantenimiento, Otros
   - No afecta inventario
   - Solo registra el gasto

## 🔐 Validaciones

- ✅ Descripción obligatoria
- ✅ Monto mayor a 0
- ✅ Si selecciona ítem, cantidad es obligatoria
- ✅ Si crea nuevo ítem, nombre es obligatorio
- ✅ Cantidad debe ser mayor a 0
- ✅ Costo unitario debe ser mayor o igual a 0

## 📝 Notas Importantes

1. **Categorías que afectan inventario:**
   - Compra de flores → Ítems tipo "flores"
   - Materiales → Ítems tipo "materiales" o "accesorios"

2. **Categorías que NO afectan inventario:**
   - Transporte
   - Mantenimiento
   - Otros

3. **Campos opcionales:**
   - Actualizar inventario es opcional
   - Puedes registrar gastos sin afectar el inventario

4. **Tipo automático:**
   - Si categoría = "Compra de flores" → tipo = "flores"
   - Si categoría = "Materiales" → tipo = "materiales"

## 🚀 Próximas Mejoras (Opcional)

1. Agregar campo "Proveedor" en el gasto
2. Historial de compras por ítem
3. Alertas de precios (si el costo aumenta mucho)
4. Sugerencias de compra basadas en stock bajo
5. Reportes de gastos por categoría

---

**Implementado el:** 18 de marzo de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Funcional y probado
