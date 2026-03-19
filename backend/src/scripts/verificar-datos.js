/**
 * Script para verificar los datos en la base de datos
 */

require('dotenv').config();
const { query } = require('../config/database');

async function verificarDatos() {
  console.log('\n🔍 Verificando datos en la base de datos...\n');
  
  try {
    // Verificar ventas
    console.log('📊 VENTAS:');
    const ventasResult = await query('SELECT COUNT(*) as total FROM ventas');
    const totalVentas = ventasResult.rows[0].total;
    console.log(`   Total de ventas: ${totalVentas}`);
    
    if (totalVentas > 0) {
      const ventasRecientes = await query(
        `SELECT id, fecha, total, metodo_pago 
         FROM ventas 
         ORDER BY fecha DESC 
         LIMIT 5`
      );
      console.log('\n   Últimas 5 ventas:');
      ventasRecientes.rows.forEach(v => {
        console.log(`   • Venta #${v.id} - ${v.fecha.toISOString().split('T')[0]} - S/ ${v.total} - ${v.metodo_pago}`);
      });
      
      const ventasPorMes = await query(
        `SELECT TO_CHAR(fecha, 'YYYY-MM') as mes, COUNT(*) as cantidad, SUM(total) as total
         FROM ventas
         GROUP BY TO_CHAR(fecha, 'YYYY-MM')
         ORDER BY mes DESC`
      );
      console.log('\n   Ventas por mes:');
      ventasPorMes.rows.forEach(v => {
        console.log(`   • ${v.mes}: ${v.cantidad} ventas - S/ ${parseFloat(v.total).toFixed(2)}`);
      });
    }
    
    // Verificar gastos
    console.log('\n\n💸 GASTOS:');
    const gastosResult = await query('SELECT COUNT(*) as total FROM gastos');
    const totalGastos = gastosResult.rows[0].total;
    console.log(`   Total de gastos: ${totalGastos}`);
    
    if (totalGastos > 0) {
      const gastosRecientes = await query(
        `SELECT id, fecha, categoria, monto 
         FROM gastos 
         ORDER BY fecha DESC 
         LIMIT 5`
      );
      console.log('\n   Últimos 5 gastos:');
      gastosRecientes.rows.forEach(g => {
        console.log(`   • Gasto #${g.id} - ${g.fecha.toISOString().split('T')[0]} - ${g.categoria} - S/ ${g.monto}`);
      });
      
      const gastosPorCategoria = await query(
        `SELECT categoria, COUNT(*) as cantidad, SUM(monto) as total
         FROM gastos
         GROUP BY categoria
         ORDER BY total DESC`
      );
      console.log('\n   Gastos por categoría:');
      gastosPorCategoria.rows.forEach(g => {
        console.log(`   • ${g.categoria}: ${g.cantidad} gastos - S/ ${parseFloat(g.total).toFixed(2)}`);
      });
    }
    
    // Verificar productos
    console.log('\n\n📦 PRODUCTOS:');
    const productosResult = await query('SELECT COUNT(*) as total FROM productos');
    console.log(`   Total de productos: ${productosResult.rows[0].total}`);
    
    // Verificar clientes
    console.log('\n👤 CLIENTES:');
    const clientesResult = await query('SELECT COUNT(*) as total FROM clientes');
    console.log(`   Total de clientes: ${clientesResult.rows[0].total}`);
    
    // Verificar usuarios/trabajadores
    console.log('\n👥 USUARIOS/TRABAJADORES:');
    const usuariosResult = await query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`   Total de usuarios: ${usuariosResult.rows[0].total}`);
    
    console.log('\n✅ Verificación completada!\n');
    
  } catch (error) {
    console.error('\n❌ Error al verificar datos:', error.message);
  }
  
  process.exit(0);
}

verificarDatos();
