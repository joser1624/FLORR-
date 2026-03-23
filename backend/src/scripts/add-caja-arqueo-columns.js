/**
 * Script de migración: Agregar columnas de arqueo a tabla caja
 * Ejecutar: node backend/src/scripts/add-caja-arqueo-columns.js
 */

const { query } = require('../config/database');

async function migrate() {
  console.log('🔧 Agregando columnas de arqueo a tabla caja...');

  try {
    // Verificar si las columnas ya existen
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'caja' 
      AND column_name IN ('monto_cierre_fisico', 'diferencia_cierre', 'observaciones_diferencia')
    `);

    if (checkColumns.rows.length > 0) {
      console.log('✅ Las columnas ya existen');
      return;
    }

    // Agregar columnas
    await query(`
      ALTER TABLE caja 
      ADD COLUMN IF NOT EXISTS monto_cierre_fisico DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS diferencia_cierre DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS observaciones_diferencia TEXT
    `);

    console.log('✅ Columnas agregadas exitosamente:');
    console.log('   - monto_cierre_fisico: Monto físico contado al cerrar');
    console.log('   - diferencia_cierre: Diferencia entre esperado y contado');
    console.log('   - observaciones_diferencia: Explicación de diferencias');

    console.log('\n✨ Migración completada');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

migrate();
