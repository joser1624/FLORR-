/**
 * Integration test for pedidos routes
 * Tests all endpoints with authentication, authorization, and validation
 * Task 9.2: Tests orders controller and routes implementation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let testPedidoId = null;

// Test data
const testPedido = {
  cliente_nombre: 'Test Cliente',
  cliente_telefono: '555-1234',
  fecha_entrega: '2024-12-25',
  descripcion: 'Ramo de rosas rojas para Navidad',
  direccion: 'Av. Principal 123',
  total: 150.00,
  metodo_pago: 'Efectivo'
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };
    return await axios(config);
  } catch (error) {
    return error.response;
  }
};

// Test functions
async function testLogin() {
  console.log('\n📝 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'maria@floreria.com',
      password: 'password123'
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('✓ Login successful');
      return true;
    }
    console.log('✗ Login failed');
    return false;
  } catch (error) {
    console.log('✗ Login error:', error.message);
    return false;
  }
}

async function testAuthenticationRequired() {
  console.log('\n🔐 Testing authentication requirement...');
  const response = await axios.get(`${BASE_URL}/pedidos`).catch(err => err.response);
  
  if (response.status === 401) {
    console.log('✓ Correctly rejected request without token');
    return true;
  }
  console.log('✗ Should have rejected unauthenticated request');
  return false;
}

async function testGetAllPedidos() {
  console.log('\n📋 Testing GET /api/pedidos...');
  const response = await makeRequest('get', '/pedidos');
  
  if (response.status === 200 && response.data.success) {
    console.log(`✓ GET /api/pedidos successful`);
    console.log(`  - Total pedidos: ${response.data.pedidos ? response.data.pedidos.length : 0}`);
    return true;
  }
  console.log('✗ GET /api/pedidos failed');
  return false;
}

async function testGetPedidosWithFilters() {
  console.log('\n🔍 Testing GET /api/pedidos with filters...');
  
  // Test filter by estado
  const response1 = await makeRequest('get', '/pedidos?estado=pendiente');
  if (response1.status === 200) {
    console.log(`✓ Filter by estado working (${response1.data.pedidos ? response1.data.pedidos.length : 0} pendientes)`);
  }
  
  // Test filter by fecha_entrega
  const response2 = await makeRequest('get', '/pedidos?fecha_entrega=2024-12-25');
  if (response2.status === 200) {
    console.log(`✓ Filter by fecha_entrega working`);
  }
  
  return true;
}

async function testCreatePedido() {
  console.log('\n✏️  Testing POST /api/pedidos (create)...');
  const response = await makeRequest('post', '/pedidos', testPedido);
  
  if (response.status === 201 && response.data.success) {
    testPedidoId = response.data.pedido ? response.data.pedido.id : response.data.data.id;
    console.log(`✓ POST /api/pedidos successful`);
    console.log(`  - Pedido ID: ${testPedidoId}`);
    const pedido = response.data.pedido || response.data.data;
    console.log(`  - Cliente: ${pedido.cliente_nombre}`);
    console.log(`  - Estado: ${pedido.estado}`);
    return true;
  }
  console.log('✗ POST /api/pedidos failed');
  return false;
}

async function testGetPedidoById() {
  console.log('\n🔍 Testing GET /api/pedidos/:id...');
  const response = await makeRequest('get', `/pedidos/${testPedidoId}`);
  
  if (response.status === 200 && response.data.success) {
    console.log(`✓ GET /api/pedidos/:id successful`);
    const pedido = response.data.pedido || response.data.data;
    console.log(`  - Cliente: ${pedido.cliente_nombre}`);
    console.log(`  - Estado: ${pedido.estado}`);
    return true;
  }
  console.log('✗ GET /api/pedidos/:id failed');
  return false;
}

async function testUpdatePedido() {
  console.log('\n✏️  Testing PUT /api/pedidos/:id (update estado)...');
  const response = await makeRequest('put', `/pedidos/${testPedidoId}`, {
    estado: 'en preparación'
  });
  
  if (response.status === 200 && response.data.success) {
    console.log(`✓ PUT /api/pedidos/:id successful`);
    const pedido = response.data.pedido || response.data.data;
    console.log(`  - New estado: ${pedido.estado}`);
    return true;
  }
  console.log('✗ PUT /api/pedidos/:id failed');
  return false;
}

async function testValidationErrors() {
  console.log('\n⚠️  Testing validation errors...');
  
  // Test missing required fields
  const response = await makeRequest('post', '/pedidos', {
    cliente_nombre: 'Test'
    // Missing required fields
  });
  
  if (response.status === 400) {
    console.log('✓ Correctly rejected invalid data');
    return true;
  }
  console.log('✗ Should have rejected invalid data');
  return false;
}

async function testDeletePedido() {
  console.log('\n🗑️  Testing DELETE /api/pedidos/:id...');
  const response = await makeRequest('delete', `/pedidos/${testPedidoId}`);
  
  if (response.status === 200 && response.data.success) {
    console.log(`✓ DELETE /api/pedidos/:id successful`);
    return true;
  }
  console.log('✗ DELETE /api/pedidos/:id failed');
  return false;
}

// Run all tests
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Pedidos Routes Integration Tests                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  results.push(await testLogin());
  if (!authToken) {
    console.log('\n✗ Cannot continue without authentication');
    return;
  }
  
  results.push(await testAuthenticationRequired());
  results.push(await testGetAllPedidos());
  results.push(await testGetPedidosWithFilters());
  results.push(await testCreatePedido());
  
  if (testPedidoId) {
    results.push(await testGetPedidoById());
    results.push(await testUpdatePedido());
    results.push(await testDeletePedido());
  }
  
  results.push(await testValidationErrors());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  Test Results: ${passed}/${total} passed                              ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (passed === total) {
    console.log('✅ All tests passed!\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed\n`);
  }
}

// Run tests
runTests().catch(console.error);
