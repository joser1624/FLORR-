/**
 * Script to create admin user
 * Run with: node backend/src/scripts/create-admin-user.js
 */

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('👤 Creando usuario administrador...\n');

  try {
    // Verificar si ya existe un admin
    const existing = await query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'admin'",
      []
    );

    if (existing.rows.length > 0) {
      console.log('✅ Ya existe un usuario administrador:');
      existing.rows.forEach(user => {
        console.log(`   - ${user.nombre} (${user.email})`);
      });
      console.log('\n💡 Puedes usar estas credenciales para iniciar sesión.');
      return;
    }

    // Crear hash de la contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario admin
    const result = await query(
      `INSERT INTO usuarios (nombre, email, password, telefono, cargo, rol, fecha_ingreso, activo)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, true)
       RETURNING id, nombre, email, rol`,
      ['Administrador', 'admin@encantoseternos.com', hashedPassword, '999999999', 'Administrador', 'admin']
    );

    const admin = result.rows[0];
    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📋 Datos del usuario:');
    console.log(`   Nombre: ${admin.nombre}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   Rol: ${admin.rol}`);
    console.log(`   ID: ${admin.id}\n`);

    console.log('💡 Usa estas credenciales para iniciar sesión en el dashboard.');

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
