const { query } = require('../config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Script para verificar el estado del inventario
 */
async function verificarInventario() {
  try {
    console.log('📦 Verificando inventario...\n');

    // Obtener todos los ítems del inventario
    const result = await query('SELECT * FROM inventario ORDER BY nombre');
    
    if (result.rows.length === 0) {
      console.log('No hay ítems en el inventario');
      return;
    }

    console.log('Ítems en inventario:');
    console.log('─'.repeat(80));
    
    result.rows.forEach(item => {
      const stockStatus = item.stock <= item.stock_min ? '⚠️  BAJO' : '✅ OK';
      console.log(`${stockStatus} | ${item.nombre.padEnd(30)} | Stock: ${String(item.stock).padStart(5)} ${item.unidad.padEnd(10)} | Costo: S/ ${item.costo}`);
    });
    
    console.log('─'.repeat(80));
    console.log(`\nTotal de ítems: ${result.rows.length}`);
    
    // Verificar gastos de merma recientes
    console.log('\n📉 Gastos de merma recientes:');
    console.log('─'.repeat(80));
    
    const mermaResult = await query(`
      SELECT g.*, i.nombre as inventario_nombre, p.nombre as producto_nombre
      FROM gastos g
      LEFT JOIN inventario i ON g.inventario_id = i.id
      LEFT JOIN productos p ON g.producto_id = p.id
      WHERE g.categoria = 'merma'
      ORDER BY g.created_at DESC
      LIMIT 10
    `);
    
    if (mermaResult.rows.length === 0) {
      console.log('No hay gastos de merma registrados');
    } else {
      mermaResult.rows.forEach(gasto => {
        const itemNombre = gasto.item_nombre || gasto.inventario_nombre || gasto.producto_nombre || 'N/A';
        const fecha = new Date(gasto.created_at).toLocaleString('es-PE');
        console.log(`${fecha} | ${itemNombre.padEnd(25)} | Cantidad: ${gasto.cantidad || 'N/A'} | Monto: S/ ${gasto.monto}`);
      });
    }
    
    console.log('─'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarInventario();
