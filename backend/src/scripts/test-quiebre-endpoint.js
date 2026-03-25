const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testQuiebreEndpoint() {
  try {
    console.log('🧪 Probando endpoint de quiebre de caja...\n');
    
    // 1. Login como admin
    console.log('1️⃣ Iniciando sesión como admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@encantoseternos.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');
    
    // 2. Verificar que hay caja abierta
    console.log('2️⃣ Verificando caja del día...');
    try {
      const cajaResponse = await axios.get(`${API_BASE}/caja/hoy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Caja abierta:', cajaResponse.data.data.estado);
      console.log('   Monto apertura:', cajaResponse.data.data.monto_apertura);
      console.log('   Total ventas:', cajaResponse.data.data.total_ventas || 0);
      console.log('   Total gastos:', cajaResponse.data.data.gastos_total || 0);
      console.log('');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  No hay caja abierta. Abriendo caja...');
        await axios.post(`${API_BASE}/caja/apertura`, 
          { monto_apertura: 100 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Caja abierta con S/ 100.00\n');
      } else {
        throw error;
      }
    }
    
    // 3. Generar quiebre SIN monto físico
    console.log('3️⃣ Generando quiebre sin monto físico...');
    const quiebre1 = await axios.post(`${API_BASE}/caja/quiebre`, 
      { observaciones: 'Prueba de quiebre sin conteo físico' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Quiebre generado:');
    console.log('   ID:', quiebre1.data.data.quiebre.id);
    console.log('   Efectivo esperado:', quiebre1.data.data.resumen.efectivo_esperado);
    console.log('   Mensaje:', quiebre1.data.data.resumen.mensaje);
    console.log('');
    
    // 4. Generar quiebre CON monto físico (cuadrado)
    console.log('4️⃣ Generando quiebre con monto físico (cuadrado)...');
    const efectivoEsperado = quiebre1.data.data.resumen.efectivo_esperado;
    const quiebre2 = await axios.post(`${API_BASE}/caja/quiebre`, 
      { 
        monto_fisico: efectivoEsperado,
        observaciones: 'Prueba de quiebre cuadrado' 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Quiebre generado:');
    console.log('   ID:', quiebre2.data.data.quiebre.id);
    console.log('   Efectivo esperado:', quiebre2.data.data.resumen.efectivo_esperado);
    console.log('   Monto físico:', quiebre2.data.data.resumen.monto_fisico);
    console.log('   Diferencia:', quiebre2.data.data.resumen.diferencia);
    console.log('   Mensaje:', quiebre2.data.data.resumen.mensaje);
    console.log('');
    
    // 5. Generar quiebre CON monto físico (faltante)
    console.log('5️⃣ Generando quiebre con faltante...');
    const quiebre3 = await axios.post(`${API_BASE}/caja/quiebre`, 
      { 
        monto_fisico: efectivoEsperado - 10,
        observaciones: 'Prueba de quiebre con faltante' 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Quiebre generado:');
    console.log('   ID:', quiebre3.data.data.quiebre.id);
    console.log('   Diferencia:', quiebre3.data.data.resumen.diferencia);
    console.log('   Mensaje:', quiebre3.data.data.resumen.mensaje);
    console.log('');
    
    // 6. Obtener historial de quiebres
    console.log('6️⃣ Obteniendo historial de quiebres del día...');
    const historialResponse = await axios.get(`${API_BASE}/caja/quiebres`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Se encontraron ${historialResponse.data.data.length} quiebres:`);
    historialResponse.data.data.forEach((q, i) => {
      console.log(`   ${i + 1}. ID: ${q.id} - ${q.observaciones || 'Sin observaciones'}`);
      console.log(`      Diferencia: ${q.diferencia}`);
    });
    
    console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Mensaje:', error.response.data.mensaje || error.response.data.error);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
}

testQuiebreEndpoint();
