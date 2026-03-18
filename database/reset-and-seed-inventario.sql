-- Script para limpiar productos/arreglos y poblar inventario con datos sintéticos
-- Ejecutar desde la carpeta database: psql -U postgres -d floreria_system_core -f reset-and-seed-inventario.sql

-- Limpiar datos existentes
DELETE FROM arreglos_inventario;
DELETE FROM arreglos;
DELETE FROM productos;
DELETE FROM inventario;

-- Resetear secuencias
ALTER SEQUENCE inventario_id_seq RESTART WITH 1;
ALTER SEQUENCE productos_id_seq RESTART WITH 1;
ALTER SEQUENCE arreglos_id_seq RESTART WITH 1;

-- Poblar inventario con datos sintéticos
INSERT INTO inventario (nombre, tipo, stock, costo, unidad, proveedor, activo) VALUES
-- Flores
('Rosas rojas', 'flores', 50, 3.50, 'unidad', 'Flores del Valle', true),
('Rosas rosadas', 'flores', 40, 3.00, 'unidad', 'Flores del Valle', true),
('Lirios blancos', 'flores', 30, 4.20, 'unidad', 'Flores Premium', true),
('Girasoles', 'flores', 35, 2.80, 'unidad', 'Flores del Campo', true),
('Tulipanes', 'flores', 25, 3.80, 'unidad', 'Flores Premium', true),
('Margaritas', 'flores', 45, 1.50, 'unidad', 'Flores del Campo', true),
('Orquídeas', 'flores', 15, 8.50, 'unidad', 'Flores Premium', true),
('Claveles', 'flores', 60, 1.80, 'unidad', 'Flores del Valle', true),

-- Materiales
('Papel decorativo dorado', 'materiales', 20, 8.50, 'unidad', 'Papelería Central', true),
('Papel decorativo rosa', 'materiales', 18, 7.00, 'unidad', 'Papelería Central', true),
('Cinta satinada roja', 'materiales', 30, 4.00, 'metro', 'Papelería Central', true),
('Cinta satinada dorada', 'materiales', 25, 4.50, 'metro', 'Papelería Central', true),
('Celofán transparente', 'materiales', 40, 2.50, 'metro', 'Papelería Central', true),
('Moño decorativo', 'materiales', 35, 3.00, 'unidad', 'Papelería Central', true),

-- Accesorios
('Caja decorativa pequeña', 'accesorios', 15, 12.00, 'unidad', 'Empaques Perú', true),
('Caja decorativa mediana', 'accesorios', 12, 18.00, 'unidad', 'Empaques Perú', true),
('Caja corazón', 'accesorios', 8, 25.00, 'unidad', 'Empaques Perú', true),
('Tarjeta de dedicatoria', 'accesorios', 100, 0.50, 'unidad', 'Papelería Central', true),
('Peluche pequeño', 'accesorios', 20, 15.00, 'unidad', 'Juguetería Feliz', true),
('Globo metalizado corazón', 'accesorios', 25, 8.00, 'unidad', 'Globos Party', true);

-- Mensaje de confirmación
SELECT 'Inventario poblado con ' || COUNT(*) || ' items' as resultado FROM inventario;
SELECT 'Productos eliminados: OK' as resultado;
SELECT 'Arreglos eliminados: OK' as resultado;
