const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'floreria_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkPublicado() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando valores de publicado...\n');
    
    const result = await client.query(`
      SELECT id, nombre, publicado, activo 
      FROM productos 
      ORDER BY id 
      LIMIT 15
    `);
    
    console.log('📊 Productos en la base de datos:\n');
    result.rows.forEach(p => {
      const pub = p.publicado ? '✅ Visible' : '🚫 Oculto';
      const act = p.activo ? 'Activo' : 'Inactivo';
      console.log(`ID ${p.id}: ${p.nombre}`);
      console.log(`   Publicado: ${pub} | Estado: ${act}\n`);
    });
    
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE publicado = true) as publicados,
        COUNT(*) FILTER (WHERE publicado = false) as ocultos
      FROM productos
    `);
    
    console.log('📈 Resumen:');
    console.log(`   Total: ${stats.rows[0].total}`);
    console.log(`   Publicados: ${stats.rows[0].publicados}`);
    console.log(`   Ocultos: ${stats.rows[0].ocultos}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPublicado();
