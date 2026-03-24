/**
 * Script para instalar la tabla de auditoría de cierres anulados
 * Ejecutar: node backend/install-anular-cierre.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'floreria_system_core',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function instalarTabla() {
  const client = await pool.connect();
  
  try {
    console.log('📦 Instalando tabla de auditoría de cierres anulados...\n');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'caja_cierre_anulado.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await client.query(sql);
    
    console.log('✅ Tabla caja_cierre_anulado creada correctamente');
    console.log('✅ Índices creados correctamente');
    console.log('\n🎉 Instalación completada exitosamente\n');
    
    // Verificar que la tabla existe
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'caja_cierre_anulado'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error al instalar la tabla:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
instalarTabla()
  .then(() => {
    console.log('\n✨ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
