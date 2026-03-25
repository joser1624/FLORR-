const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'floreria_system_core',
  user: 'postgres',
  password: 'betojose243'
});

async function checkSolicitudes() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Verificando solicitudes...\n');
    
    // Ver todas las solicitudes
    const result = await client.query('SELECT * FROM solicitudes_gastos ORDER BY created_at DESC');
    
    console.log('Todas las solicitudes:');
    console.table(result.rows.map(s => ({
      id: s.id,
      descripcion: s.descripcion.substring(0, 30),
      monto: s.monto,
      estado: s.estado,
      fecha_solicitud: s.fecha_solicitud,
      fecha_aprobacion: s.fecha_aprobacion
    })));
    
    // Ver solicitudes aprobadas
    const aprobadasResult = await client.query("SELECT * FROM solicitudes_gastos WHERE estado = 'aprobada'");
    console.log(`\n✅ Solicitudes aprobadas: ${aprobadasResult.rows.length}`);
    
    if (aprobadasResult.rows.length > 0) {
      console.table(aprobadasResult.rows.map(s => ({
        id: s.id,
        monto: s.monto,
        fecha_solicitud: s.fecha_solicitud,
        fecha_aprobacion: s.fecha_aprobacion
      })));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSolicitudes();
