const { query } = require('../config/database');

async function checkDatabase() {
  try {
    // Check if table exists
    const tables = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'usuarios'
    `);
    
    console.log('Tabla usuarios existe:', tables.rows.length > 0);
    
    if (tables.rows.length > 0) {
      // Check if there are users
      const users = await query('SELECT id, nombre, email, rol, activo FROM usuarios LIMIT 5');
      console.log('Usuarios encontrados:', users.rows.length);
      console.log('Usuarios:', JSON.stringify(users.rows, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkDatabase();