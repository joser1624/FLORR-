/**
 * Script to test capital endpoint
 * Run with: node backend/src/scripts/test-capital-endpoint.js
 */

const fetch = require('node-fetch');

async function testCapitalEndpoint() {
  console.log('🧪 Probando endpoint de capital...\n');

  try {
    // 1. Login para obtener token
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@encantoseternos.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Error al iniciar sesión');
      const error = await loginResponse.json();
      console.error(error);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;
    console.log('✅ Login exitoso');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('Usuario:', JSON.stringify(user, null, 2), '\n');

    // 2. Obtener capital actual
    console.log('2️⃣ Obteniendo capital actual...');
    const capitalResponse = await fetch('http://localhost:3000/api/capital', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!capitalResponse.ok) {
      console.error('❌ Error al obtener capital');
      const error = await capitalResponse.json();
      console.error(error);
      return;
    }

    const capitalData = await capitalResponse.json();
    console.log('✅ Capital obtenido exitosamente\n');
    console.log('📊 Datos del capital:');
    console.log(JSON.stringify(capitalData, null, 2));

    console.log('\n✨ Prueba completada exitosamente!');
    console.log('\n💡 Usa estos comandos en la consola del navegador:');
    console.log(`localStorage.setItem('ee_token', '${token}');`);
    console.log(`localStorage.setItem('ee_user', '${JSON.stringify(JSON.stringify(user))}');`);
    console.log(`location.reload();`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error(error);
  }
}

testCapitalEndpoint();
