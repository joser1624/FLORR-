const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function verificarArreglos() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'floreria_system_core',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
  });

  try {
    console.log('🔍 Verificando arreglos en la base de datos...\n');

    // Obtener todos los arreglos
    const result = await pool.query(`
      SELECT * FROM arreglos 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('❌ No hay arreglos en la base de datos');
      return;
    }

    console.log(`✅ Encontrados ${result.rows.length} arreglo(s):\n`);
    console.log('─'.repeat(80));

    for (const arreglo of result.rows) {
      console.log(`\n📦 ID: ${arreglo.id}`);
      console.log(`   Nombre: ${arreglo.nombre}`);
      console.log(`   Margen: ${arreglo.margen}%`);
      console.log(`   Creado: ${new Date(arreglo.created_at).toLocaleString('es-PE')}`);

      // Obtener items del arreglo
      const itemsResult = await pool.query(`
        SELECT ai.*, i.nombre as item_nombre, i.unidad
        FROM arreglos_inventario ai
        JOIN inventario i ON ai.inventario_id = i.id
        WHERE ai.arreglo_id = $1
      `, [arreglo.id]);

      if (itemsResult.rows.length > 0) {
        console.log(`   Items (${itemsResult.rows.length}):`);
        itemsResult.rows.forEach(item => {
          console.log(`     - ${item.item_nombre}: ${item.cantidad} ${item.unidad}`);
        });
      } else {
        console.log(`   ⚠️  Sin items asociados`);
      }
    }

    console.log('\n' + '─'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

verificarArreglos()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
