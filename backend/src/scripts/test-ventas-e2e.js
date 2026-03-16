/**
 * End-to-end test for ventas API endpoints
 * Tests the complete flow from HTTP request to database
 */

const axios = require('axios');
const { query } = require('../config/database');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;
let testUserId = null;

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'maria@floreria.com',
      password: 'password123'
    });
    
    authToken = response.data.token;
    testUserId = response.data.user.id;
    console.log(`✅ Logged in as ${response.data.user.nombre} (${response.data.user.rol})`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAllVentas() {
  console.log('\n📋 Test: GET /api/ventas');
  try {
    const response = await axios.get(`${BASE_URL}/ventas`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Retrieved ${response.data.ventas.length} ventas`);
    return response.data.ventas;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetVentaById(id) {
  console.log(`\n📋 Test: GET /api/ventas/${id}`);
  try {
    const response = await axios.get(`${BASE_URL}/ventas/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Retrieved venta #${response.data.venta.id}`);
    console.log(`   Total: $${response.data.venta.total}`);
    console.log(`   Productos: ${response.data.venta.productos.length}`);
    return response.data.venta;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateVenta() {
  console.log('\n📋 Test: POST /api/ventas (Create new venta)');
  
  // Get available products
  const productos = await query('SELECT id, nombre, precio, stock FROM productos WHERE activo = true AND stock > 0 LIMIT 2');
  
  if (productos.rows.length === 0) {
    console.log('⚠️  No products available, skipping test');
    return null;
  }

  const ventaData = {
    productos: productos.rows.map(p => ({
      producto_id: p.id,
      cantidad: 1,
      precio_unitario: parseFloat(p.precio)
    })),
    metodo_pago: 'Efectivo'
  };

  try {
    const response = await axios.post(`${BASE_URL}/ventas`, ventaData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Created venta #${response.data.venta.id}`);
    console.log(`   Total: $${response.data.venta.total}`);
    console.log(`   Trabajador ID: ${response.data.venta.trabajador_id}`);
    console.log(`   Productos: ${response.data.venta.productos.length}`);
    
    // Verify trabajador_id was set from authenticated user
    if (response.data.venta.trabajador_id !== testUserId) {
      console.error(`❌ trabajador_id mismatch! Expected ${testUserId}, got ${response.data.venta.trabajador_id}`);
    } else {
      console.log('✅ trabajador_id correctly set from authenticated user');
    }
    
    return response.data.venta;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateVentaWithCliente() {
  console.log('\n📋 Test: POST /api/ventas (With cliente_id)');
  
  // Get a cliente
  const clientes = await query('SELECT id FROM clientes LIMIT 1');
  if (clientes.rows.length === 0) {
    console.log('⚠️  No clientes available, skipping test');
    return null;
  }

  // Get available products
  const productos = await query('SELECT id, nombre, precio, stock FROM productos WHERE activo = true AND stock > 0 LIMIT 1');
  if (productos.rows.length === 0) {
    console.log('⚠️  No products available, skipping test');
    return null;
  }

  const ventaData = {
    productos: [{
      producto_id: productos.rows[0].id,
      cantidad: 1,
      precio_unitario: parseFloat(productos.rows[0].precio)
    }],
    metodo_pago: 'Yape',
    cliente_id: clientes.rows[0].id
  };

  try {
    const response = await axios.post(`${BASE_URL}/ventas`, ventaData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Created venta #${response.data.venta.id} with cliente_id`);
    console.log(`   Cliente ID: ${response.data.venta.cliente_id}`);
    return response.data.venta;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testInvalidMetodoPago() {
  console.log('\n📋 Test: POST /api/ventas (Invalid metodo_pago)');
  
  const productos = await query('SELECT id, precio FROM productos WHERE activo = true AND stock > 0 LIMIT 1');
  if (productos.rows.length === 0) {
    console.log('⚠️  No products available, skipping test');
    return;
  }

  const ventaData = {
    productos: [{
      producto_id: productos.rows[0].id,
      cantidad: 1,
      precio_unitario: parseFloat(productos.rows[0].precio)
    }],
    metodo_pago: 'Bitcoin' // Invalid
  };

  try {
    await axios.post(`${BASE_URL}/ventas`, ventaData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.error('❌ Should have rejected invalid metodo_pago');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('método de pago')) {
      console.log(`✅ Correctly rejected: ${error.response.data.mensaje}`);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testInsufficientStock() {
  console.log('\n📋 Test: POST /api/ventas (Insufficient stock)');
  
  const productos = await query('SELECT id, precio FROM productos WHERE activo = true LIMIT 1');
  if (productos.rows.length === 0) {
    console.log('⚠️  No products available, skipping test');
    return;
  }

  const ventaData = {
    productos: [{
      producto_id: productos.rows[0].id,
      cantidad: 999999, // Way more than available
      precio_unitario: parseFloat(productos.rows[0].precio)
    }],
    metodo_pago: 'Efectivo'
  };

  try {
    await axios.post(`${BASE_URL}/ventas`, ventaData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.error('❌ Should have rejected insufficient stock');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('Stock insuficiente')) {
      console.log(`✅ Correctly rejected: ${error.response.data.mensaje}`);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testEmptyProductos() {
  console.log('\n📋 Test: POST /api/ventas (Empty productos array)');
  
  const ventaData = {
    productos: [],
    metodo_pago: 'Efectivo'
  };

  try {
    await axios.post(`${BASE_URL}/ventas`, ventaData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.error('❌ Should have rejected empty productos');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('al menos un producto')) {
      console.log(`✅ Correctly rejected: ${error.response.data.mensaje}`);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testFilterByMetodoPago() {
  console.log('\n📋 Test: GET /api/ventas?metodo_pago=Efectivo');
  try {
    const response = await axios.get(`${BASE_URL}/ventas?metodo_pago=Efectivo`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Retrieved ${response.data.ventas.length} ventas with Efectivo`);
    
    // Verify all results have correct metodo_pago
    const allCorrect = response.data.ventas.every(v => v.metodo_pago === 'Efectivo');
    if (allCorrect) {
      console.log('✅ All results correctly filtered');
    } else {
      console.error('❌ Some results have incorrect metodo_pago');
    }
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n📋 Test: POST /api/ventas (Without authentication)');
  
  const ventaData = {
    productos: [{ producto_id: 1, cantidad: 1, precio_unitario: 100 }],
    metodo_pago: 'Efectivo'
  };

  try {
    await axios.post(`${BASE_URL}/ventas`, ventaData);
    console.error('❌ Should have rejected unauthenticated request');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected unauthenticated request');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function runTests() {
  console.log('🧪 Starting Ventas E2E Tests\n');
  console.log('⚠️  Make sure the server is running on http://localhost:3000\n');

  try {
    // Login first
    const loggedIn = await login();
    if (!loggedIn) {
      console.error('❌ Cannot proceed without authentication');
      process.exit(1);
    }

    // Run tests
    await testUnauthorizedAccess();
    const ventas = await testGetAllVentas();
    
    if (ventas.length > 0) {
      await testGetVentaById(ventas[0].id);
    }
    
    await testFilterByMetodoPago();
    await testCreateVenta();
    await testCreateVentaWithCliente();
    await testInvalidMetodoPago();
    await testInsufficientStock();
    await testEmptyProductos();

    console.log('\n✅ All E2E tests completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ E2E tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
