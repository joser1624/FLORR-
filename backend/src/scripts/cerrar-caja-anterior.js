const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function cerrarCajaAnterior() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'floreria_system_core',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
  });

  try {
    console.log('🔍 Buscando cajas abiertas...\n');

    // Buscar cajas abiertas
    const result = await pool.query(`
      SELECT c.*, u.nombre as trabajador_nombre
      FROM caja c
      LEFT JOIN usuarios u ON c.trabajador_apertura_id = u.id
      WHERE c.estado = 'abierta'
      ORDER BY c.fecha DESC
    `);

    if (result.rows.length === 0) {
      console.log('✅ No hay cajas abiertas. Todo está en orden.');
      return;
    }

    console.log(`⚠️  Encontradas ${result.rows.length} caja(s) abierta(s):\n`);
    
    for (const caja of result.rows) {
      const fecha = new Date(caja.fecha).toLocaleDateString('es-PE');
      const esHoy = caja.fecha === new Date().toISOString().split('T')[0];
      
      console.log(`📅 Fecha: ${fecha} ${esHoy ? '(HOY)' : '(ANTERIOR)'}`);
      console.log(`   Apertura: S/ ${parseFloat(caja.monto_apertura).toFixed(2)}`);
      console.log(`   Abierta por: ${caja.trabajador_nombre || 'N/A'}`);
      
      // Calcular totales de ese día
      const ventasResult = await pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
          COALESCE(SUM(total), 0) AS total_ventas,
          COUNT(*) as num_ventas
        FROM ventas
        WHERE DATE(fecha) = $1
      `, [caja.fecha]);

      const gastosResult = await pool.query(`
        SELECT COALESCE(SUM(monto), 0) AS total_gastos, COUNT(*) as num_gastos
        FROM gastos
        WHERE fecha = $1 AND metodo_pago = 'efectivo_caja'
      `, [caja.fecha]);

      const ventas = ventasResult.rows[0];
      const gastos = gastosResult.rows[0];
      
      const efectivoEsperado = parseFloat(caja.monto_apertura) + 
                               parseFloat(ventas.total_efectivo) - 
                               parseFloat(gastos.total_gastos);

      console.log(`   Ventas: ${ventas.num_ventas} (Efectivo: S/ ${parseFloat(ventas.total_efectivo).toFixed(2)})`);
      console.log(`   Gastos: ${gastos.num_gastos} (Efectivo caja: S/ ${parseFloat(gastos.total_gastos).toFixed(2)})`);
      console.log(`   💰 Efectivo esperado: S/ ${efectivoEsperado.toFixed(2)}`);
      console.log('');
    }

    console.log('─'.repeat(80));
    console.log('\n📋 OPCIONES:\n');
    console.log('1. Cerrar manualmente desde el sistema (recomendado)');
    console.log('   - Ve a la página de Caja');
    console.log('   - Usa el botón "Cerrar caja anterior" si está disponible');
    console.log('   - O usa la API: POST /api/caja/cierre-fecha\n');
    
    console.log('2. Cerrar automáticamente con este script');
    console.log('   - Edita este archivo y descomenta la sección de cierre automático');
    console.log('   - Establece el monto de cierre correcto\n');

    console.log('⚠️  IMPORTANTE: Este script está en modo de solo lectura.');
    console.log('   Para cerrar automáticamente, edita el archivo y descomenta el código.\n');

    // DESCOMENTAR PARA CERRAR AUTOMÁTICAMENTE
    /*
    const FECHA_A_CERRAR = '2026-03-24'; // Cambiar a la fecha correcta
    const MONTO_CIERRE = 500.00; // Cambiar al monto real contado
    const TRABAJADOR_ID = 1; // ID del trabajador que cierra (admin)

    console.log(`\n🔧 Cerrando caja del ${FECHA_A_CERRAR}...`);
    
    const cajaACerrar = result.rows.find(c => c.fecha === FECHA_A_CERRAR);
    if (!cajaACerrar) {
      console.log(`❌ No se encontró caja abierta para ${FECHA_A_CERRAR}`);
      return;
    }

    // Calcular totales
    const ventasResult = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
        COALESCE(SUM(CASE WHEN metodo_pago IN ('Yape', 'Plin') THEN total ELSE 0 END), 0) AS total_digital,
        COALESCE(SUM(CASE WHEN metodo_pago IN ('Tarjeta', 'Transferencia bancaria') THEN total ELSE 0 END), 0) AS total_tarjeta,
        COALESCE(SUM(total), 0) AS total_ventas
      FROM ventas
      WHERE DATE(fecha) = $1
    `, [FECHA_A_CERRAR]);

    const gastosResult = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) AS total_gastos
      FROM gastos
      WHERE fecha = $1 AND metodo_pago = 'efectivo_caja'
    `, [FECHA_A_CERRAR]);

    const totals = ventasResult.rows[0];
    const totalGastos = parseFloat(gastosResult.rows[0].total_gastos);

    // Actualizar caja
    await pool.query(`
      UPDATE caja
      SET total_efectivo = $1,
          total_digital = $2,
          total_tarjeta = $3,
          total_ventas = $4,
          total_gastos = $5,
          trabajador_cierre_id = $6,
          monto_cierre = $7,
          estado = 'cerrada',
          updated_at = NOW()
      WHERE fecha = $8 AND estado = 'abierta'
    `, [
      totals.total_efectivo,
      totals.total_digital,
      totals.total_tarjeta,
      totals.total_ventas,
      totalGastos,
      TRABAJADOR_ID,
      MONTO_CIERRE,
      FECHA_A_CERRAR
    ]);

    console.log(`✅ Caja del ${FECHA_A_CERRAR} cerrada exitosamente`);
    console.log(`   Monto de cierre: S/ ${MONTO_CIERRE.toFixed(2)}`);
    
    const efectivoEsperado = parseFloat(cajaACerrar.monto_apertura) + 
                             parseFloat(totals.total_efectivo) - 
                             totalGastos;
    const diferencia = MONTO_CIERRE - efectivoEsperado;
    
    if (diferencia === 0) {
      console.log(`   ✅ Caja cuadrada perfectamente`);
    } else if (diferencia < 0) {
      console.log(`   ⚠️  Faltante: S/ ${Math.abs(diferencia).toFixed(2)}`);
    } else {
      console.log(`   ⚠️  Sobrante: S/ ${diferencia.toFixed(2)}`);
    }
    */

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

cerrarCajaAnterior()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
