const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function cerrarTodasCajasAnteriores() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'floreria_system_core',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
  });

  try {
    console.log('🔧 Cerrando todas las cajas anteriores...\n');

    // Obtener ID de admin (asumiendo que es el usuario 1)
    const adminResult = await pool.query(`
      SELECT id FROM usuarios WHERE rol IN ('admin', 'duena') LIMIT 1
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('❌ No se encontró usuario admin');
      return;
    }
    
    const adminId = adminResult.rows[0].id;

    // Buscar cajas abiertas que NO sean de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const result = await pool.query(`
      SELECT * FROM caja
      WHERE estado = 'abierta' AND fecha < $1
      ORDER BY fecha ASC
    `, [hoy]);

    if (result.rows.length === 0) {
      console.log('✅ No hay cajas anteriores abiertas');
      return;
    }

    console.log(`📦 Encontradas ${result.rows.length} cajas anteriores abiertas\n`);

    for (const caja of result.rows) {
      const fecha = caja.fecha;
      const fechaStr = new Date(fecha).toLocaleDateString('es-PE');
      
      console.log(`📅 Procesando caja del ${fechaStr}...`);

      // Calcular totales de ese día
      const ventasResult = await pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
          COALESCE(SUM(CASE WHEN metodo_pago IN ('Yape', 'Plin') THEN total ELSE 0 END), 0) AS total_digital,
          COALESCE(SUM(CASE WHEN metodo_pago IN ('Tarjeta', 'Transferencia bancaria') THEN total ELSE 0 END), 0) AS total_tarjeta,
          COALESCE(SUM(total), 0) AS total_ventas
        FROM ventas
        WHERE DATE(fecha) = $1
      `, [fecha]);

      const gastosResult = await pool.query(`
        SELECT COALESCE(SUM(monto), 0) AS total_gastos
        FROM gastos
        WHERE fecha = $1 AND metodo_pago = 'efectivo_caja'
      `, [fecha]);

      const totals = ventasResult.rows[0];
      const totalGastos = parseFloat(gastosResult.rows[0].total_gastos);

      // Cerrar caja SIN monto_cierre (sin cuadre)
      await pool.query(`
        UPDATE caja
        SET total_efectivo = $1,
            total_digital = $2,
            total_tarjeta = $3,
            total_ventas = $4,
            total_gastos = $5,
            trabajador_cierre_id = $6,
            monto_cierre = NULL,
            estado = 'cerrada',
            updated_at = NOW()
        WHERE id = $7
      `, [
        totals.total_efectivo,
        totals.total_digital,
        totals.total_tarjeta,
        totals.total_ventas,
        totalGastos,
        adminId,
        caja.id
      ]);

      const efectivoEsperado = parseFloat(caja.monto_apertura) + 
                               parseFloat(totals.total_efectivo) - 
                               totalGastos;

      console.log(`   ✅ Cerrada (sin cuadre)`);
      console.log(`   Ventas: S/ ${parseFloat(totals.total_ventas).toFixed(2)}`);
      console.log(`   Efectivo esperado: S/ ${efectivoEsperado.toFixed(2)}`);
      console.log('');
    }

    console.log('─'.repeat(80));
    console.log(`\n✅ ${result.rows.length} cajas cerradas exitosamente`);
    console.log('\n📝 NOTA: Las cajas fueron cerradas SIN cuadre de efectivo.');
    console.log('   Esto significa que se registraron las ventas y gastos,');
    console.log('   pero no se verificó el efectivo físico.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

cerrarTodasCajasAnteriores()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
