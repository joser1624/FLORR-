-- Agregar campos para rastrear merma/pérdida en gastos
-- Esto permite saber exactamente qué se perdió y en qué cantidad

ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS inventario_id INTEGER REFERENCES inventario(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cantidad INTEGER,
ADD COLUMN IF NOT EXISTS item_nombre TEXT,
ADD COLUMN IF NOT EXISTS item_unidad VARCHAR(50);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_gastos_inventario_id ON gastos(inventario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_producto_id ON gastos(producto_id);

-- Comentarios para documentación
COMMENT ON COLUMN gastos.inventario_id IS 'ID del ítem de inventario perdido (para merma)';
COMMENT ON COLUMN gastos.producto_id IS 'ID del producto perdido (para merma)';
COMMENT ON COLUMN gastos.cantidad IS 'Cantidad perdida';
COMMENT ON COLUMN gastos.item_nombre IS 'Nombre del ítem perdido (guardado para historial)';
COMMENT ON COLUMN gastos.item_unidad IS 'Unidad del ítem perdido (guardado para historial)';
