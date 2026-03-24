/**
 * Script para agregar campo metadata a la tabla eventos
 * Este campo almacenará información adicional como imagen, precios y productos
 */

const { query } = require('../config/database');

async function addMetadataColumn() {
  try {
    console.log('🔧 Agregando campo metadata a la tabla eventos...');

    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'eventos' 
      AND column_name = 'metadata'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna metadata ya existe en la tabla eventos');
      return;
    }

    // Agregar la columna metadata
    await query(`
      ALTER TABLE eventos 
      ADD COLUMN metadata JSONB
    `);

    console.log('✅ Campo metadata agregado correctamente a la tabla eventos');
    console.log('📝 Ahora puedes guardar información adicional en formato JSON');

  } catch (error) {
    console.error('❌ Error al agregar campo metadata:', error);
    throw error;
  } finally {
    process.exit();
  }
}

// Ejecutar
addMetadataColumn();
