const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function addMermaFields() {
  // Crear un nuevo pool específico para este script
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'floreria_system_core',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''), // Asegurar que sea string
  });

  try {
    console.log('🔧 Agregando campos de merma a la tabla gastos...');

    // Agregar columnas una por una
    const alterQueries = [
      'ALTER TABLE gastos ADD COLUMN IF NOT EXISTS inventario_id INTEGER REFERENCES inventario(id) ON DELETE SET NULL',
      'ALTER TABLE gastos ADD COLUMN IF NOT EXISTS producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL',
      'ALTER TABLE gastos ADD COLUMN IF NOT EXISTS cantidad INTEGER',
      'ALTER TABLE gastos ADD COLUMN IF NOT EXISTS item_nombre TEXT',
      'ALTER TABLE gastos ADD COLUMN IF NOT EXISTS item_unidad VARCHAR(50)'
    ];

    for (const sql of alterQueries) {
      await pool.query(sql);
      console.log('✅', sql.substring(0, 60) + '...');
    }

    // Crear índices
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gastos_inventario_id ON gastos(inventario_id)');
    console.log('✅ Índice idx_gastos_inventario_id creado');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gastos_producto_id ON gastos(producto_id)');
    console.log('✅ Índice idx_gastos_producto_id creado');

    console.log('\n✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addMermaFields()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
