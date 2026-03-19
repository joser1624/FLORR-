# 🚀 Guía Rápida: Generar Datos Históricos

Esta guía te ayudará a generar datos sintéticos de ventas y gastos de los últimos 2 meses para probar el sistema completo.

---

## ⚡ Inicio Rápido

### Opción 1: Usando npm (Recomendado)
```bash
cd backend
npm run seed:historicos
```

### Opción 2: Usando node directamente
```bash
node backend/src/scripts/seed-datos-historicos.js
```

---

## 📋 Requisitos Previos

Antes de generar datos históricos, asegúrate de tener:

### 1. Base de datos inicializada
```bash
cd backend
node src/scripts/init-db.js
```

### 2. Datos demo básicos
```bash
node src/scripts/seed-demo-data.js
```

Esto crea:
- ✅ Productos con stock
- ✅ Trabajadores
- ✅ Clientes
- ✅ Usuario admin (admin@encantoseternos.com / admin123)

---

## 🎯 ¿Qué se Generará?

### 📊 Ventas Históricas (~150 ventas)
- Distribuidas en los últimos 2 meses
- 2-3 ventas por día en promedio
- Horario laboral: 8am - 8pm
- Métodos de pago realistas:
  - 40% Efectivo
  - 30% Yape
  - 15% Plin
  - 10% Tarjeta
  - 5% Transferencia bancaria
- 1-5 productos por venta
- 60% con cliente asociado
- Total estimado: S/ 15,000 - S/ 25,000

### 💸 Gastos Históricos (~50 gastos)
- Distribuidos en los últimos 2 meses
- 8 categorías:
  - Compra de flores
  - Materiales
  - Servicios (luz, agua, internet)
  - Alquiler
  - Transporte
  - Mantenimiento
  - Publicidad
  - Otros
- Total estimado: S/ 8,000 - S/ 12,000

---

## 🔧 Comandos Disponibles

### Generar todo (ventas + gastos)
```bash
npm run seed:historicos
```

### Solo ventas
```bash
npm run seed:ventas
```

### Solo gastos
```bash
npm run seed:gastos
```

---

## ✅ Verificación

Después de generar los datos:

### 1. Inicia el backend
```bash
npm run dev
```

### 2. Abre el panel admin
- URL: `http://localhost:5500/pages/admin/dashboard.html`
- Usuario: `admin@encantoseternos.com`
- Contraseña: `admin123`

### 3. Explora las secciones

#### Dashboard
- Verás estadísticas actualizadas
- Capital con movimientos históricos
- Gráficos de tendencias

#### Ventas
- Más de 150 ventas históricas
- Prueba los filtros por fecha
- Prueba el filtro por método de pago
- Prueba el filtro por trabajador
- Verifica la paginación (50 por página)
- Prueba el ordenamiento

#### Gastos
- Más de 50 gastos históricos
- Prueba los filtros por fecha
- Prueba el filtro por categoría
- Verifica la distribución por categoría

#### Reportes
- Genera reportes mensuales
- Compara meses
- Analiza tendencias

---

## 🎨 Funcionalidades que Puedes Probar

Con estos datos históricos podrás probar:

### Filtros por Fecha
- ✅ Ventas del último mes
- ✅ Ventas de hace 2 meses
- ✅ Gastos por período
- ✅ Comparación entre meses

### Paginación
- ✅ Más de 50 ventas (3 páginas)
- ✅ Navegación entre páginas
- ✅ Rendimiento con grandes volúmenes

### Ordenamiento
- ✅ Por fecha (más reciente/antiguo)
- ✅ Por monto (mayor/menor)
- ✅ Por método de pago
- ✅ Por categoría

### Estadísticas
- ✅ Total de ventas por mes
- ✅ Total de gastos por mes
- ✅ Ticket promedio
- ✅ Método de pago más usado
- ✅ Categoría de gasto más frecuente

### Reportes
- ✅ Reporte mensual de ventas
- ✅ Reporte mensual de gastos
- ✅ Análisis de rentabilidad
- ✅ Productos más vendidos

---

## 📊 Ejemplo de Salida

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌸 Generación de Datos Históricos 🌸                   ║
║   Encantos Eternos - Sistema de Gestión                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Este script generará datos sintéticos de los últimos 2 meses:

  • Ventas históricas (~150 ventas)
  • Gastos históricos (~50 gastos)
  • Movimientos de capital

⚠️  IMPORTANTE: Este proceso puede tardar unos minutos.

¿Deseas continuar? (s/n): s

🚀 Iniciando generación de datos...

═══════════════════════════════════════════════════════════
PASO 1: Generando ventas históricas
═══════════════════════════════════════════════════════════

🌸 Generando datos sintéticos de ventas históricas...

📦 Cargando productos...
   ✓ 25 productos disponibles

👥 Cargando trabajadores...
   ✓ 3 trabajadores disponibles

👤 Cargando clientes...
   ✓ 15 clientes disponibles

💰 Generando 150 ventas históricas...

   ✓ 10/150 ventas creadas...
   ✓ 20/150 ventas creadas...
   ...
   ✓ 150/150 ventas creadas...

✅ Proceso completado!

📊 Resumen:
   • Ventas creadas: 150
   • Total vendido: S/ 18,542.50
   • Ticket promedio: S/ 123.62
   • Período: Últimos 2 meses

💳 Distribución por método de pago:
   • Efectivo: 62 ventas (S/ 7,845.20)
   • Yape: 45 ventas (S/ 5,234.80)
   • Plin: 23 ventas (S/ 2,876.50)
   • Tarjeta: 15 ventas (S/ 1,923.00)
   • Transferencia bancaria: 5 ventas (S/ 663.00)

📅 Ventas por mes:
   • 2026-03: 75 ventas (S/ 9,234.50)
   • 2026-02: 50 ventas (S/ 6,123.00)
   • 2026-01: 25 ventas (S/ 3,185.00)

🎉 ¡Datos sintéticos generados exitosamente!

═══════════════════════════════════════════════════════════
PASO 2: Generando gastos históricos
═══════════════════════════════════════════════════════════

💸 Generando datos sintéticos de gastos históricos...

📝 Generando gastos por categoría...

   Compra de flores:
      ✓ 4 gastos creados
   Materiales:
      ✓ 3 gastos creados
   ...

✅ Proceso completado!

📊 Resumen:
   • Gastos creados: 52
   • Total gastado: S/ 9,876.40
   • Gasto promedio: S/ 189.93
   • Período: Últimos 2 meses

═══════════════════════════════════════════════════════════
✅ PROCESO COMPLETADO EXITOSAMENTE
═══════════════════════════════════════════════════════════

📊 Datos generados:
   ✓ Ventas históricas de 2 meses
   ✓ Gastos históricos de 2 meses
   ✓ Movimientos de capital actualizados

🎯 Próximos pasos:
   1. Inicia el backend: npm run dev
   2. Abre el panel admin en el navegador
   3. Explora las secciones de Ventas, Gastos y Dashboard
   4. Prueba los filtros por fecha y otros criterios

🌸 ¡Disfruta explorando el sistema con datos reales! 🌸
```

---

## ⚠️ Notas Importantes

1. **No afecta el stock**: Los scripts NO descontarán stock de productos. Solo crean registros históricos.

2. **Datos sintéticos**: Los datos son generados aleatoriamente para pruebas.

3. **Ejecución múltiple**: Puedes ejecutar los scripts varias veces. Cada ejecución agregará más datos.

4. **Tiempo de ejecución**: La generación puede tardar 1-2 minutos.

---

## 🐛 Solución de Problemas

### Error: "No hay productos disponibles"
```bash
# Ejecuta primero el script de datos demo
node src/scripts/seed-demo-data.js
```

### Error: "Connection refused"
```bash
# Verifica que PostgreSQL esté corriendo
# En Windows:
services.msc  # Busca PostgreSQL

# Verifica las credenciales en .env
```

### Error: "Permission denied"
```bash
# Verifica los permisos del usuario de base de datos
# Conéctate como superusuario y otorga permisos
```

---

## 🧹 Limpiar Datos Generados

Si quieres eliminar los datos generados:

```sql
-- Conectarse a la base de datos
psql -U postgres -d floreria_system_core

-- Eliminar datos
DELETE FROM ventas_productos;
DELETE FROM ventas;
DELETE FROM gastos;

-- Verificar
SELECT COUNT(*) FROM ventas;
SELECT COUNT(*) FROM gastos;
```

---

## 📚 Documentación Adicional

- [README de Scripts](backend/src/scripts/README_DATOS_HISTORICOS.md) - Documentación técnica completa
- [Setup Guide](docs/setup/SETUP_GUIDE.md) - Guía de instalación
- [Integración de Ventas](docs/integraciones/VENTAS_INTEGRACION_BACKEND.md) - Documentación de ventas

---

## 🎯 Próximos Pasos

1. ✅ Genera los datos históricos
2. ✅ Inicia el backend
3. ✅ Explora el panel admin
4. ✅ Prueba todas las funcionalidades
5. ✅ Genera reportes
6. ✅ Analiza tendencias

---

**¡Listo para explorar el sistema con datos reales!** 🌸

**Última actualización:** 18 de marzo de 2026
