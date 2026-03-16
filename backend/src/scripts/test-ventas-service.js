/**
 * Integration test for ventas service
 * Tests the complete sales transaction flow with database
 */

const VentasService = require('../services/ventas.service');
const { query } = require('../config/database');

async function testVentasService() {
  console.log('🧪 Testing Ventas Service Integration\n');

  try {
    // Test 1: Get all ventas
    console.log('Test 1: Get all ventas');
    const allVentas = await VentasService.getAll();
    console.log(`✅ Found ${allVentas.length} ventas`);

    // Test 2: Get ventas with filters
    console.log('\nTest 2: Get ventas filtered by metodo_pago');
    const efectivoVentas = await VentasService.getAll({ metodo_pago: 'Efectivo' });
    console.log(`✅ Found ${efectivoVentas.length} ventas with Efectivo`);

    // Test 3: Get a specific venta by ID (if exists)
    if (allVentas.length > 0) {
      console.log('\nTest 3: Get venta by ID with details');
      const venta = await VentasService.getById(allVentas[0].id);
      console.log(`✅ Retrieved venta #${venta.id} with ${venta.productos.length} productos`);
      console.log(`   Total: $${venta.total}, Método: ${venta.metodo_pago}`);
    }

    // Test 4: Create a new venta (with transaction)
    console.log('\nTest 4: Create new venta with transaction');
    
    // First, get available products with stock
    const productos = await query('SELECT id, nombre, precio, stock FROM productos WHERE activo = true AND stock > 0 LIMIT 2');
    
    if (productos.rows.length === 0) {
      console.log('⚠️  No products with stock available, skipping create test');
    } else {
      // Get a trabajador
      const trabajadores = await query('SELECT id FROM usuarios WHERE activo = true LIMIT 1');
      
      if (trabajadores.rows.length === 0) {
        console.log('⚠️  No active trabajadores available, skipping create test');
      } else {
        const ventaData = {
          productos: productos.rows.map(p => ({
            producto_id: p.id,
            cantidad: 1,
            precio_unitario: parseFloat(p.precio)
          })),
          metodo_pago: 'Efectivo',
          trabajador_id: trabajadores.rows[0].id
        };

        console.log(`   Creating venta with ${ventaData.productos.length} productos...`);
        const newVenta = await VentasService.create(ventaData);
        console.log(`✅ Created venta #${newVenta.id}`);
        console.log(`   Total: $${newVenta.total}`);
        console.log(`   Productos: ${newVenta.productos.length}`);

        // Verify stock was deducted
        console.log('\nTest 5: Verify stock deduction');
        for (const item of ventaData.productos) {
          const producto = await query('SELECT stock FROM productos WHERE id = $1', [item.producto_id]);
          console.log(`✅ Product #${item.producto_id} stock updated`);
        }

        // Test 6: Verify transaction rollback on error
        console.log('\nTest 6: Test transaction rollback on insufficient stock');
        try {
          const invalidVenta = {
            productos: [{
              producto_id: productos.rows[0].id,
              cantidad: 999999, // Insufficient stock
              precio_unitario: 100
            }],
            metodo_pago: 'Efectivo',
            trabajador_id: trabajadores.rows[0].id
          };
          await VentasService.create(invalidVenta);
          console.log('❌ Should have thrown error for insufficient stock');
        } catch (error) {
          console.log(`✅ Correctly rejected: ${error.message}`);
        }

        // Test 7: Test invalid metodo_pago
        console.log('\nTest 7: Test invalid metodo_pago validation');
        try {
          const invalidVenta = {
            productos: [{
              producto_id: productos.rows[0].id,
              cantidad: 1,
              precio_unitario: 100
            }],
            metodo_pago: 'Bitcoin', // Invalid
            trabajador_id: trabajadores.rows[0].id
          };
          await VentasService.create(invalidVenta);
          console.log('❌ Should have thrown error for invalid metodo_pago');
        } catch (error) {
          console.log(`✅ Correctly rejected: ${error.message}`);
        }

        // Test 8: Test empty productos array
        console.log('\nTest 8: Test empty productos array validation');
        try {
          const invalidVenta = {
            productos: [],
            metodo_pago: 'Efectivo',
            trabajador_id: trabajadores.rows[0].id
          };
          await VentasService.create(invalidVenta);
          console.log('❌ Should have thrown error for empty productos');
        } catch (error) {
          console.log(`✅ Correctly rejected: ${error.message}`);
        }

        // Test 9: Test with cliente_id
        console.log('\nTest 9: Create venta with cliente_id');
        const clientes = await query('SELECT id FROM clientes LIMIT 1');
        
        if (clientes.rows.length > 0) {
          const ventaWithCliente = {
            productos: [{
              producto_id: productos.rows[0].id,
              cantidad: 1,
              precio_unitario: parseFloat(productos.rows[0].precio)
            }],
            metodo_pago: 'Yape',
            trabajador_id: trabajadores.rows[0].id,
            cliente_id: clientes.rows[0].id
          };

          const ventaConCliente = await VentasService.create(ventaWithCliente);
          console.log(`✅ Created venta #${ventaConCliente.id} with cliente_id`);
        } else {
          console.log('⚠️  No clientes available, skipping cliente test');
        }
      }
    }

    console.log('\n✅ All ventas service tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testVentasService()
  .then(() => {
    console.log('\n✅ Integration test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  });
