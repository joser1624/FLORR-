const { query } = require('../config/database');
const path = require('path');

// Cargar variables de entorno desde el archivo .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Script para agregar campos de merma/pérdida a la tabla gastos
 * Esto permite rastrear qué inventario o producto se perdió
 */
async function addMermaFields() {
  try {
    console.log('🔧 Agregando campos de merma a la tabla gastos...');
    console.log('DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ? '***' : 'NOT SET'
    });

    // Agregar columnas para rastrear inventario y productos perdidos
    await query(`
      ALTER TABLE gastos 
      ADD COLUMN IF NOT EXISTS inventario_id INTEGER REFERENCES inventario(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS cantidad INTEGER,
      ADD COLUMN IF NOT EXISTS item_nombre TEXT,
      ADD COLUMN IF NOT EXISTS item_unidad VARCHAR(50);
    `);

    console.log('✅ Campos agregados exitosamente:');
    console.log('   - inventario_id: referencia al ítem de inventario perdido');
    console.log('   - producto_id: referencia al producto perdido');
    console.log('   - cantidad: cantidad perdida');
    console.log('   - item_nombre: nombre del ítem (guardado para historial)');
    console.log('   - item_unidad: unidad del ítem (guardado para historial)');

    // Crear índices para mejorar el rendimiento
    await query(`
      CREATE INDEX IF NOT EXISTS idx_gastos_inventario_id ON gastos(inventario_id);
      CREATE INDEX IF NOT EXISTS idx_gastos_producto_id ON gastos(producto_id);
    `);

    console.log('✅ Índices creados');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar campos:', error);
    process.exit(1);
  }
}

addMermaFields();
