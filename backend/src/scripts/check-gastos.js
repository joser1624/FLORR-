const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'floreria_system_core',
  user: 'postgres',
  password: 'betojose243'
});

async function checkGastos() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Verificando gastos...\n');
    
    // Ver todos los gastos
    const result = await client.query('SELECT * FROM gastos ORDER BY created_at DESC LIMIT 5');
    
    console.log('Últimos 5 gastos:');
    console.table(result.rows.map(g => ({
      id: g.id,
      descripcion: g.descripcion.substring(0, 50),
      categoria: g.categoria,
      monto: g.monto,
      fecha: g.fecha,
      created_at: g.created_at
    })));
    
    // Ver gastos de hoy
    const hoyResult = await client.query('SELECT * FROM gastos WHERE fecha = CURRENT_DATE');
    console.log(`\n📅 Gastos de hoy (${new Date().toISOString().split('T')[0]}): ${hoyResult.rows.length}`);
    
    if (hoyResult.rows.length > 0) {
      console.table(hoyResult.rows.map(g => ({
        id: g.id,
        descripcion: g.descripcion.substring(0, 50),
        monto: g.monto,
        fecha: g.fecha
      })));
    }
    
    // Ver total de gastos de hoy
    const totalResult = await client.query('SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE fecha = CURRENT_DATE');
    console.log(`\n💰 Total gastos de hoy: S/ ${totalResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkGastos();
