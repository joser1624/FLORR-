/**
 * Test script for Inventory Service
 * Tests all CRUD operations and validation
 */

const inventarioService = require('../services/inventario.service');

async function testInventarioService() {
  console.log('=== Testing Inventory Service ===\n');

  try {
    // Test 1: Create inventory item with valid data
    console.log('Test 1: Create inventory item with valid data');
    const newItem = {
      nombre: 'Rosas Rojas',
      tipo: 'flores',
      stock: 50,
      stock_min: 10,
      unidad: 'docena',
      costo: 25.50
    };
    const created = await inventarioService.create(newItem);
    console.log('✓ Created:', created);
    console.log();

    // Test 2: Get item by ID
    console.log('Test 2: Get item by ID');
    const item = await inventarioService.getById(created.id);
    console.log('✓ Retrieved:', item);
    console.log();

    // Test 3: Get all items
    console.log('Test 3: Get all items');
    const allItems = await inventarioService.getAll();
    console.log(`✓ Found ${allItems.length} items`);
    console.log();

    // Test 4: Filter by tipo
    console.log('Test 4: Filter by tipo');
    const floresItems = await inventarioService.getAll({ tipo: 'flores' });
    console.log(`✓ Found ${floresItems.length} flores items`);
    console.log();

    // Test 5: Update item
    console.log('Test 5: Update item');
    const updated = await inventarioService.update(created.id, {
      stock: 30,
      costo: 28.00
    });
    console.log('✓ Updated:', updated);
    console.log();

    // Test 6: Create item with low stock
    console.log('Test 6: Create item with low stock');
    const lowStockItem = {
      nombre: 'Cinta Decorativa',
      tipo: 'materiales',
      stock: 3,
      stock_min: 10,
      unidad: 'rollo',
      costo: 5.00
    };
    const lowStock = await inventarioService.create(lowStockItem);
    console.log('✓ Created low stock item:', lowStock);
    console.log();

    // Test 7: Filter by low stock
    console.log('Test 7: Filter by low stock');
    const lowStockItems = await inventarioService.getAll({ stock_bajo: true });
    console.log(`✓ Found ${lowStockItems.length} low stock items`);
    lowStockItems.forEach(item => {
      console.log(`  - ${item.nombre}: stock=${item.stock}, min=${item.stock_min}`);
    });
    console.log();

    // Test 8: Validation - empty nombre
    console.log('Test 8: Validation - empty nombre');
    try {
      await inventarioService.create({
        nombre: '',
        tipo: 'flores',
        stock: 10,
        costo: 5.00
      });
      console.log('✗ Should have thrown error');
    } catch (error) {
      console.log('✓ Validation error:', error.message);
    }
    console.log();

    // Test 9: Validation - invalid tipo
    console.log('Test 9: Validation - invalid tipo');
    try {
      await inventarioService.create({
        nombre: 'Test',
        tipo: 'invalid',
        stock: 10,
        costo: 5.00
      });
      console.log('✗ Should have thrown error');
    } catch (error) {
      console.log('✓ Validation error:', error.message);
    }
    console.log();

    // Test 10: Validation - negative stock
    console.log('Test 10: Validation - negative stock');
    try {
      await inventarioService.create({
        nombre: 'Test',
        tipo: 'flores',
        stock: -5,
        costo: 5.00
      });
      console.log('✗ Should have thrown error');
    } catch (error) {
      console.log('✓ Validation error:', error.message);
    }
    console.log();

    // Test 11: Validation - negative costo
    console.log('Test 11: Validation - negative costo');
    try {
      await inventarioService.create({
        nombre: 'Test',
        tipo: 'flores',
        stock: 10,
        costo: -5.00
      });
      console.log('✗ Should have thrown error');
    } catch (error) {
      console.log('✓ Validation error:', error.message);
    }
    console.log();

    // Test 12: Delete items
    console.log('Test 12: Delete items');
    await inventarioService.delete(created.id);
    await inventarioService.delete(lowStock.id);
    console.log('✓ Items deleted');
    console.log();

    console.log('=== All tests passed! ===');
    process.exit(0);

  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testInventarioService();
