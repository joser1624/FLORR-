const { query } = require('../config/database');

async function createSolicitudesGastosTable() {
  try {
    console.log('📋 Creando tabla solicitudes_gastos...');
    
    // Crear tabla
    await query(`
      CREATE TABLE IF NOT EXISTS solicitudes_gastos (
        id SERIAL PRIMARY KEY,
        trabajador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        caja_id INTEGER NOT NULL REFERENCES caja(id) ON DELETE CASCADE,
        monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
        categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('flores', 'transporte', 'materiales', 'mantenimiento', 'otros')),
        descripcion TEXT NOT NULL,
        empresa VARCHAR(255) NOT NULL,
        numero_comprobante VARCHAR(100) NOT NULL,
        fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_aprobacion TIMESTAMP,
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
        comentario_rechazo TEXT,
        aprobado_por_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `, []);
    
    console.log('✅ Tabla solicitudes_gastos creada');
    
    // Crear índices
    await query('CREATE INDEX IF NOT EXISTS idx_solicitudes_gastos_trabajador ON solicitudes_gastos(trabajador_id);', []);
    await query('CREATE INDEX IF NOT EXISTS idx_solicitudes_gastos_caja ON solicitudes_gastos(caja_id);', []);
    await query('CREATE INDEX IF NOT EXISTS idx_solicitudes_gastos_estado ON solicitudes_gastos(estado);', []);
    await query('CREATE INDEX IF NOT EXISTS idx_solicitudes_gastos_fecha ON solicitudes_gastos(fecha_solicitud);', []);
    
    console.log('✅ Índices creados');
    
    // Crear función para trigger
    await query(`
      CREATE OR REPLACE FUNCTION update_solicitudes_gastos_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `, []);
    
    console.log('✅ Función de trigger creada');
    
    // Crear trigger
    await query(`
      DROP TRIGGER IF EXISTS trigger_update_solicitudes_gastos_updated_at ON solicitudes_gastos;
      CREATE TRIGGER trigger_update_solicitudes_gastos_updated_at
        BEFORE UPDATE ON solicitudes_gastos
        FOR EACH ROW
        EXECUTE FUNCTION update_solicitudes_gastos_updated_at();
    `, []);
    
    console.log('✅ Trigger creado');
    console.log('');
    console.log('✅ Sistema de solicitudes de gastos listo para usar');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tabla:', error.message);
    process.exit(1);
  }
}

createSolicitudesGastosTable();
