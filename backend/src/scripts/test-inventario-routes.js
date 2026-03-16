/**
 * Test script for inventory routes
 * Tests all CRUD operations with authentication
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testItemId = null;

// Test credentials (from seed data)
const credentials = {
  email: 'maria@floreria.com',
  password: 'password123'
};

async function login() {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAll() {
  console.log('\n📋 Testing GET /api/inventario...');
  try {
    const response = await axios.get(`${BASE_URL}/api/inventario`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ GET all items successful');
    console.log('Items count:', response.data.data.length);
    return true;
  } catch (error) {
    console.error('❌ GET all failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAllWithFilters() {
  console.log('\n🔍 Testing GET /api/inventario with filters...');
  try {
    // Test tipo filter
    const response1 = await axios.get(`${BASE_URL}/api/inventario?tipo=flores`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ GET with tipo=flores successful');
    console.log('Items count:', response1.data.data.length);

    // Test stock_bajo filter
    const response2 = await axios.get(`${BASE_URL}/api/inventario?stock_bajo=true`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ GET with stock_bajo=true successful');
    console.log('Low stock items:', response2.data.data.length);
    return true;
  } catch (error) {
    console.error('❌ GET with filters failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreate() {
  console.log('\n➕ Testing POST /api/inventario...');
  try {
    const newItem = {
      nombre: 'Rosas Rojas Test',
      tipo: 'flores',
      stock: 50,
      stock_min: 10,
      unidad: 'docena',
      costo: 25.50
    };

    const response = await axios.post(`${BASE_URL}/api/inventario`, newItem, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testItemId = response.data.data.id;
    console.log('✅ POST successful');
    console.log('Created item ID:', testItemId);
    console.log('Item:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ POST failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateValidation() {
  console.log('\n🛡️ Testing POST validation...');
  try {
    // Test with invalid data (missing required fields)
    const invalidItem = {
      nombre: '',
      tipo: 'invalid_type',
      stock: -5,
      costo: -10
    };

    await axios.post(`${BASE_URL}/api/inventario`, invalidItem, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ Validation should have failed but didn\'t');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working correctly');
      console.log('Validation errors:', error.response.data.detalles || error.response.data.mensaje);
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function testGetById() {
  console.log('\n🔍 Testing GET /api/inventario/:id...');
  try {
    const response = await axios.get(`${BASE_URL}/api/inventario/${testItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ GET by ID successful');
    console.log('Item:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ GET by ID failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdate() {
  console.log('\n✏️ Testing PUT /api/inventario/:id...');
  try {
    const updates = {
      nombre: 'Rosas Rojas Test (Actualizado)',
      stock: 75,
      costo: 28.00
    };

    const response = await axios.put(`${BASE_URL}/api/inventario/${testItemId}`, updates, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ PUT successful');
    console.log('Updated item:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ PUT failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDelete() {
  console.log('\n🗑️ Testing DELETE /api/inventario/:id...');
  try {
    const response = await axios.delete(`${BASE_URL}/api/inventario/${testItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ DELETE successful');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ DELETE failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAuthRequired() {
  console.log('\n🔒 Testing authentication requirement...');
  try {
    await axios.get(`${BASE_URL}/api/inventario`);
    console.log('❌ Should have required authentication');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentication correctly required');
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Testing Inventory Routes (Task 6.2)                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const results = [];

  // Test authentication requirement first
  results.push(await testAuthRequired());

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot continue without authentication');
    return;
  }

  // Run all tests
  results.push(await testGetAll());
  results.push(await testGetAllWithFilters());
  results.push(await testCreate());
  results.push(await testCreateValidation());
  results.push(await testGetById());
  results.push(await testUpdate());
  results.push(await testDelete());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║  Test Results: ${passed}/${total} passed                              ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  if (passed === total) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
