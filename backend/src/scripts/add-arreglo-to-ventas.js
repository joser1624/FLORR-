const { query } = require('../config/database');

async function addArregloToVentas() {
  try {
    console.log('🔧 Agregando soporte para arreglos en ventas...');
    
    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ventas_productos' 
      AND column_name = 'arreglo_id'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna arreglo_id ya existe en ventas_productos');
      return;
    }
    
    // Agregar columna arreglo_id
    await query(`
      ALTER TABLE ventas_productos 
      ADD COLUMN arreglo_id INTEGER REFERENCES arreglos(id) ON DELETE CASCADE
    `);
    
    console.log('✅ Columna arreglo_id agregada a ventas_productos');
    
    // Modificar constraint para permitir producto_id NULL cuando hay arreglo_id
    await query(`
      ALTER TABLE ventas_productos 
      DROP CONSTRAINT IF EXISTS ventas_productos_producto_id_fkey
    `);
    
    await query(`
      ALTER TABLE ventas_productos 
      ADD CONSTRAINT ventas_productos_producto_id_fkey 
      FOREIGN KEY (producto_id) 
      REFERENCES productos(id) 
      ON DELETE CASCADE
    `);
    
    console.log('✅ Constraints actualizados');
    
    // Agregar check constraint para asegurar que haya producto_id O arreglo_id
    await query(`
      ALTER TABLE ventas_productos 
      ADD CONSTRAINT ventas_productos_item_check 
      CHECK (
        (producto_id IS NOT NULL AND arreglo_id IS NULL) OR 
        (producto_id IS NULL AND arreglo_id IS NOT NULL)
      )
    `);
    
    console.log('✅ Check constraint agregado: debe haber producto_id O arreglo_id');
    
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

addArregloToVentas();
