/**
 * Integration test for clientes routes
 * Tests all endpoints with authentication and validation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test data
const testCliente = {
  nombre: 'Test Cliente',
  telefono: '555-1234',
  direccion: 'Test Address',
  email: 'test@example.com'
};

const updatedCliente = {
  nombre: 'Updated Cliente',
  direccion: 'Updated Address'
};

async function login() {
  try {
    console.log('\n📝 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'maria@floreria.com',
      password: 'password123'
    });
    authToken = response.data.token;
    console.log('✓ Login successful');
    return authToken;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetAllClientes() {
  try {
    console.log('\n📋 Testing GET /api/clientes (pagination)...');
    const response = await axios.get(`${BASE_URL}/clientes`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page: 1, limit: 50 }
    });
    
    console.log('✓ GET /api/clientes successful');
    console.log(`  - Total clients: ${response.data.data.total}`);
    console.log(`  - Page: ${response.data.data.page}/${response.data.data.pages}`);
    console.log(`  - Limit: ${response.data.data.limit}`);
    return response.data;
  } catch (error) {
    console.error('✗ GET /api/clientes failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateCliente() {
  try {
    console.log('\n✏️  Testing POST /api/clientes (create)...');
    const response = await axios.post(`${BASE_URL}/clientes`, testCliente, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✓ POST /api/clientes successful');
    console.log(`  - Client ID: ${response.data.data.id}`);
    console.log(`  - Name: ${response.data.data.nombre}`);
    console.log(`  - Phone: ${response.data.data.telefono}`);
    return response.data.data;
  } catch (error) {
    console.error('✗ POST /api/clientes failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetClientById(clientId) {
  try {
    console.log(`\n🔍 Testing GET /api/clientes/${clientId} (get by ID)...`);
    const response = await axios.get(`${BASE_URL}/clientes/${clientId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✓ GET /api/clientes/:id successful');
    console.log(`  - Name: ${response.data.data.nombre}`);
    console.log(`  - Phone: ${response.data.data.telefono}`);
    return response.data.data;
  } catch (error) {
    console.error(`✗ GET /api/clientes/${clientId} failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function testGetClientByTelefono(telefono) {
  try {
    console.log(`\n📞 Testing GET /api/clientes/telefono/${telefono} (get by phone)...`);
    const response = await axios.get(`${BASE_URL}/clientes/telefono/${telefono}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✓ GET /api/clientes/telefono/:telefono successful');
    console.log(`  - Name: ${response.data.data.nombre}`);
    console.log(`  - ID: ${response.data.data.id}`);
    return response.data.data;
  } catch (error) {
    console.error(`✗ GET /api/clientes/telefono/${telefono} failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateCliente(clientId) {
  try {
    console.log(`\n✏️  Testing PUT /api/clientes/${clientId} (update)...`);
    const response = await axios.put(`${BASE_URL}/clientes/${clientId}`, updatedCliente, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✓ PUT /api/clientes/:id successful');
    console.log(`  - Updated name: ${response.data.data.nombre}`);
    console.log(`  - Updated address: ${response.data.data.direccion}`);
    return response.data.data;
  } catch (error) {
    console.error(`✗ PUT /api/clientes/${clientId} failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function testDeleteCliente(clientId) {
  try {
    console.log(`\n🗑️  Testing DELETE /api/clientes/${clientId} (delete)...`);
    const response = await axios.delete(`${BASE_URL}/clientes/${clientId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✓ DELETE /api/clientes/:id successful');
    return response.data;
  } catch (error) {
    console.error(`✗ DELETE /api/clientes/${clientId} failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function testValidationErrors() {
  try {
    console.log('\n⚠️  Testing validation errors...');
    
    // Test missing required field
    try {
      await axios.post(`${BASE_URL}/clientes`, { telefono: '123456' }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✗ Should have rejected missing nombre');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✓ Correctly rejected missing nombre');
      }
    }

    // Test invalid phone format
    try {
      await axios.post(`${BASE_URL}/clientes`, 
        { nombre: 'Test', telefono: 'invalid' }, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✗ Should have rejected invalid phone');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✓ Correctly rejected invalid phone format');
      }
    }
  } catch (error) {
    console.error('✗ Validation test failed:', error.message);
  }
}

async function testAuthenticationRequired() {
  try {
    console.log('\n🔐 Testing authentication requirement...');
    
    try {
      await axios.get(`${BASE_URL}/clientes`);
      console.log('✗ Should have rejected request without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Correctly rejected request without token');
      }
    }
  } catch (error) {
    console.error('✗ Authentication test failed:', error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Clientes Routes Integration Tests                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Login first
    await login();

    // Test authentication requirement
    await testAuthenticationRequired();

    // Test CRUD operations
    const allClientes = await testGetAllClientes();
    const createdCliente = await testCreateCliente();
    await testGetClientById(createdCliente.id);
    await testGetClientByTelefono(createdCliente.telefono);
    await testUpdateCliente(createdCliente.id);
    await testDeleteCliente(createdCliente.id);

    // Test validation
    await testValidationErrors();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✓ All tests passed!                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n✗ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
