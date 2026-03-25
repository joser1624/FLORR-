/**
 * Script de prueba para verificar el endpoint de eventos
 */

const API_BASE = 'http://localhost:3000/api';

async function testEventosEndpoint() {
  console.log('🧪 Probando endpoint de eventos...\n');

  try {
    // 1. Obtener todos los eventos
    console.log('1️⃣ GET /api/eventos - Obtener todos los eventos');
    const response = await fetch(`${API_BASE}/eventos`);
    const data = await response.json();
    console.log('✅ Respuesta:', JSON.stringify(data, null, 2));
    console.log(`📊 Total de eventos: ${data.data?.length || 0}\n`);

    // 2. Crear un evento de prueba (requiere autenticación)
    console.log('2️⃣ POST /api/eventos - Crear evento de prueba');
    console.log('⚠️  Este endpoint requiere autenticación (token JWT)');
    console.log('   Para probarlo, usa el panel admin en: http://localhost:5500/pages/admin/eventos.html\n');

    console.log('✅ Prueba completada!');
    console.log('\n📝 Notas:');
    console.log('   - Los eventos se guardan en la base de datos PostgreSQL');
    console.log('   - El campo metadata almacena: imagen, precios y productos en formato JSON');
    console.log('   - Para crear/editar/eliminar eventos necesitas estar autenticado como admin o dueña');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testEventosEndpoint();
