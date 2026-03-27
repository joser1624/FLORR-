const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function addMetodoPago() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'floreria_system_core',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
  });

  try {
    console.log('🔧 Agregando método de pago a gastos...\n');

    // Agregar columna
    await pool.query(`
      ALTER TABLE gastos 
      ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo_caja'
    `);
    console.log('✅ Columna metodo_pago agregada');

    // Actualizar mermas para que no afecten caja
    const result = await pool.query(`
      UPDATE gastos 
      SET metodo_pago = 'no_aplica' 
      WHERE categoria = 'merma' AND (metodo_pago = 'efectivo_caja' OR metodo_pago IS NULL)
      RETURNING id
    `);
    console.log(`✅ ${result.rowCount} gastos de merma actualizados a 'no_aplica'`);

    // Crear índice
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gastos_metodo_pago ON gastos(metodo_pago)');
    console.log('✅ Índice creado');

    console.log('\n✅ Migración completada exitosamente');
    console.log('\nMétodos de pago disponibles:');
    console.log('  - efectivo_caja: Sale del efectivo de la caja (afecta cuadre)');
    console.log('  - transferencia: Pagado por transferencia (no afecta caja)');
    console.log('  - tarjeta: Pagado con tarjeta (no afecta caja)');
    console.log('  - no_aplica: Para merma/pérdida (no es pago real)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addMetodoPago()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
