/**
 * Script para generar datos sintéticos de gastos históricos
 * Genera gastos de los últimos 2 meses para probar el sistema
 * 
 * Uso: node backend/src/scripts/seed-gastos-historicos.js
 */

require('dotenv').config();
const { query } = require('../config/database');

// Categorías de gastos con ejemplos
const GASTOS_TIPOS = [
  {
    categoria: 'Compra de flores',
    descripcion: 'Compra de flores frescas',
    montoMin: 150,
    montoMax: 800,
    frecuencia: 15 // Cada 15 días aproximadamente
  },
  {
    categoria: 'Materiales',
    descripcion: 'Compra de materiales (cintas, papel, cajas)',
    montoMin: 50,
    montoMax: 300,
    frecuencia: 20
  },
  {
    categoria: 'Servicios',
    descripcion: 'Pago de servicios (luz, agua, internet)',
    montoMin: 100,
    montoMax: 250,
    frecuencia: 30 // Mensual
  },
  {
    categoria: 'Alquiler',
    descripcion: 'Pago de alquiler del local',
    montoMin: 800,
    montoMax: 1200,
    frecuencia: 30 // Mensual
  },
  {
    categoria: 'Transporte',
    descripcion: 'Gastos de transporte y delivery',
    montoMin: 20,
    montoMax: 100,
    frecuencia: 7 // Semanal
  },
  {
    categoria: 'Mantenimiento',
    descripcion: 'Mantenimiento de equipos y local',
    montoMin: 80,
    montoMax: 400,
    frecuencia: 45
  },
  {
    categoria: 'Publicidad',
    descripcion: 'Gastos en publicidad y marketing',
    montoMin: 100,
    montoMax: 500,
    frecuencia: 20
  },
  {
    categoria: 'Otros',
    descripcion: 'Gastos varios',
    montoMin: 30,
    montoMax: 150,
    frecuencia: 15
  }
];

// Función para generar fecha aleatoria en los últimos 2 meses
function generarFechaAleatoria() {
  const ahora = new Date();
  const dosMesesAtras = new Date();
  dosMesesAtras.setMonth(ahora.getMonth() - 2);
  
  const timestamp = dosMesesAtras.getTime() + 
    Math.random() * (ahora.getTime() - dosMesesAtras.getTime());
  
  return new Date(timestamp);
}

// Función para generar monto aleatorio en un rango
function generarMonto(min, max) {
  return (min + Math.random() * (max - min)).toFixed(2);
}

async function generarGastosHistoricos() {
  console.log('💸 Generando datos sintéticos de gastos históricos...\n');
  
  try {
    // Calcular cuántos gastos generar por categoría
    const diasEnDosMeses = 60;
    let gastosCreados = 0;
    let totalGastos = 0;
    
    console.log('📝 Generando gastos por categoría...\n');
    
    for (const tipo of GASTOS_TIPOS) {
      const cantidadGastos = Math.ceil(diasEnDosMeses / tipo.frecuencia);
      
      console.log(`   ${tipo.categoria}:`);
      
      for (let i = 0; i < cantidadGastos; i++) {
        const fecha = generarFechaAleatoria();
        const monto = generarMonto(tipo.montoMin, tipo.montoMax);
        
        // Generar descripción variada
        const descripciones = [
          tipo.descripcion,
          `${tipo.descripcion} - ${fecha.toLocaleDateString('es-PE', { month: 'long' })}`,
          `${tipo.descripcion} - Proveedor`,
          tipo.descripcion
        ];
        
        const descripcion = descripciones[Math.floor(Math.random() * descripciones.length)];
        
        try {
          // Convertir fecha a formato DATE (YYYY-MM-DD)
          const fechaStr = fecha.toISOString().split('T')[0];
          
          await query(
            `INSERT INTO gastos (categoria, descripcion, monto, fecha, created_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [tipo.categoria, descripcion, monto, fechaStr]
          );
          
          gastosCreados++;
          totalGastos += parseFloat(monto);
          
        } catch (error) {
          console.error(`      ✗ Error al crear gasto:`, error.message);
        }
      }
      
      console.log(`      ✓ ${cantidadGastos} gastos creados`);
    }
    
    console.log(`\n✅ Proceso completado!\n`);
    console.log('📊 Resumen:');
    console.log(`   • Gastos creados: ${gastosCreados}`);
    console.log(`   • Total gastado: S/ ${totalGastos.toFixed(2)}`);
    console.log(`   • Gasto promedio: S/ ${(totalGastos / gastosCreados).toFixed(2)}`);
    console.log(`   • Período: Últimos 2 meses`);
    
    // Mostrar distribución por categoría
    console.log('\n📋 Distribución por categoría:');
    const distribucionResult = await query(
      `SELECT categoria, COUNT(*) as cantidad, SUM(monto) as total
       FROM gastos
       GROUP BY categoria
       ORDER BY total DESC`
    );
    
    distribucionResult.rows.forEach(row => {
      console.log(`   • ${row.categoria}: ${row.cantidad} gastos (S/ ${parseFloat(row.total).toFixed(2)})`);
    });
    
    // Mostrar gastos por mes
    console.log('\n📅 Gastos por mes:');
    const gastosMesResult = await query(
      `SELECT 
         TO_CHAR(fecha, 'YYYY-MM') as mes,
         COUNT(*) as cantidad,
         SUM(monto) as total
       FROM gastos
       GROUP BY TO_CHAR(fecha, 'YYYY-MM')
       ORDER BY mes DESC`
    );
    
    gastosMesResult.rows.forEach(row => {
      console.log(`   • ${row.mes}: ${row.cantidad} gastos (S/ ${parseFloat(row.total).toFixed(2)})`);
    });
    
    console.log('\n🎉 ¡Datos sintéticos de gastos generados exitosamente!\n');
    
  } catch (error) {
    console.error('\n❌ Error al generar datos:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Ejecutar script
generarGastosHistoricos();
