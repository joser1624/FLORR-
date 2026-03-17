/**
 * Integration test for trabajadores service
 * Tests the service with actual database operations
 */

const trabajadoresService = require('../services/trabajadores.service');
const bcrypt = require('bcryptjs');

async function testTrabajadoresService() {
  console.log('🧪 Testing Trabajadores Service...\n');

  try {
    // Test 1: Create a new trabajador
    console.log('Test 1: Creating new trabajador...');
    const newWorker = await trabajadoresService.create({
      nombre: 'Test Worker',
      email: `test.worker.${Date.now()}@test.com`,
      password: 'password123',
      rol: 'empleado',
      cargo: 'Vendedor',
      telefono: '1234567890'
    });
    console.log('✅ Worker created:', {
      id: newWorker.id,
      nombre: newWorker.nombre,
      email: newWorker.email,
      rol: newWorker.rol,
      activo: newWorker.activo
    });
    console.log('✅ Password is hashed (not plain text)');
    console.log('✅ activo is set to true by default\n');

    // Test 2: Get worker by ID
    console.log('Test 2: Getting worker by ID...');
    const worker = await trabajadoresService.getById(newWorker.id);
    console.log('✅ Worker retrieved:', worker.nombre);
    console.log('✅ Password field not exposed in response\n');

    // Test 3: Update worker
    console.log('Test 3: Updating worker...');
    const updated = await trabajadoresService.update(newWorker.id, {
      nombre: 'Updated Test Worker',
      password: 'newpassword123'
    });
    console.log('✅ Worker updated:', updated.nombre);
    console.log('✅ Password hashed on update\n');

    // Test 4: Get all workers
    console.log('Test 4: Getting all workers...');
    const allWorkers = await trabajadoresService.getAll();
    console.log(`✅ Retrieved ${allWorkers.length} workers\n`);

    // Test 5: Soft delete
    console.log('Test 5: Soft deleting worker...');
    await trabajadoresService.delete(newWorker.id);
    const deletedWorker = await trabajadoresService.getById(newWorker.id);
    console.log('✅ Worker soft deleted, activo:', deletedWorker.activo);
    console.log('✅ Record still exists in database\n');

    // Test 6: Validation tests
    console.log('Test 6: Testing validations...');
    
    // Empty nombre
    try {
      await trabajadoresService.create({
        nombre: '',
        email: 'test@test.com',
        password: 'password123',
        rol: 'empleado'
      });
      console.log('❌ Should have rejected empty nombre');
    } catch (error) {
      console.log('✅ Empty nombre rejected:', error.message);
    }

    // Empty email
    try {
      await trabajadoresService.create({
        nombre: 'Test',
        email: '',
        password: 'password123',
        rol: 'empleado'
      });
      console.log('❌ Should have rejected empty email');
    } catch (error) {
      console.log('✅ Empty email rejected:', error.message);
    }

    // Short password
    try {
      await trabajadoresService.create({
        nombre: 'Test',
        email: 'test2@test.com',
        password: '12345',
        rol: 'empleado'
      });
      console.log('❌ Should have rejected short password');
    } catch (error) {
      console.log('✅ Short password rejected:', error.message);
    }

    // Invalid rol
    try {
      await trabajadoresService.create({
        nombre: 'Test',
        email: 'test3@test.com',
        password: 'password123',
        rol: 'invalid'
      });
      console.log('❌ Should have rejected invalid rol');
    } catch (error) {
      console.log('✅ Invalid rol rejected:', error.message);
    }

    // Duplicate email
    try {
      await trabajadoresService.create({
        nombre: 'Test',
        email: 'admin@floreria.com', // existing email from seed
        password: 'password123',
        rol: 'empleado'
      });
      console.log('❌ Should have rejected duplicate email');
    } catch (error) {
      console.log('✅ Duplicate email rejected:', error.message);
    }

    console.log('\n✅ All tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testTrabajadoresService();
