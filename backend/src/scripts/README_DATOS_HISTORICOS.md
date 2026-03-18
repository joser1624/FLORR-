# 📊 Scripts de Generación de Datos Históricos

Scripts para generar datos sintéticos de ventas y gastos de los últimos 2 meses.

---

## 🎯 Propósito

Estos scripts generan datos históricos realistas para:
- Probar funcionalidades de filtrado por fechas
- Verificar paginación con grandes volúmenes de datos
- Probar reportes y estadísticas
- Visualizar gráficos y tendencias
- Probar el sistema de capital con movimientos históricos

---

## 📁 Scripts Disponibles

### 1. `seed-datos-historicos.js` (RECOMENDADO)
**Script maestro que ejecuta todos los demás en secuencia.**

```bash
node backend/src/scripts/seed-datos-historicos.js
```

Este script:
- ✅ Genera ~150 ventas históricas
- ✅ Genera ~50 gastos históricos
- ✅ Actualiza movimientos de capital
- ✅ Muestra estadísticas al finalizar
- ✅ Solicita confirmación antes de ejecutar

### 2. `seed-ventas-historicas.js`
Genera solo ventas históricas.

```bash
node backend/src/scripts/seed-ventas-historicas.js
```

**Características:**
- Genera 150 ventas distribuidas en 2 meses
- Fechas aleatorias en horario laboral (8am - 8pm)
- Métodos de pago con distribución realista:
  - Efectivo: 40%
  - Yape: 30%
  - Plin: 15%
  - Tarjeta: 10%
  - Transferencia: 5%
- 1-5 productos por venta
- 60% de ventas con cliente asociado
- Trabajadores asignados aleatoriamente

### 3. `seed-gastos-historicos.js`
Genera solo gastos históricos.

```bash
node backend/src/scripts/seed-gastos-historicos.js
```

**Características:**
- Genera ~50 gastos distribuidos en 2 meses
- 8 categorías de gastos:
  - Compra de flores (cada 15 días)
  - Materiales (cada 20 días)
  - Servicios (mensual)
  - Alquiler (mensual)
  - Transporte (semanal)
  - Mantenimiento (cada 45 días)
  - Publicidad (cada 20 días)
  - Otros (cada 15 días)
- Montos realistas por categoría
- Fechas aleatorias distribuidas

---

## 🚀 Uso Rápido

### Opción 1: Script Maestro (Recomendado)
```bash
# Desde la raíz del proyecto
node backend/src/scripts/seed-datos-historicos.js
```

### Opción 2: Scripts Individuales
```bash
# Solo ventas
node backend/src/scripts/seed-ventas-historicas.js

# Solo gastos
node backend/src/scripts/seed-gastos-historicos.js
```

---

## ⚙️ Requisitos Previos

Antes de ejecutar estos scripts, asegúrate de tener:

1. **Base de datos configurada**
   ```bash
   node backend/src/scripts/init-db.js
   ```

2. **Datos demo básicos**
   ```bash
   node backend/src/scripts/seed-demo-data.js
   ```
   
   Esto crea:
   - Productos con stock
   - Trabajadores
   - Clientes
   - Usuario admin

3. **Variables de entorno configuradas**
   - Archivo `.env` con credenciales de base de datos

---

## 📊 Datos Generados

### Ventas Históricas
- **Cantidad**: ~150 ventas
- **Período**: Últimos 2 meses
- **Distribución**: 2-3 ventas por día
- **Total estimado**: S/ 15,000 - S/ 25,000
- **Ticket promedio**: S/ 100 - S/ 200

### Gastos Históricos
- **Cantidad**: ~50 gastos
- **Período**: Últimos 2 meses
- **Total estimado**: S/ 8,000 - S/ 12,000
- **Gasto promedio**: S/ 150 - S/ 250

---

## 🧪 Verificación

Después de ejecutar los scripts, verifica los datos:

### 1. Consultar ventas
```sql
SELECT COUNT(*), SUM(total) FROM ventas;
SELECT TO_CHAR(fecha, 'YYYY-MM') as mes, COUNT(*) 
FROM ventas 
GROUP BY mes 
ORDER BY mes DESC;
```

### 2. Consultar gastos
```sql
SELECT COUNT(*), SUM(monto) FROM gastos;
SELECT categoria, COUNT(*), SUM(monto) 
FROM gastos 
GROUP BY categoria 
ORDER BY SUM(monto) DESC;
```

### 3. Verificar en el panel admin
1. Inicia el backend: `npm run dev`
2. Abre el panel admin
3. Ve a la sección "Ventas"
4. Prueba los filtros por fecha
5. Ve a la sección "Gastos"
6. Ve al "Dashboard" para ver estadísticas

---

## 🎨 Funcionalidades que Puedes Probar

Con estos datos históricos podrás probar:

### En Ventas
- ✅ Filtrado por fecha (últimos 2 meses)
- ✅ Filtrado por método de pago
- ✅ Filtrado por trabajador
- ✅ Paginación (más de 50 ventas)
- ✅ Ordenamiento por fecha, monto, método
- ✅ Resumen del día
- ✅ Estadísticas de ventas

### En Gastos
- ✅ Filtrado por fecha
- ✅ Filtrado por categoría
- ✅ Paginación
- ✅ Ordenamiento
- ✅ Estadísticas de gastos

### En Dashboard
- ✅ Gráficos de tendencias
- ✅ Comparación mes a mes
- ✅ Capital actualizado con movimientos
- ✅ Indicadores de rendimiento

### En Reportes
- ✅ Reportes mensuales
- ✅ Reportes por período
- ✅ Análisis de rentabilidad
- ✅ Productos más vendidos

---

## ⚠️ Notas Importantes

1. **No afecta el stock**: Los scripts NO descontarán stock de productos. Solo crean registros de ventas históricas.

2. **Datos sintéticos**: Los datos son generados aleatoriamente y no representan ventas reales.

3. **Ejecución múltiple**: Puedes ejecutar los scripts múltiples veces. Cada ejecución agregará más datos.

4. **Limpieza**: Si quieres limpiar los datos generados:
   ```sql
   DELETE FROM ventas_productos;
   DELETE FROM ventas;
   DELETE FROM gastos;
   ```

5. **Rendimiento**: La generación de 150 ventas puede tardar 1-2 minutos dependiendo de tu sistema.

---

## 🐛 Solución de Problemas

### Error: "No hay productos disponibles"
**Solución**: Ejecuta primero el script de datos demo:
```bash
node backend/src/scripts/seed-demo-data.js
```

### Error: "No hay trabajadores disponibles"
**Solución**: Crea al menos un trabajador o ejecuta el script de datos demo.

### Error: "Connection refused"
**Solución**: Verifica que PostgreSQL esté corriendo y las credenciales en `.env` sean correctas.

### Error: "Permission denied"
**Solución**: Verifica los permisos de la base de datos para el usuario configurado.

---

## 📝 Personalización

Puedes modificar los scripts para ajustar:

### En `seed-ventas-historicas.js`:
- `CANTIDAD_VENTAS`: Número de ventas a generar (línea 88)
- `METODOS_PAGO`: Distribución de métodos de pago (líneas 13-19)
- Rango de productos por venta (línea 60)
- Rango de cantidades por producto (líneas 67-70)

### En `seed-gastos-historicos.js`:
- `GASTOS_TIPOS`: Categorías y frecuencias (líneas 13-52)
- Montos mínimos y máximos por categoría
- Frecuencia de cada tipo de gasto

---

## 🎯 Próximos Pasos

Después de generar los datos:

1. **Explora el sistema** con datos realistas
2. **Prueba los filtros** por fecha y otros criterios
3. **Verifica la paginación** con grandes volúmenes
4. **Genera reportes** para ver tendencias
5. **Prueba el dashboard** con estadísticas reales

---

## 📚 Documentación Relacionada

- [Setup Guide](../../docs/setup/SETUP_GUIDE.md)
- [Integración de Ventas](../../docs/integraciones/VENTAS_INTEGRACION_BACKEND.md)
- [Instrucciones de Reinicio](../../docs/setup/INSTRUCCIONES_REINICIAR_BACKEND.md)

---

**Última actualización:** 18 de marzo de 2026  
**Versión:** 1.0.0
