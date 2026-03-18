const { query } = require('../config/database');

async function resetInventario() {
  try {
    console.log('🔄 Limpiando productos y arreglos...');
    
    // Limpiar datos existentes (orden correcto por foreign keys)
    await query('DELETE FROM ventas_productos');
    await query('DELETE FROM ventas');
    await query('DELETE FROM arreglos_inventario');
    await query('DELETE FROM arreglos');
    await query('DELETE FROM productos');
    await query('DELETE FROM inventario');
    
    // Resetear secuencias
    await query('ALTER SEQUENCE inventario_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE productos_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE arreglos_id_seq RESTART WITH 1');
    
    console.log('✅ Datos eliminados');
    console.log('📦 Poblando inventario con datos sintéticos...');
    
    // Poblar inventario
    const inventarioData = [
      // Flores
      ['Rosas rojas', 'flores', 50, 3.50, 'unidad'],
      ['Rosas rosadas', 'flores', 40, 3.00, 'unidad'],
      ['Lirios blancos', 'flores', 30, 4.20, 'unidad'],
      ['Girasoles', 'flores', 35, 2.80, 'unidad'],
      ['Tulipanes', 'flores', 25, 3.80, 'unidad'],
      ['Margaritas', 'flores', 45, 1.50, 'unidad'],
      ['Orquídeas', 'flores', 15, 8.50, 'unidad'],
      ['Claveles', 'flores', 60, 1.80, 'unidad'],
      
      // Materiales
      ['Papel decorativo dorado', 'materiales', 20, 8.50, 'unidad'],
      ['Papel decorativo rosa', 'materiales', 18, 7.00, 'unidad'],
      ['Cinta satinada roja', 'materiales', 30, 4.00, 'metro'],
      ['Cinta satinada dorada', 'materiales', 25, 4.50, 'metro'],
      ['Celofán transparente', 'materiales', 40, 2.50, 'metro'],
      ['Moño decorativo', 'materiales', 35, 3.00, 'unidad'],
      
      // Accesorios
      ['Caja decorativa pequeña', 'accesorios', 15, 12.00, 'unidad'],
      ['Caja decorativa mediana', 'accesorios', 12, 18.00, 'unidad'],
      ['Caja corazón', 'accesorios', 8, 25.00, 'unidad'],
      ['Tarjeta de dedicatoria', 'accesorios', 100, 0.50, 'unidad'],
      ['Peluche pequeño', 'accesorios', 20, 15.00, 'unidad'],
      ['Globo metalizado corazón', 'accesorios', 25, 8.00, 'unidad']
    ];
    
    for (const item of inventarioData) {
      await query(
        `INSERT INTO inventario (nombre, tipo, stock, costo, unidad) 
         VALUES ($1, $2, $3, $4, $5)`,
        item
      );
    }
    
    const result = await query('SELECT COUNT(*) as total FROM inventario');
    console.log(`✅ Inventario poblado con ${result.rows[0].total} items`);
    console.log('');
    console.log('📋 Ahora puedes:');
    console.log('   1. Abrir pages/admin/inventario.html para ver el inventario');
    console.log('   2. Abrir pages/admin/laboratorio.html para crear arreglos');
    console.log('   3. Abrir pages/admin/productos.html para ver los productos creados');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetInventario();
