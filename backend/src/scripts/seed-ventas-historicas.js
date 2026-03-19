/**
 * Script para generar datos sintéticos de ventas históricas
 * Genera ventas de los últimos 2 meses para probar el sistema
 * 
 * Uso: node backend/src/scripts/seed-ventas-historicas.js
 */

require('dotenv').config();
const { query, getClient } = require('../config/database');

// Métodos de pago con sus probabilidades
const METODOS_PAGO = [
  { metodo: 'Efectivo', peso: 40 },
  { metodo: 'Yape', peso: 30 },
  { metodo: 'Plin', peso: 15 },
  { metodo: 'Tarjeta', peso: 10 },
  { metodo: 'Transferencia bancaria', peso: 5 }
];

// Función para seleccionar método de pago basado en probabilidades
function seleccionarMetodoPago() {
  const total = METODOS_PAGO.reduce((sum, m) => sum + m.peso, 0);
  let random = Math.random() * total;
  
  for (const metodo of METODOS_PAGO) {
    random -= metodo.peso;
    if (random <= 0) return metodo.metodo;
  }
  
  return METODOS_PAGO[0].metodo;
}

// Función para generar fecha aleatoria en los últimos 2 meses
function generarFechaAleatoria() {
  const ahora = new Date();
  const dosMesesAtras = new Date();
  dosMesesAtras.setMonth(ahora.getMonth() - 2);
  
  const timestamp = dosMesesAtras.getTime() + 
    Math.random() * (ahora.getTime() - dosMesesAtras.getTime());
  
  return new Date(timestamp);
}

// Función para generar hora de trabajo (8am - 8pm)
function ajustarHoraTrabajo(fecha) {
  const horaInicio = 8;
  const horaFin = 20;
  const hora = horaInicio + Math.random() * (horaFin - horaInicio);
  
  fecha.setHours(Math.floor(hora));
  fecha.setMinutes(Math.floor(Math.random() * 60));
  fecha.setSeconds(Math.floor(Math.random() * 60));
  
  return fecha;
}

// Función para seleccionar productos aleatorios
function seleccionarProductos(productos, min = 1, max = 5) {
  const cantidad = min + Math.floor(Math.random() * (max - min + 1));
  const seleccionados = [];
  const productosDisponibles = [...productos];
  
  for (let i = 0; i < cantidad && productosDisponibles.length > 0; i++) {
    const idx = Math.floor(Math.random() * productosDisponibles.length);
    const producto = productosDisponibles.splice(idx, 1)[0];
    
    // Cantidad aleatoria entre 1 y 12 (más probable 1-3)
    const cantidadProducto = Math.random() < 0.7 
      ? 1 + Math.floor(Math.random() * 3)  // 70% probabilidad: 1-3 unidades
      : 4 + Math.floor(Math.random() * 9); // 30% probabilidad: 4-12 unidades
    
    seleccionados.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      cantidad: cantidadProducto
    });
  }
  
  return seleccionados;
}

async function generarVentasHistoricas() {
  console.log('🌸 Generando datos sintéticos de ventas históricas...\n');
  
  try {
    // 1. Obtener productos disponibles
    console.log('📦 Cargando productos...');
    const productosResult = await query('SELECT id, nombre, precio, stock FROM productos WHERE stock > 0');
    const productos = productosResult.rows;
    
    if (productos.length === 0) {
      console.error('❌ No hay productos disponibles. Ejecuta primero el script de seed-demo-data.js');
      process.exit(1);
    }
    
    console.log(`   ✓ ${productos.length} productos disponibles\n`);
    
    // 2. Obtener trabajadores (usuarios)
    console.log('👥 Cargando trabajadores...');
    const trabajadoresResult = await query('SELECT id, nombre FROM usuarios');
    const trabajadores = trabajadoresResult.rows;
    
    if (trabajadores.length === 0) {
      console.error('❌ No hay trabajadores disponibles.');
      process.exit(1);
    }
    
    console.log(`   ✓ ${trabajadores.length} trabajadores disponibles\n`);
    
    // 3. Obtener clientes
    console.log('👤 Cargando clientes...');
    const clientesResult = await query('SELECT id, nombre FROM clientes');
    const clientes = clientesResult.rows;
    
    console.log(`   ✓ ${clientes.length} clientes disponibles\n`);
    
    // 4. Generar ventas
    const CANTIDAD_VENTAS = 150; // Aproximadamente 2-3 ventas por día durante 2 meses
    console.log(`💰 Generando ${CANTIDAD_VENTAS} ventas históricas...\n`);
    
    let ventasCreadas = 0;
    let totalVentas = 0;
    
    for (let i = 0; i < CANTIDAD_VENTAS; i++) {
      const client = await getClient();
      
      try {
        await client.query('BEGIN');
        
        // Generar datos de la venta
        const fecha = ajustarHoraTrabajo(generarFechaAleatoria());
        const trabajador = trabajadores[Math.floor(Math.random() * trabajadores.length)];
        const metodoPago = seleccionarMetodoPago();
        
        // 60% de probabilidad de tener cliente asociado
        const tieneCliente = Math.random() < 0.6;
        const cliente = tieneCliente && clientes.length > 0
          ? clientes[Math.floor(Math.random() * clientes.length)]
          : null;
        
        // Seleccionar productos
        const productosVenta = seleccionarProductos(productos);
        
        // Calcular total
        const total = productosVenta.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        // Insertar venta
        const ventaResult = await client.query(
          `INSERT INTO ventas (total, metodo_pago, trabajador_id, cliente_id, fecha, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $5, $5)
           RETURNING id`,
          [total, metodoPago, trabajador.id, cliente?.id || null, fecha]
        );
        
        const ventaId = ventaResult.rows[0].id;
        
        // Insertar productos de la venta
        for (const prod of productosVenta) {
          const subtotal = prod.precio * prod.cantidad;
          
          await client.query(
            `INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal)
             VALUES ($1, $2, $3, $4, $5)`,
            [ventaId, prod.producto_id, prod.cantidad, prod.precio, subtotal]
          );
        }
        
        await client.query('COMMIT');
        
        ventasCreadas++;
        totalVentas += total;
        
        // Mostrar progreso cada 10 ventas
        if (ventasCreadas % 10 === 0) {
          console.log(`   ✓ ${ventasCreadas}/${CANTIDAD_VENTAS} ventas creadas...`);
        }
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`   ✗ Error en venta ${i + 1}:`, error.message);
      } finally {
        client.release();
      }
    }
    
    console.log(`\n✅ Proceso completado!\n`);
    console.log('📊 Resumen:');
    console.log(`   • Ventas creadas: ${ventasCreadas}`);
    console.log(`   • Total vendido: S/ ${totalVentas.toFixed(2)}`);
    console.log(`   • Ticket promedio: S/ ${(totalVentas / ventasCreadas).toFixed(2)}`);
    console.log(`   • Período: Últimos 2 meses`);
    
    // Mostrar distribución por método de pago
    console.log('\n💳 Distribución por método de pago:');
    const distribucionResult = await query(
      `SELECT metodo_pago, COUNT(*) as cantidad, SUM(total) as total
       FROM ventas
       GROUP BY metodo_pago
       ORDER BY cantidad DESC`
    );
    
    distribucionResult.rows.forEach(row => {
      console.log(`   • ${row.metodo_pago}: ${row.cantidad} ventas (S/ ${parseFloat(row.total).toFixed(2)})`);
    });
    
    // Mostrar ventas por mes
    console.log('\n📅 Ventas por mes:');
    const ventasMesResult = await query(
      `SELECT 
         TO_CHAR(fecha, 'YYYY-MM') as mes,
         COUNT(*) as cantidad,
         SUM(total) as total
       FROM ventas
       GROUP BY TO_CHAR(fecha, 'YYYY-MM')
       ORDER BY mes DESC`
    );
    
    ventasMesResult.rows.forEach(row => {
      console.log(`   • ${row.mes}: ${row.cantidad} ventas (S/ ${parseFloat(row.total).toFixed(2)})`);
    });
    
    console.log('\n🎉 ¡Datos sintéticos generados exitosamente!\n');
    
  } catch (error) {
    console.error('\n❌ Error al generar datos:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Ejecutar script
generarVentasHistoricas();
