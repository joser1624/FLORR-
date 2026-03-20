const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'floreria_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addPublicadoColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Agregando columna "publicado" a la tabla productos...');
    
    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'productos' 
      AND column_name = 'publicado'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna "publicado" ya existe');
      return;
    }
    
    // Agregar la columna con valor por defecto TRUE
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN publicado BOOLEAN DEFAULT TRUE NOT NULL
    `);
    
    console.log('✅ Columna "publicado" agregada exitosamente');
    console.log('📝 Todos los productos existentes están publicados por defecto (publicado = true)');
    
    // Mostrar resumen
    const count = await client.query('SELECT COUNT(*) FROM productos WHERE publicado = true');
    console.log(`📊 Total de productos publicados: ${count.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error al agregar columna:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPublicadoColumn()
  .then(() => {
    console.log('\n✨ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error en la migración:', error);
    process.exit(1);
  });
