const { query } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function checkAndCreateQuiebreTable() {
  try {
    console.log('🔍 Verificando tabla caja_quiebre...');
    
    // Verificar si la tabla existe
    const checkResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'caja_quiebre'
      );
    `);
    
    const exists = checkResult.rows[0].exists;
    
    if (exists) {
      console.log('✅ La tabla caja_quiebre ya existe');
      
      // Mostrar estructura de la tabla
      const structureResult = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'caja_quiebre'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estructura de la tabla:');
      structureResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      // Contar registros
      const countResult = await query('SELECT COUNT(*) FROM caja_quiebre');
      console.log(`\n📊 Registros en la tabla: ${countResult.rows[0].count}`);
      
    } else {
      console.log('⚠️  La tabla caja_quiebre NO existe. Creándola...');
      
      // Leer el archivo SQL
      const sqlPath = path.join(__dirname, '../../../database/quiebre_caja.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Ejecutar el SQL
      await query(sql);
      
      console.log('✅ Tabla caja_quiebre creada correctamente');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAndCreateQuiebreTable();
