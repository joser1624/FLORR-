-- =============================================
-- FLORERÍA ENCANTOS ETERNOS - SEED DATA
-- Realistic test data for development
-- =============================================

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE arreglos_inventario, arreglos, ventas_productos, ventas, pedidos, gastos, caja, promociones, eventos, clientes, inventario, productos, usuarios RESTART IDENTITY CASCADE;

-- =============================================
-- USUARIOS (Workers)
-- Password for all users: "password123" (hashed with bcrypt)
-- =============================================
INSERT INTO usuarios (nombre, email, password, telefono, cargo, rol, fecha_ingreso, activo) VALUES
('María Rodríguez', 'maria@floreria.com', '$2a$10$rZ5YvqZ5YvqZ5YvqZ5YvqOeKKx8xKx8xKx8xKx8xKx8xKx8xKx8xK', '987654321', 'Administrador/a', 'admin', '2024-01-15', true),
('Ana López', 'ana@floreria.com', '$2a$10$rZ5YvqZ5YvqZ5YvqZ5YvqOeKKx8xKx8xKx8xKx8xKx8xKx8xKx8xK', '987111222', 'Vendedor/a', 'empleado', '2024-01-15', true),
('Carmen Quispe', 'carmen@floreria.com', '$2a$10$rZ5YvqZ5YvqZ5YvqZ5YvqOeKKx8xKx8xKx8xKx8xKx8xKx8xKx8xK', '987333444', 'Florista', 'empleado', '2024-03-01', true),
('Rosa Flores', 'rosa@floreria.com', '$2a$10$rZ5YvqZ5YvqZ5YvqZ5YvqOeKKx8xKx8xKx8xKx8xKx8xKx8xKx8xK', '987555666', 'Delivery', 'empleado', '2025-06-01', true),
('Patricia Dueña', 'patricia@floreria.com', '$2a$10$rZ5YvqZ5YvqZ5YvqZ5YvqOeKKx8xKx8xKx8xKx8xKx8xKx8xKx8xK', '987777888', 'Dueña', 'duena', '2024-01-01', true);

-- =============================================
-- PRODUCTOS (Products)
-- =============================================
INSERT INTO productos (nombre, descripcion, categoria, precio, costo, stock, activo) VALUES
-- Ramos
('Ramo romántico de rosas', '12 rosas rojas premium con papel dorado y cinta', 'Ramos', 85.00, 52.00, 15, true),
('Ramo de girasoles y lirios', 'Flores de campo naturales, alegres y vibrantes', 'Ramos', 70.00, 41.00, 12, true),
('Ramo de tulipanes multicolor', '15 tulipanes frescos en colores variados', 'Ramos', 95.00, 58.00, 8, true),
('Ramo de rosas rosadas', '10 rosas rosadas con eucalipto', 'Ramos', 75.00, 45.00, 10, true),

-- Arreglos
('Arreglo primaveral en caja', 'Flores variadas en caja decorativa azul', 'Arreglos', 120.00, 68.00, 3, true),
('Arreglo de cumpleaños', 'Arreglo festivo multicolor con globo', 'Arreglos', 110.00, 60.00, 5, true),
('Arreglo elegante en jarrón', 'Lirios y rosas en jarrón de cristal', 'Arreglos', 150.00, 85.00, 4, true),
('Arreglo tropical', 'Flores exóticas con follaje tropical', 'Arreglos', 135.00, 78.00, 6, true),

-- Peluches
('Peluche + rosas rojas', 'Osito de peluche mediano + 6 rosas rojas', 'Peluches', 95.00, 58.00, 8, true),
('Peluche grande + arreglo', 'Oso grande + arreglo floral pequeño', 'Peluches', 140.00, 82.00, 5, true),
('Peluche corazón + rosas', 'Peluche con corazón + 3 rosas', 'Peluches', 65.00, 38.00, 12, true),

-- Cajas sorpresa
('Caja sorpresa San Valentín', 'Caja personalizada con flores y chocolates', 'Cajas sorpresa', 150.00, 89.00, 0, true),
('Caja corazón con rosas', 'Caja en forma de corazón con 24 rosas', 'Cajas sorpresa', 180.00, 105.00, 4, true),
('Caja sorpresa especial', 'Caja decorada con flores, vino y chocolates', 'Cajas sorpresa', 200.00, 118.00, 2, true),

-- Globos
('Globos + rosas', '5 globos metalizados + ramo de rosas', 'Globos', 60.00, 35.00, 10, true),
('Bouquet de globos romántico', '10 globos con helio + tarjeta', 'Globos', 45.00, 25.00, 15, true),

-- Otros
('Corona fúnebre', 'Corona de flores blancas para condolencias', 'Otros', 180.00, 105.00, 3, true),
('Centro de mesa', 'Arreglo bajo para mesa de eventos', 'Otros', 85.00, 48.00, 7, true);

-- =============================================
-- INVENTARIO (Inventory - Flowers & Materials)
-- =============================================
INSERT INTO inventario (nombre, tipo, stock, stock_min, unidad, costo) VALUES
-- Flores
('Rosas rojas', 'flores', 45, 10, 'unidad', 3.50),
('Rosas rosadas', 'flores', 30, 10, 'unidad', 3.00),
('Rosas blancas', 'flores', 25, 10, 'unidad', 3.20),
('Lirios blancos', 'flores', 8, 10, 'unidad', 2.80),
('Girasoles', 'flores', 25, 8, 'unidad', 2.00),
('Tulipanes', 'flores', 20, 8, 'unidad', 3.20),
('Margaritas', 'flores', 35, 10, 'unidad', 1.50),
('Orquídeas', 'flores', 12, 5, 'unidad', 8.00),
('Claveles', 'flores', 40, 15, 'unidad', 1.20),
('Eucalipto', 'flores', 18, 8, 'unidad', 1.80),

-- Materiales
('Papel decorativo dorado', 'materiales', 3, 5, 'rollo', 8.50),
('Papel decorativo plateado', 'materiales', 6, 5, 'rollo', 8.00),
('Papel kraft', 'materiales', 8, 5, 'rollo', 5.50),
('Cintas satinadas', 'materiales', 12, 5, 'rollo', 4.00),
('Cintas de organza', 'materiales', 10, 5, 'rollo', 4.50),
('Celofán transparente', 'materiales', 15, 8, 'rollo', 3.00),
('Espuma floral', 'materiales', 20, 10, 'unidad', 2.50),

-- Accesorios
('Cajas decorativas pequeñas', 'accesorios', 7, 5, 'unidad', 12.00),
('Cajas decorativas medianas', 'accesorios', 5, 5, 'unidad', 15.00),
('Cajas decorativas grandes', 'accesorios', 3, 3, 'unidad', 20.00),
('Jarrones de cristal', 'accesorios', 8, 5, 'unidad', 18.00),
('Peluches medianos', 'accesorios', 2, 5, 'unidad', 18.00),
('Peluches grandes', 'accesorios', 4, 3, 'unidad', 28.00),
('Globos metalizados', 'accesorios', 25, 10, 'unidad', 3.50),
('Tarjetas de dedicatoria', 'accesorios', 50, 20, 'unidad', 0.50);

-- =============================================
-- CLIENTES (Clients)
-- =============================================
INSERT INTO clientes (nombre, telefono, direccion, email) VALUES
('Ana García Pérez', '987654321', 'Av. Los Rosales 123, San Isidro', 'ana.garcia@email.com'),
('Luis Pérez Martínez', '912345678', 'Jr. Las Flores 456, Miraflores', 'luis.perez@email.com'),
('María Torres Sánchez', '998877665', 'Calle Jardín 789, Surco', 'maria.torres@email.com'),
('Carlos Ramos López', '976543210', 'Av. Principal 321, La Molina', 'carlos.ramos@email.com'),
('Patricia Vega Ruiz', '965432109', 'Jr. Los Tulipanes 654, San Borja', 'patricia.vega@email.com'),
('Jorge Mendoza Castro', '954321098', 'Calle Las Rosas 987, Barranco', 'jorge.mendoza@email.com'),
('Sofía Ramírez Díaz', '943210987', 'Av. Arequipa 1234, Lince', 'sofia.ramirez@email.com'),
('Roberto Silva Flores', '932109876', 'Jr. Independencia 567, Pueblo Libre', null),
('Carmen Gutiérrez Rojas', '921098765', 'Calle Libertad 890, Jesús María', 'carmen.gutierrez@email.com'),
('Fernando Castillo Vargas', '910987654', 'Av. Javier Prado 2345, San Isidro', 'fernando.castillo@email.com');

-- =============================================
-- PEDIDOS (Orders)
-- =============================================
INSERT INTO pedidos (cliente_id, cliente_nombre, cliente_telefono, direccion, fecha_pedido, fecha_entrega, descripcion, total, metodo_pago, estado, trabajador_id) VALUES
(1, 'Ana García Pérez', '987654321', 'Av. Los Rosales 123, San Isidro', '2026-03-10 09:30:00', '2026-03-15', 'Ramo de 12 rosas rojas con papel dorado y tarjeta personalizada', 120.00, 'Yape', 'en preparación', 2),
(2, 'Luis Pérez Martínez', '912345678', 'Jr. Las Flores 456, Miraflores', '2026-03-11 14:20:00', '2026-03-14', 'Arreglo primaveral en caja azul para cumpleaños', 85.00, 'Efectivo', 'listo para entrega', 3),
(3, 'María Torres Sánchez', '998877665', 'Calle Jardín 789, Surco', '2026-03-12 10:15:00', '2026-03-16', 'Caja sorpresa personalizada con flores y chocolates', 200.00, 'Tarjeta', 'pendiente', 2),
(4, 'Carlos Ramos López', '976543210', '', '2026-03-08 16:45:00', '2026-03-12', 'Ramo de girasoles para recoger en tienda', 65.00, 'Yape', 'entregado', 2),
(5, 'Patricia Vega Ruiz', '965432109', 'Jr. Los Tulipanes 654, San Borja', '2026-03-13 11:00:00', '2026-03-17', 'Arreglo elegante en jarrón de cristal', 150.00, 'Transferencia bancaria', 'pendiente', 3),
(6, 'Jorge Mendoza Castro', '954321098', 'Calle Las Rosas 987, Barranco', '2026-03-09 15:30:00', '2026-03-13', 'Peluche grande + arreglo floral', 140.00, 'Yape', 'entregado', 2),
(7, 'Sofía Ramírez Díaz', '943210987', 'Av. Arequipa 1234, Lince', '2026-03-14 09:00:00', '2026-03-18', 'Ramo de tulipanes multicolor', 95.00, 'Efectivo', 'pendiente', 3),
(8, 'Roberto Silva Flores', '932109876', '', '2026-03-07 13:20:00', '2026-03-11', 'Globos + rosas para recoger', 60.00, 'Efectivo', 'entregado', 2);

-- =============================================
-- VENTAS (Sales)
-- =============================================
INSERT INTO ventas (fecha, total, metodo_pago, trabajador_id, cliente_id) VALUES
-- Ventas de marzo 2026
('2026-03-01 10:30:00', 85.00, 'Yape', 2, 1),
('2026-03-01 14:15:00', 120.00, 'Efectivo', 2, 2),
('2026-03-02 09:45:00', 95.00, 'Yape', 3, 3),
('2026-03-02 16:20:00', 70.00, 'Plin', 2, null),
('2026-03-03 11:00:00', 150.00, 'Tarjeta', 3, 4),
('2026-03-03 15:30:00', 65.00, 'Efectivo', 2, null),
('2026-03-04 10:15:00', 110.00, 'Yape', 2, 5),
('2026-03-04 13:45:00', 180.00, 'Transferencia bancaria', 3, 6),
('2026-03-05 09:30:00', 95.00, 'Yape', 2, 7),
('2026-03-05 14:00:00', 75.00, 'Efectivo', 3, null),
('2026-03-06 11:20:00', 135.00, 'Yape', 2, 8),
('2026-03-06 16:45:00', 60.00, 'Plin', 3, null),
('2026-03-07 10:00:00', 85.00, 'Efectivo', 2, 9),
('2026-03-07 15:15:00', 140.00, 'Yape', 3, 10),
('2026-03-08 09:00:00', 120.00, 'Tarjeta', 2, 1),
('2026-03-08 13:30:00', 95.00, 'Yape', 3, null),
('2026-03-09 11:45:00', 150.00, 'Efectivo', 2, 2),
('2026-03-09 16:00:00', 70.00, 'Plin', 3, null),
('2026-03-10 10:30:00', 85.00, 'Yape', 2, 3),
('2026-03-10 14:20:00', 110.00, 'Efectivo', 3, null),
('2026-03-11 09:15:00', 180.00, 'Transferencia bancaria', 2, 4),
('2026-03-11 15:45:00', 65.00, 'Yape', 3, null),
('2026-03-12 11:00:00', 95.00, 'Efectivo', 2, 5),
('2026-03-12 16:30:00', 135.00, 'Yape', 3, null),
('2026-03-13 10:15:00', 75.00, 'Plin', 2, 6),
('2026-03-13 14:45:00', 120.00, 'Tarjeta', 3, null),
('2026-03-14 09:30:00', 85.00, 'Yape', 2, 7),
('2026-03-14 13:00:00', 150.00, 'Efectivo', 3, null),
('2026-03-15 11:20:00', 95.00, 'Yape', 2, 8),
('2026-03-15 15:50:00', 70.00, 'Plin', 3, null);

-- =============================================
-- VENTAS_PRODUCTOS (Sales Items)
-- =============================================
INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
-- Venta 1
(1, 1, 1, 85.00, 85.00),
-- Venta 2
(2, 5, 1, 120.00, 120.00),
-- Venta 3
(3, 9, 1, 95.00, 95.00),
-- Venta 4
(4, 2, 1, 70.00, 70.00),
-- Venta 5
(5, 7, 1, 150.00, 150.00),
-- Venta 6
(6, 11, 1, 65.00, 65.00),
-- Venta 7
(7, 6, 1, 110.00, 110.00),
-- Venta 8
(8, 13, 1, 180.00, 180.00),
-- Venta 9
(9, 9, 1, 95.00, 95.00),
-- Venta 10
(10, 4, 1, 75.00, 75.00),
-- Venta 11
(11, 8, 1, 135.00, 135.00),
-- Venta 12
(12, 14, 1, 60.00, 60.00),
-- Venta 13
(13, 1, 1, 85.00, 85.00),
-- Venta 14
(14, 10, 1, 140.00, 140.00),
-- Venta 15
(15, 5, 1, 120.00, 120.00),
-- Venta 16
(16, 9, 1, 95.00, 95.00),
-- Venta 17
(17, 7, 1, 150.00, 150.00),
-- Venta 18
(18, 2, 1, 70.00, 70.00),
-- Venta 19
(19, 1, 1, 85.00, 85.00),
-- Venta 20
(20, 6, 1, 110.00, 110.00),
-- Venta 21
(21, 13, 1, 180.00, 180.00),
-- Venta 22
(22, 11, 1, 65.00, 65.00),
-- Venta 23
(23, 9, 1, 95.00, 95.00),
-- Venta 24
(24, 8, 1, 135.00, 135.00),
-- Venta 25
(25, 4, 1, 75.00, 75.00),
-- Venta 26
(26, 5, 1, 120.00, 120.00),
-- Venta 27
(27, 1, 1, 85.00, 85.00),
-- Venta 28
(28, 7, 1, 150.00, 150.00),
-- Venta 29
(29, 9, 1, 95.00, 95.00),
-- Venta 30
(30, 2, 1, 70.00, 70.00);

-- =============================================
-- GASTOS (Expenses)
-- =============================================
INSERT INTO gastos (descripcion, categoria, monto, fecha) VALUES
('Compra de 200 rosas rojas al proveedor', 'flores', 280.00, '2026-03-02'),
('Transporte de mercadería desde el mercado', 'transporte', 35.00, '2026-03-05'),
('Papel decorativo dorado x10 rollos', 'materiales', 85.00, '2026-03-08'),
('Mantenimiento del refrigerador de flores', 'mantenimiento', 150.00, '2026-03-10'),
('Compra de 100 girasoles', 'flores', 120.00, '2026-03-11'),
('Cintas y lazos decorativos', 'materiales', 45.00, '2026-03-12'),
('Gasolina para delivery', 'transporte', 50.00, '2026-03-13'),
('Cajas decorativas x20 unidades', 'materiales', 240.00, '2026-03-14'),
('Compra de tulipanes importados', 'flores', 180.00, '2026-03-15');

-- =============================================
-- CAJA (Cash Register)
-- =============================================
INSERT INTO caja (fecha, monto_apertura, monto_cierre, total_efectivo, total_digital, total_tarjeta, total_ventas, total_gastos, trabajador_apertura_id, trabajador_cierre_id, estado) VALUES
('2026-03-01', 100.00, 305.00, 120.00, 85.00, 0.00, 205.00, 0.00, 2, 2, 'cerrada'),
('2026-03-02', 100.00, 265.00, 0.00, 95.00, 0.00, 165.00, 280.00, 2, 2, 'cerrada'),
('2026-03-03', 100.00, 315.00, 65.00, 0.00, 150.00, 215.00, 0.00, 2, 2, 'cerrada'),
('2026-03-04', 100.00, 390.00, 0.00, 110.00, 0.00, 290.00, 0.00, 2, 2, 'cerrada'),
('2026-03-05', 100.00, 270.00, 75.00, 95.00, 0.00, 170.00, 35.00, 2, 2, 'cerrada'),
('2026-03-16', 100.00, null, 0.00, 0.00, 0.00, 0.00, 0.00, 2, null, 'abierta');

-- =============================================
-- ARREGLOS (Custom Arrangements)
-- =============================================
INSERT INTO arreglos (nombre, margen, costo_total, precio_venta) VALUES
('Ramo personalizado primavera', 40, 45.50, 75.83),
('Arreglo romántico especial', 45, 62.00, 112.73),
('Bouquet tropical deluxe', 35, 58.20, 89.54);

-- =============================================
-- ARREGLOS_INVENTARIO (Arrangement Recipes)
-- =============================================
INSERT INTO arreglos_inventario (arreglo_id, inventario_id, cantidad) VALUES
-- Arreglo 1: Ramo personalizado primavera
(1, 1, 6),  -- 6 rosas rojas
(1, 5, 4),  -- 4 girasoles
(1, 11, 1), -- 1 papel dorado
(1, 14, 1), -- 1 cinta satinada

-- Arreglo 2: Arreglo romántico especial
(2, 1, 12), -- 12 rosas rojas
(2, 4, 3),  -- 3 lirios blancos
(2, 10, 2), -- 2 eucaliptos
(2, 18, 1), -- 1 caja decorativa pequeña
(2, 14, 1), -- 1 cinta satinada

-- Arreglo 3: Bouquet tropical deluxe
(3, 8, 3),  -- 3 orquídeas
(3, 4, 2),  -- 2 lirios blancos
(3, 10, 3), -- 3 eucaliptos
(3, 13, 1), -- 1 papel kraft
(3, 15, 1); -- 1 cinta de organza

-- =============================================
-- PROMOCIONES (Promotions)
-- =============================================
INSERT INTO promociones (titulo, descripcion, descuento, tipo, fecha_desde, fecha_hasta, activa) VALUES
('20% de descuento en ramos de rosas', 'Válido para ramos de 12 rosas en adelante', 20, 'porcentaje', '2026-03-01', '2026-03-31', true),
('Día de la Madre - Precio especial', 'Arreglos florales con cinta dorada gratis', 0, 'regalo', '2026-05-01', '2026-05-11', true),
('2x1 en peluches medianos', 'Lleva 2 peluches al precio de 1', 50, '2x1', '2026-03-15', '2026-03-30', true),
('Descuento en arreglos tropicales', '15% de descuento en arreglos con flores exóticas', 15, 'porcentaje', '2026-03-10', '2026-03-25', true);

-- =============================================
-- EVENTOS (Special Events)
-- =============================================
INSERT INTO eventos (nombre, descripcion, emoji, fecha, color, activo) VALUES
('San Valentín', 'Arreglos especiales y dedicatorias románticas', '💕', '2027-02-14', 'rosa', false),
('Día de la Madre', 'Honra a mamá con el arreglo perfecto', '🌹', '2026-05-10', 'dorado', true),
('Día del Amor y la Amistad', 'Celebra con flores para tus seres queridos', '💐', '2026-07-23', 'morado', true),
('Día de la Primavera', 'Flores frescas de temporada', '🌸', '2026-09-23', 'rosa', true),
('Navidad', 'Arreglos navideños y centros de mesa', '🎄', '2026-12-25', 'rojo', true),
('Aniversarios', 'Sorprende a quien más quieres con un arreglo único', '💕', null, 'rosa', true);

-- =============================================
-- SEED DATA COMPLETE
-- =============================================

-- Verify data inserted
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'inventario', COUNT(*) FROM inventario
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL
SELECT 'ventas_productos', COUNT(*) FROM ventas_productos
UNION ALL
SELECT 'gastos', COUNT(*) FROM gastos
UNION ALL
SELECT 'caja', COUNT(*) FROM caja
UNION ALL
SELECT 'arreglos', COUNT(*) FROM arreglos
UNION ALL
SELECT 'arreglos_inventario', COUNT(*) FROM arreglos_inventario
UNION ALL
SELECT 'promociones', COUNT(*) FROM promociones
UNION ALL
SELECT 'eventos', COUNT(*) FROM eventos;
