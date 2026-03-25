const { query } = require('./src/config/database');

async function checkCajas() {
  try {
    // Contar cajas
    const result = await query('SELECT COUNT(*) as total FROM caja', []);
    console.log(`\n📊 Total de cajas en la base de datos: ${result.rows[0].total}\n`);
    
    // Mostrar últimas 5 cajas
    const cajas = await query(`
      SELECT c.id, c.fecha, c.estado, c.monto_apertura, c.total_ventas,
             u1.nombre as apertura_por, u2.nombre as cierre_por
      FROM caja c
      LEFT JOIN usuarios u1 ON c.trabajador_apertura_id = u1.id
      LEFT JOIN usuarios u2 ON c.trabajador_cierre_id = u2.id
      ORDER BY c.fecha DESC
      LIMIT 5
    `, []);
    
    if (cajas.rows.length > 0) {
      console.log('📋 Últimas 5 cajas:\n');
      cajas.rows.forEach(c => {
        console.log(`  ID: ${c.id}`);
        console.log(`  Fecha: ${c.fecha}`);
        console.log(`  Estado: ${c.estado}`);
        console.log(`  Apertura: ${c.monto_apertura} (por ${c.apertura_por || 'N/A'})`);
        console.log(`  Total ventas: ${c.total_ventas || 'N/A'}`);
        console.log(`  Cerrado por: ${c.cierre_por || 'N/A'}`);
        console.log('  ---');
      });
    } else {
      console.log('⚠️  No hay cajas registradas en la base de datos\n');
      console.log('💡 Esto es normal si es la primera vez que usas el sistema.\n');
      console.log('   Para crear datos de prueba:');
      console.log('   1. Abre caja desde la interfaz');
      console.log('   2. Registra algunas ventas');
      console.log('   3. Cierra la caja\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCajas();
