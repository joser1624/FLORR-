const { query } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createSolicitudesGastosTable() {
  try {
    console.log('📋 Creando tabla solicitudes_gastos...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../../database/solicitudes_gastos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await query(sql, []);
    
    console.log('✅ Tabla solicitudes_gastos creada correctamente');
    console.log('');
    console.log('Estructura de la tabla:');
    console.log('- id: SERIAL PRIMARY KEY');
    console.log('- trabajador_id: INTEGER (usuario que solicita)');
    console.log('- caja_id: INTEGER (caja del día)');
    console.log('- monto: DECIMAL(10, 2)');
    console.log('- categoria: VARCHAR(50) (flores, transporte, materiales, mantenimiento, otros)');
    console.log('- descripcion: TEXT');
    console.log('- empresa: VARCHAR(255)');
    console.log('- numero_comprobante: VARCHAR(100)');
    console.log('- fecha_solicitud: TIMESTAMP');
    console.log('- fecha_aprobacion: TIMESTAMP');
    console.log('- estado: VARCHAR(20) (pendiente, aprobada, rechazada)');
    console.log('- comentario_rechazo: TEXT');
    console.log('- aprobado_por_id: INTEGER (admin que aprueba/rechaza)');
    console.log('');
    console.log('✅ Sistema de solicitudes de gastos listo para usar');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tabla:', error);
    process.exit(1);
  }
}

createSolicitudesGastosTable();
