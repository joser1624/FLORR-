const axios = require('axios');

async function test() {
  try {
    // Login
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'maria@floreria.com',
      password: 'password123'
    });
    const token = login.data.token;
    console.log('✅ Logged in successfully');

    // Create item with only required fields (stock_min and unidad should use defaults)
    const result = await axios.post('http://localhost:3000/api/inventario', {
      nombre: 'Test Minimal Item',
      tipo: 'flores',
      stock: 10,
      costo: 5.50
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Created item with only required fields:');
    console.log(JSON.stringify(result.data.item, null, 2));
    
    // Clean up
    await axios.delete(`http://localhost:3000/api/inventario/${result.data.item.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Deleted successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
