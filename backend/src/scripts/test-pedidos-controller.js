/**
 * Test script for pedidos controller and routes
 * Task 9.2: Verify orders controller and routes implementation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testPedidoId = null;

// Test data
const testPedido = {
  cliente_nombre: 'María García',
  cliente_telefono: '987654321',
  direccion: 'Av. Principal 123',
  fecha_entrega: '2024-02-14',
  descripcion: 'Ramo de rosas rojas grande',
  total: 150.00,
  metodo_pago: 'Efectivo'
};

async function login() {
  console.log('\n🔐 Testing authentication...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@floreria.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreatePedido() {
  console.log('\n📝 Testing POST /api/pedidos...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/pedidos`,
      testPedido,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    testPedidoId = response.data.pedido.id;
    console.log('✅ Pedido created successfully');
    console.log(`   ID: ${testPedidoId}`);
    console.log(`   Cliente: ${response.data.pedido.cliente_nombre}`);
    console.log(`   Estado: ${response.data.pedido.estado}`);
    console.log(`   Fecha entrega: ${response.data.pedido.fecha_entrega}`);
    return true;
  } catch (error) {
    console.error('❌ Create pedido failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAllPedidos() {
  console.log('\n📋 Testing GET /api/pedidos...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/pedidos`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Get all pedidos successful');
    console.log(`   Total pedidos: ${response.data.pedidos.length}`);
    return true;
  } catch (error) {
    console.error('❌ Get all pedidos failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPedidoById() {
  console.log('\n🔍 Testing GET /api/pedidos/:id...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/pedidos/${testPedidoId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Get pedido by ID successful');
    console.log(`   ID: ${response.data.pedido.id}`);
    console.log(`   Cliente: ${response.data.pedido.cliente_nombre}`);
    console.log(`   Estado: ${response.data.pedido.estado}`);
    return true;
  } catch (error) {
    console.error('❌ Get pedido by ID failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPedidosByCliente() {
  console.log('\n📞 Testing GET /api/pedidos/cliente?telefono=...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/pedidos/cliente?telefono=${testPedido.cliente_telefono}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Get pedidos by cliente successful');
    console.log(`   Total pedidos for ${testPedido.cliente_telefono}: ${response.data.pedidos.length}`);
    if (response.data.pedidos.length > 0) {
      console.log(`   First pedido: ${response.data.pedidos[0].cliente_nombre}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Get pedidos by cliente failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdatePedido() {
  console.log('\n✏️  Testing PUT /api/pedidos/:id...');
  try {
    const response = await axios.put(
      `${BASE_URL}/api/pedidos/${testPedidoId}`,
      {
        estado: 'en preparación',
        descripcion: 'Ramo de rosas rojas grande - ACTUALIZADO'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Update pedido successful');
    console.log(`   New estado: ${response.data.pedido.estado}`);
    console.log(`   New descripcion: ${response.data.pedido.descripcion}`);
    return true;
  } catch (error) {
    console.error('❌ Update pedido failed:', error.response?.data || error.message);
    return false;
  }
}

async function testFilterByEstado() {
  console.log('\n🔎 Testing GET /api/pedidos?estado=pendiente...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/pedidos?estado=pendiente`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Filter by estado successful');
    console.log(`   Pedidos pendientes: ${response.data.pedidos.length}`);
    return true;
  } catch (error) {
    console.error('❌ Filter by estado failed:', error.response?.data || error.message);
    return false;
  }
}

async function testValidationErrors() {
  console.log('\n⚠️  Testing validation errors...');
  
  // Test missing required fields
  try {
    await axios.post(
      `${BASE_URL}/api/pedidos`,
      {
        cliente_nombre: '',
        cliente_telefono: '987654321'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('❌ Should have failed with validation error');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation error handled correctly');
      console.log(`   Error: ${error.response.data.mensaje}`);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testInvalidEstado() {
  console.log('\n⚠️  Testing invalid estado update...');
  
  try {
    await axios.put(
      `${BASE_URL}/api/pedidos/${testPedidoId}`,
      {
        estado: 'estado_invalido'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('❌ Should have failed with validation error');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid estado error handled correctly');
      console.log(`   Error: ${error.response.data.mensaje}`);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testDeletePedido() {
  console.log('\n🗑️  Testing DELETE /api/pedidos/:id...');
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/pedidos/${testPedidoId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Delete pedido successful');
    console.log(`   Message: ${response.data.mensaje}`);
    return true;
  } catch (error) {
    console.error('❌ Delete pedido failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAuthorizationEmpleado() {
  console.log('\n🔒 Testing authorization (empleado role)...');
  
  // Login as empleado
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'empleado@floreria.com',
      password: 'empleado123'
    });
    
    const empleadoToken = loginResponse.data.token;
    
    // Try to create pedido as empleado (should succeed)
    const response = await axios.post(
      `${BASE_URL}/api/pedidos`,
      testPedido,
      {
        headers: { Authorization: `Bearer ${empleadoToken}` }
      }
    );
    
    console.log('✅ Empleado can create pedidos');
    
    // Clean up
    await axios.delete(
      `${BASE_URL}/api/pedidos/${response.data.pedido.id}`,
      {
        headers: { Authorization: `Bearer ${empleadoToken}` }
      }
    );
    
    return true;
  } catch (error) {
    console.error('❌ Authorization test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   🧪 Testing Pedidos Controller and Routes (Task 9.2)    ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const results = {
    passed: 0,
    failed: 0
  };

  // Run tests
  const tests = [
    { name: 'Login', fn: login },
    { name: 'Create Pedido', fn: testCreatePedido },
    { name: 'Get All Pedidos', fn: testGetAllPedidos },
    { name: 'Get Pedido by ID', fn: testGetPedidoById },
    { name: 'Get Pedidos by Cliente', fn: testGetPedidosByCliente },
    { name: 'Update Pedido', fn: testUpdatePedido },
    { name: 'Filter by Estado', fn: testFilterByEstado },
    { name: 'Validation Errors', fn: testValidationErrors },
    { name: 'Invalid Estado', fn: testInvalidEstado },
    { name: 'Authorization (Empleado)', fn: testAuthorizationEmpleado },
    { name: 'Delete Pedido', fn: testDeletePedido }
  ];

  for (const test of tests) {
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                      Test Summary                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Task 9.2 implementation is complete.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Run tests
runTests().catch(console.error);
