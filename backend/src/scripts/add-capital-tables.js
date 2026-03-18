/**
 * Script to add capital system tables to existing database
 * Run with: node backend/src/scripts/add-capital-tables.js
 */

const { query } = require('../config/database');

async function addCapitalTables() {
  console.log('🚀 Agregando tablas del sistema de capital...\n');

  try {
    // 1. Crear tabla configuracion
    console.log('📋 Creando tabla configuracion...');
    await query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla configuracion creada\n');

    // 2. Insertar capital inicial si no existe
    console.log('💰 Insertando capital inicial...');
    await query(`
      INSERT INTO configuracion (clave, valor, descripcion)
      VALUES ('capital_inicial', '10000.00', 'Capital inicial del negocio')
      ON CONFLICT (clave) DO NOTHING;
    `);
    console.log('✅ Capital inicial configurado: S/ 10,000.00\n');

    // 3. Crear índice en configuracion
    await query(`
      CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);
    `);

    // 4. Crear tabla movimientos_capital
    console.log('📋 Creando tabla movimientos_capital...');
    await query(`
      CREATE TABLE IF NOT EXISTS movimientos_capital (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('aporte', 'retiro')),
        monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
        descripcion TEXT NOT NULL,
        fecha DATE NOT NULL,
        trabajador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla movimientos_capital creada\n');

    // 5. Crear índices en movimientos_capital
    console.log('📋 Creando índices...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_movimientos_capital_tipo ON movimientos_capital(tipo);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_movimientos_capital_fecha ON movimientos_capital(fecha);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_movimientos_capital_trabajador ON movimientos_capital(trabajador_id);
    `);
    console.log('✅ Índices creados\n');

    // 6. Crear trigger para updated_at en configuracion
    console.log('📋 Creando triggers...');
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_configuracion_updated_at ON configuracion;
      CREATE TRIGGER update_configuracion_updated_at 
      BEFORE UPDATE ON configuracion
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_movimientos_capital_updated_at ON movimientos_capital;
      CREATE TRIGGER update_movimientos_capital_updated_at 
      BEFORE UPDATE ON movimientos_capital
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Triggers creados\n');

    // 7. Verificar tablas creadas
    console.log('🔍 Verificando tablas...');
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('configuracion', 'movimientos_capital')
      ORDER BY table_name;
    `);

    console.log('✅ Tablas verificadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Sistema de capital instalado correctamente!\n');
    console.log('📊 Puedes verificar el capital inicial con:');
    console.log('   SELECT * FROM configuracion WHERE clave = \'capital_inicial\';\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tablas:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addCapitalTables();
