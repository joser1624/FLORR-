const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function corregirStock() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'floreria_system_core',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
  });

  try {
    console.log('🔧 Corrigiendo stock de orquídeas...\n');

    // Obtener el ítem de orquídeas
    const result = await pool.query("SELECT * FROM inventario WHERE nombre ILIKE '%orquidea%'");
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontró el ítem de orquídeas');
      return;
    }

    const orquideas = result.rows[0];
    console.log(`Stock actual de ${orquideas.nombre}: ${orquideas.stock} ${orquideas.unidad}`);
    
    // Preguntar si se debe corregir a 0
    console.log('\n⚠️  Si perdiste TODAS las orquídeas, el stock debería ser 0');
    console.log('   Si solo perdiste algunas, el stock actual (30) puede ser correcto\n');
    
    // Para este script, vamos a establecer el stock en 0 si se confirma
    // En producción, esto debería ser interactivo o recibir un parámetro
    
    const nuevoStock = 0; // Cambiar este valor según sea necesario
    
    console.log(`¿Deseas cambiar el stock de ${orquideas.stock} a ${nuevoStock}?`);
    console.log('Ejecuta este script con el valor correcto en la línea 31\n');
    
    // Descomentar las siguientes líneas para aplicar el cambio:
    /*
    await pool.query(
      'UPDATE inventario SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [nuevoStock, orquideas.id]
    );
    console.log(`✅ Stock actualizado: ${orquideas.nombre} -> ${nuevoStock} ${orquideas.unidad}`);
    */
    
    console.log('⚠️  Script en modo de solo lectura. Edita el archivo para aplicar cambios.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

corregirStock()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
