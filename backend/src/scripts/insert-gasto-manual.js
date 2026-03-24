const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'floreria_system_core',
  user: 'postgres',
  password: 'betojose243'
});

async function insertGasto() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Insertando gasto manualmente...\n');
    
    // Insertar el gasto de la solicitud aprobada
    const result = await client.query(`
      INSERT INTO gastos (descripcion, categoria, monto, fecha)
      VALUES ($1, $2, $3, CURRENT_DATE)
      RETURNING *
    `, [
      'le di a una viejita xd (viejita.com - G123VDSA)',
      'otros',
      50.00
    ]);
    
    console.log('✅ Gasto insertado:');
    console.table([{
      id: result.rows[0].id,
      descripcion: result.rows[0].descripcion,
      categoria: result.rows[0].categoria,
      monto: result.rows[0].monto,
      fecha: result.rows[0].fecha
    }]);
    
    // Verificar total de gastos de hoy
    const totalResult = await client.query('SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE fecha = CURRENT_DATE');
    console.log(`\n💰 Total gastos de hoy: S/ ${totalResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

insertGasto();
