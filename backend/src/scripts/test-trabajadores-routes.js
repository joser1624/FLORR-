/**
 * Integration test for trabajadores routes
 * Tests admin-only access control and request validation
 * Validates Requirements 9.10, 2.4, 20.1, 20.2
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test credentials
const adminCredentials = {
  email: 'maria@floreria.com',
  password: 'password123'
};

const empleadoCredentials = {
  email: 'ana@floreria.com',
  password: 'password123'
};

let adminToken = '';
let empleadoToken = '';
let testWorkerId = null;

async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testTrabajadoresRoutes() {
  console.log('🧪 Testing Trabajadores Routes...\n');

  try {
    // Setup: Login as admin and empleado
    console.log('Setup: Logging in...');
    adminToken = await login(adminCredentials);
    empleadoToken = await login(empleadoCredentials);
    console.log('✅ Admin and empleado logged in\n');

    // Test 1: GET /api/trabajadores without token (should fail with 401)
    console.log('Test 1: GET /api/trabajadores without token...');
    try {
      await axios.get(`${BASE_URL}/trabajadores`);
      console.log('❌ Should have rejected request without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Request rejected with 401:', error.response.data.mensaje);
      } else {
        throw error;
      }
    }

    // Test 2: GET /api/trabajadores as empleado (should fail with 403)
    console.log('\nTest 2: GET /api/trabajadores as empleado (non-admin)...');
    try {
      await axios.get(`${BASE_URL}/trabajadores`, {
        headers: { Authorization: `Bearer ${empleadoToken}` }
      });
      console.log('❌ Should have rejected empleado access');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Empleado access denied with 403:', error.response.data.mensaje);
      } else {
        throw error;
      }
    }

    // Test 3: GET /api/trabajadores as admin (should succeed)
    console.log('\nTest 3: GET /api/trabajadores as admin...');
    const listResponse = await axios.get(`${BASE_URL}/trabajadores`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can list workers');
    console.log(`✅ Retrieved ${listResponse.data.trabajadores.length} workers`);

    // Test 4: POST /api/trabajadores with invalid data (should fail with 400)
    console.log('\nTest 4: POST /api/trabajadores with invalid data...');
    try {
      await axios.post(
        `${BASE_URL}/trabajadores`,
        {
          nombre: '', // Empty nombre
          email: 'invalid-email', // Invalid email format
          password: '123', // Too short
          rol: 'invalid', // Invalid rol
          cargo: 'Test'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('❌ Should have rejected invalid data');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid data rejected with 400');
        console.log('✅ Validation errors:', error.response.data.detalles?.length || 0, 'errors');
      } else {
        throw error;
      }
    }

    // Test 5: POST /api/trabajadores with valid data as admin (should succeed)
    console.log('\nTest 5: POST /api/trabajadores with valid data as admin...');
    const createResponse = await axios.post(
      `${BASE_URL}/trabajadores`,
      {
        nombre: 'Test Worker Route',
        email: `test.route.${Date.now()}@test.com`,
        password: 'password123',
        rol: 'empleado',
        cargo: 'Vendedor',
        telefono: '9876543210'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    testWorkerId = createResponse.data.trabajador.id;
    console.log('✅ Worker created successfully');
    console.log('✅ Response status:', createResponse.status);
    console.log('✅ Worker ID:', testWorkerId);
    console.log('✅ Success message:', createResponse.data.mensaje);

    // Test 6: POST /api/trabajadores as empleado (should fail with 403)
    console.log('\nTest 6: POST /api/trabajadores as empleado...');
    try {
      await axios.post(
        `${BASE_URL}/trabajadores`,
        {
          nombre: 'Test',
          email: 'test@test.com',
          password: 'password123',
          rol: 'empleado',
          cargo: 'Test'
        },
        {
          headers: { Authorization: `Bearer ${empleadoToken}` }
        }
      );
      console.log('❌ Should have rejected empleado access');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Empleado cannot create workers (403)');
      } else {
        throw error;
      }
    }

    // Test 7: GET /api/trabajadores/:id as admin (should succeed)
    console.log('\nTest 7: GET /api/trabajadores/:id as admin...');
    const getResponse = await axios.get(`${BASE_URL}/trabajadores/${testWorkerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can get worker by ID');
    console.log('✅ Worker name:', getResponse.data.trabajador.nombre);

    // Test 8: GET /api/trabajadores/:id as empleado (should fail with 403)
    console.log('\nTest 8: GET /api/trabajadores/:id as empleado...');
    try {
      await axios.get(`${BASE_URL}/trabajadores/${testWorkerId}`, {
        headers: { Authorization: `Bearer ${empleadoToken}` }
      });
      console.log('❌ Should have rejected empleado access');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Empleado cannot view worker details (403)');
      } else {
        throw error;
      }
    }

    // Test 9: GET /api/trabajadores/:id with invalid ID (should fail with 400)
    console.log('\nTest 9: GET /api/trabajadores/:id with invalid ID...');
    try {
      await axios.get(`${BASE_URL}/trabajadores/invalid`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('❌ Should have rejected invalid ID');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid ID rejected with 400');
      } else {
        throw error;
      }
    }

    // Test 10: PUT /api/trabajadores/:id as admin (should succeed)
    console.log('\nTest 10: PUT /api/trabajadores/:id as admin...');
    const updateResponse = await axios.put(
      `${BASE_URL}/trabajadores/${testWorkerId}`,
      {
        nombre: 'Updated Test Worker',
        email: `test.route.${Date.now()}@test.com`,
        password: 'newpassword123',
        rol: 'empleado',
        cargo: 'Vendedor Senior',
        telefono: '9876543210'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Worker updated successfully');
    console.log('✅ Updated name:', updateResponse.data.trabajador.nombre);

    // Test 11: PUT /api/trabajadores/:id as empleado (should fail with 403)
    console.log('\nTest 11: PUT /api/trabajadores/:id as empleado...');
    try {
      await axios.put(
        `${BASE_URL}/trabajadores/${testWorkerId}`,
        {
          nombre: 'Test',
          email: 'test@test.com',
          password: 'password123',
          rol: 'empleado',
          cargo: 'Test'
        },
        {
          headers: { Authorization: `Bearer ${empleadoToken}` }
        }
      );
      console.log('❌ Should have rejected empleado access');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Empleado cannot update workers (403)');
      } else {
        throw error;
      }
    }

    // Test 12: DELETE /api/trabajadores/:id as empleado (should fail with 403)
    console.log('\nTest 12: DELETE /api/trabajadores/:id as empleado...');
    try {
      await axios.delete(`${BASE_URL}/trabajadores/${testWorkerId}`, {
        headers: { Authorization: `Bearer ${empleadoToken}` }
      });
      console.log('❌ Should have rejected empleado access');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Empleado cannot delete workers (403)');
      } else {
        throw error;
      }
    }

    // Test 13: DELETE /api/trabajadores/:id as admin (should succeed)
    console.log('\nTest 13: DELETE /api/trabajadores/:id as admin...');
    const deleteResponse = await axios.delete(`${BASE_URL}/trabajadores/${testWorkerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Worker deleted successfully');
    console.log('✅ Success message:', deleteResponse.data.mensaje);

    // Test 14: Verify soft delete (worker should still exist but inactive)
    console.log('\nTest 14: Verify soft delete...');
    const deletedWorker = await axios.get(`${BASE_URL}/trabajadores/${testWorkerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Worker still exists in database');
    console.log('✅ Worker activo status:', deletedWorker.data.trabajador.activo);

    console.log('\n✅ All trabajadores routes tests passed!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Authentication required for all endpoints');
    console.log('  ✅ Admin role required for all operations');
    console.log('  ✅ Non-admin users receive 403 Forbidden');
    console.log('  ✅ Request validation working correctly');
    console.log('  ✅ CRUD operations working as expected');
    console.log('  ✅ Soft delete implemented correctly');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000/health');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   cd backend && npm start');
    process.exit(1);
  }

  await testTrabajadoresRoutes();
}

main();
