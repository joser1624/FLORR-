const { query, getClient } = require('../config/database');

async function seedDemoData() {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Limpiando datos existentes...');
    
    // Limpiar en orden correcto por foreign keys
    await client.query('DELETE FROM ventas_productos');
    await client.query('DELETE FROM ventas');
    await client.query('DELETE FROM arreglos_inventario');
    await client.query('DELETE FROM arreglos');
    await client.query('DELETE FROM productos');
    await client.query('DELETE FROM pedidos');
    await client.query('DELETE FROM promociones');
    await client.query('DELETE FROM eventos');
    await client.query('DELETE FROM gastos');
    await client.query('DELETE FROM caja');
    await client.query('DELETE FROM clientes');
    await client.query('DELETE FROM usuarios WHERE email != \'admin@encantoseternos.com\''); // Mantener admin
    await client.query('DELETE FROM inventario');
    
    console.log('✅ Datos eliminados');
    console.log('');
    console.log('📦 Creando datos sintéticos...');
    
    // ============================================
    // 1. USUARIOS (TRABAJADORES)
    // ============================================
    console.log('👥 Creando usuarios...');
    // Usar hash pre-calculado para 'password123'
    const hashedPassword = '$2a$10$/x/ejOH4LvY3tIHQQLvfN.vEMB0jxK/rmZtSFz0IVEJAXvTWGvv.S';
    
    const usuarios = await client.query(
      `INSERT INTO usuarios (nombre, email, password, cargo, rol, telefono, activo) VALUES
       ('María González', 'maria@encantoseternos.com', $1, 'Vendedor/a', 'empleado', '987654321', true),
       ('Carlos Pérez', 'carlos@encantoseternos.com', $1, 'Florista', 'empleado', '987654322', true),
       ('Ana Torres', 'ana@encantoseternos.com', $1, 'Vendedor/a', 'empleado', '987654323', true)
       RETURNING id`,
      [hashedPassword]
    );
    
    const usuarioIds = usuarios.rows.map(t => t.id);
    console.log(`   ✓ ${usuarioIds.length} usuarios creados`);
    
    // ============================================
    // 2. CLIENTES
    // ============================================
    console.log('👤 Creando clientes...');
    const clientes = await client.query(
      `INSERT INTO clientes (nombre, telefono, email, direccion) VALUES
       ('Laura Martínez', '912345678', 'laura@email.com', 'Av. Principal 123, Miraflores'),
       ('Roberto Silva', '923456789', 'roberto@email.com', 'Jr. Las Flores 456, San Isidro'),
       ('Carmen Rojas', '934567890', 'carmen@email.com', 'Calle Los Rosales 789, Surco'),
       ('Diego Vargas', '945678901', NULL, 'Av. Arequipa 321, Lince'),
       ('Patricia Luna', '956789012', 'patricia@email.com', 'Jr. Puno 654, Breña')
       RETURNING id`
    );
    
    const clienteIds = clientes.rows.map(c => c.id);
    console.log(`   ✓ ${clienteIds.length} clientes creados`);
    
    // ============================================
    // 3. INVENTARIO
    // ============================================
    console.log('📦 Creando inventario...');
    const inventario = await client.query(
      `INSERT INTO inventario (nombre, tipo, stock, costo, unidad, stock_min) VALUES
       ('Rosas rojas', 'flores', 120, 3.50, 'unidad', 20),
       ('Rosas rosadas', 'flores', 80, 3.00, 'unidad', 15),
       ('Lirios blancos', 'flores', 60, 4.20, 'unidad', 10),
       ('Girasoles', 'flores', 70, 2.80, 'unidad', 15),
       ('Tulipanes', 'flores', 50, 3.80, 'unidad', 10),
       ('Margaritas', 'flores', 90, 1.50, 'unidad', 20),
       ('Orquídeas', 'flores', 30, 8.50, 'unidad', 5),
       ('Claveles', 'flores', 100, 1.80, 'unidad', 20),
       ('Papel decorativo dorado', 'materiales', 40, 8.50, 'unidad', 5),
       ('Papel decorativo rosa', 'materiales', 35, 7.00, 'unidad', 5),
       ('Cinta satinada roja', 'materiales', 60, 4.00, 'metro', 10),
       ('Cinta satinada dorada', 'materiales', 50, 4.50, 'metro', 10),
       ('Celofán transparente', 'materiales', 80, 2.50, 'metro', 15),
       ('Moño decorativo', 'materiales', 70, 3.00, 'unidad', 10),
       ('Caja decorativa pequeña', 'accesorios', 30, 12.00, 'unidad', 5),
       ('Caja decorativa mediana', 'accesorios', 25, 18.00, 'unidad', 5),
       ('Caja corazón', 'accesorios', 15, 25.00, 'unidad', 3),
       ('Tarjeta de dedicatoria', 'accesorios', 200, 0.50, 'unidad', 50),
       ('Peluche pequeño', 'accesorios', 40, 15.00, 'unidad', 8),
       ('Globo metalizado corazón', 'accesorios', 50, 8.00, 'unidad', 10)
       RETURNING id, nombre`
    );
    
    console.log(`   ✓ ${inventario.rows.length} items de inventario creados`);
    
    // ============================================
    // 4. PRODUCTOS (productos simples, no arreglos)
    // ============================================
    console.log('🌸 Creando productos...');
    const productos = await client.query(
      `INSERT INTO productos (nombre, descripcion, categoria, precio, costo, stock, activo) VALUES
       ('Peluche osito + 6 rosas', 'Osito de peluche con ramo de 6 rosas rojas', 'Peluches', 95.00, 45.00, 12, true),
       ('Globos corazón + rosas', '5 globos metalizados con ramo de rosas', 'Globos', 75.00, 35.00, 8, true),
       ('Caja sorpresa romántica', 'Caja decorativa con chocolates y flores', 'Cajas sorpresa', 150.00, 70.00, 5, true),
       ('Ramo clásico 12 rosas', 'Docena de rosas rojas con papel dorado', 'Ramos', 85.00, 50.00, 15, true),
       ('Ramo primaveral mixto', 'Flores variadas de temporada', 'Ramos', 70.00, 35.00, 10, true)
       RETURNING id`
    );
    
    const productoIds = productos.rows.map(p => p.id);
    console.log(`   ✓ ${productoIds.length} productos creados`);
    
    // ============================================
    // 5. ARREGLOS (del laboratorio)
    // ============================================
    console.log('💐 Creando arreglos del laboratorio...');
    
    // Crear un mapa de nombre -> id para el inventario
    const invMap = {};
    inventario.rows.forEach(item => {
      invMap[item.nombre] = item.id;
    });
    
    // Arreglo 1: Ramo romántico (10 rosas rojas + papel dorado + cinta roja)
    const arr1 = await client.query(
      `INSERT INTO arreglos (nombre, margen, costo_total, precio_venta) 
       VALUES ('Ramo romántico especial', 45, 45.50, 82.73) 
       RETURNING id`
    );
    await client.query(
      `INSERT INTO arreglos_inventario (arreglo_id, inventario_id, cantidad) VALUES
       ($1, $2, 10),
       ($1, $3, 1),
       ($1, $4, 2)`,
      [arr1.rows[0].id, invMap['Rosas rojas'], invMap['Papel decorativo dorado'], invMap['Cinta satinada roja']]
    );
    
    // Arreglo 2: Arreglo primaveral (8 girasoles + 12 margaritas + caja pequeña + tarjeta)
    const arr2 = await client.query(
      `INSERT INTO arreglos (nombre, margen, costo_total, precio_venta) 
       VALUES ('Arreglo primaveral en caja', 50, 68.00, 136.00) 
       RETURNING id`
    );
    await client.query(
      `INSERT INTO arreglos_inventario (arreglo_id, inventario_id, cantidad) VALUES
       ($1, $2, 8),
       ($1, $3, 12),
       ($1, $4, 1),
       ($1, $5, 1)`,
      [arr2.rows[0].id, invMap['Girasoles'], invMap['Margaritas'], invMap['Caja decorativa pequeña'], invMap['Tarjeta de dedicatoria']]
    );
    
    // Arreglo 3: Bouquet elegante (8 lirios + papel rosa + cinta dorada + moño)
    const arr3 = await client.query(
      `INSERT INTO arreglos (nombre, margen, costo_total, precio_venta) 
       VALUES ('Bouquet elegante de lirios', 40, 55.20, 92.00) 
       RETURNING id`
    );
    await client.query(
      `INSERT INTO arreglos_inventario (arreglo_id, inventario_id, cantidad) VALUES
       ($1, $2, 8),
       ($1, $3, 1),
       ($1, $4, 2),
       ($1, $5, 1)`,
      [arr3.rows[0].id, invMap['Lirios blancos'], invMap['Papel decorativo rosa'], invMap['Cinta satinada dorada'], invMap['Moño decorativo']]
    );
    
    console.log('   ✓ 3 arreglos del laboratorio creados');
    
    // ============================================
    // 6. PROMOCIONES
    // ============================================
    console.log('🎉 Creando promociones...');
    await client.query(
      `INSERT INTO promociones (titulo, descripcion, descuento, fecha_desde, fecha_hasta, activa) VALUES
       ('20% OFF en ramos de rosas', 'Válido para ramos de 12 rosas en adelante', 20, '2026-03-01', '2026-03-31', true),
       ('Día de la Madre - Especial', 'Arreglos con cinta dorada gratis', 0, '2026-05-01', '2026-05-11', true),
       ('Combo San Valentín', 'Peluche + rosas con 15% descuento', 15, '2026-02-10', '2026-02-14', false)`
    );
    console.log('   ✓ 3 promociones creadas');
    
    // ============================================
    // 7. EVENTOS
    // ============================================
    console.log('📅 Creando eventos...');
    await client.query(
      `INSERT INTO eventos (nombre, descripcion, fecha, emoji, activo) VALUES
       ('Día de la Madre', 'Honra a mamá con el arreglo perfecto', '2026-05-10', '🌹', true),
       ('Día del Amor y la Amistad', 'Celebra con flores para tus seres queridos', '2026-07-23', '💐', true),
       ('Navidad', 'Arreglos especiales para las fiestas', '2026-12-25', '🎄', true)`
    );
    console.log('   ✓ 3 eventos creados');
    
    // ============================================
    // 8. PEDIDOS
    // ============================================
    console.log('📋 Creando pedidos...');
    await client.query(
      `INSERT INTO pedidos (cliente_id, cliente_nombre, cliente_telefono, descripcion, total, fecha_entrega, direccion, estado, metodo_pago, trabajador_id) VALUES
       (${clienteIds[0]}, 'Laura Martínez', '912345678', 'Peluche osito + 6 rosas', 95.00, '2026-03-20', 'Av. Principal 123, Miraflores', 'pendiente', 'Yape', ${usuarioIds[0]}),
       (${clienteIds[1]}, 'Roberto Silva', '923456789', '2 Ramos clásicos de 12 rosas', 170.00, '2026-03-18', 'Jr. Las Flores 456, San Isidro', 'en preparación', 'Efectivo', ${usuarioIds[1]}),
       (${clienteIds[2]}, 'Carmen Rojas', '934567890', 'Caja sorpresa romántica', 150.00, '2026-03-19', 'Calle Los Rosales 789, Surco', 'listo para entrega', 'Tarjeta', ${usuarioIds[0]}),
       (${clienteIds[3]}, 'Diego Vargas', '945678901', 'Globos corazón + rosas', 75.00, '2026-03-17', 'Av. Arequipa 321, Lince', 'entregado', 'Yape', ${usuarioIds[2]}),
       (${clienteIds[4]}, 'Patricia Luna', '956789012', '3 Ramos primaverales mixtos para evento corporativo', 210.00, '2026-03-21', 'Jr. Puno 654, Breña', 'pendiente', 'Transferencia bancaria', ${usuarioIds[1]})`
    );
    console.log('   ✓ 5 pedidos creados');
    
    // ============================================
    // 9. VENTAS
    // ============================================
    console.log('💰 Creando ventas...');
    
    // Venta 1
    const venta1 = await client.query(
      `INSERT INTO ventas (total, metodo_pago, trabajador_id, cliente_id, fecha) 
       VALUES (95.00, 'Yape', ${usuarioIds[0]}, ${clienteIds[0]}, '2026-03-15 10:30:00') 
       RETURNING id`
    );
    await client.query(
      `INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal) 
       VALUES ($1, ${productoIds[0]}, 1, 95.00, 95.00)`,
      [venta1.rows[0].id]
    );
    
    // Venta 2
    const venta2 = await client.query(
      `INSERT INTO ventas (total, metodo_pago, trabajador_id, cliente_id, fecha) 
       VALUES (170.00, 'Efectivo', ${usuarioIds[1]}, ${clienteIds[1]}, '2026-03-15 14:20:00') 
       RETURNING id`
    );
    await client.query(
      `INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal) 
       VALUES ($1, ${productoIds[3]}, 2, 85.00, 170.00)`,
      [venta2.rows[0].id]
    );
    
    // Venta 3
    const venta3 = await client.query(
      `INSERT INTO ventas (total, metodo_pago, trabajador_id, fecha) 
       VALUES (225.00, 'Tarjeta', ${usuarioIds[0]}, '2026-03-16 11:15:00') 
       RETURNING id`
    );
    await client.query(
      `INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
       ($1, ${productoIds[1]}, 2, 75.00, 150.00),
       ($1, ${productoIds[4]}, 1, 70.00, 70.00)`,
      [venta3.rows[0].id]
    );
    
    // Actualizar stock de productos vendidos
    await client.query(`UPDATE productos SET stock = stock - 1 WHERE id = ${productoIds[0]}`);
    await client.query(`UPDATE productos SET stock = stock - 2 WHERE id = ${productoIds[3]}`);
    await client.query(`UPDATE productos SET stock = stock - 2 WHERE id = ${productoIds[1]}`);
    await client.query(`UPDATE productos SET stock = stock - 1 WHERE id = ${productoIds[4]}`);
    
    console.log('   ✓ 3 ventas creadas');
    
    // ============================================
    // 10. GASTOS
    // ============================================
    console.log('💸 Creando gastos...');
    await client.query(
      `INSERT INTO gastos (descripcion, monto, categoria, fecha) VALUES
       ('Compra de flores al proveedor', 450.00, 'flores', '2026-03-10'),
       ('Pago de alquiler del local', 1200.00, 'otros', '2026-03-01'),
       ('Servicios públicos (luz, agua)', 180.00, 'otros', '2026-03-05'),
       ('Publicidad en redes sociales', 250.00, 'otros', '2026-03-12'),
       ('Mantenimiento de vehículo delivery', 120.00, 'transporte', '2026-03-14')`
    );
    console.log('   ✓ 5 gastos creados');
    
    // ============================================
    // 11. CAJA
    // ============================================
    console.log('💵 Creando registros de caja...');
    await client.query(
      `INSERT INTO caja (fecha, monto_apertura, monto_cierre, total_efectivo, total_digital, total_tarjeta, total_ventas, total_gastos, trabajador_apertura_id, trabajador_cierre_id, estado) VALUES
       ('2026-03-15', 500.00, 765.00, 170.00, 95.00, 0.00, 265.00, 0.00, ${usuarioIds[2]}, ${usuarioIds[2]}, 'cerrada'),
       ('2026-03-16', 765.00, 940.00, 0.00, 0.00, 225.00, 225.00, 50.00, ${usuarioIds[2]}, ${usuarioIds[2]}, 'cerrada'),
       ('2026-03-17', 940.00, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, ${usuarioIds[2]}, NULL, 'abierta')`
    );
    console.log('   ✓ 3 registros de caja creados');
    
    await client.query('COMMIT');
    
    console.log('');
    console.log('✅ ¡Datos sintéticos creados exitosamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • ${usuarioIds.length} usuarios (user: maria/carlos/ana, pass: password123)`);
    console.log(`   • ${clienteIds.length} clientes`);
    console.log(`   • 20 items de inventario`);
    console.log(`   • ${productoIds.length} productos`);
    console.log('   • 3 arreglos del laboratorio');
    console.log('   • 3 promociones');
    console.log('   • 3 eventos');
    console.log('   • 5 pedidos');
    console.log('   • 3 ventas');
    console.log('   • 5 gastos');
    console.log('   • 3 registros de caja');
    console.log('');
    console.log('🚀 Ahora puedes explorar todas las páginas del admin:');
    console.log('   • Dashboard: Métricas y resumen');
    console.log('   • Inventario: Ver flores y materiales');
    console.log('   • Laboratorio: Crear nuevos arreglos');
    console.log('   • Productos: Ver productos y arreglos');
    console.log('   • Ventas: Registrar nuevas ventas');
    console.log('   • Pedidos: Gestionar pedidos');
    console.log('   • Clientes: Ver base de clientes');
    console.log('   • Trabajadores: Gestionar equipo');
    console.log('   • Caja: Movimientos de efectivo');
    console.log('   • Gastos: Control de gastos');
    console.log('   • Promociones: Ofertas activas');
    console.log('   • Eventos: Fechas especiales');
    console.log('   • Reportes: Análisis de ventas');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDemoData();
