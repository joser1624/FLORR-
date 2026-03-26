-- Agregar soporte para arreglos en ventas
-- Permite vender tanto productos como arreglos

-- 1. Agregar columna arreglo_id (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ventas_productos' AND column_name = 'arreglo_id'
  ) THEN
    ALTER TABLE ventas_productos 
    ADD COLUMN arreglo_id INTEGER REFERENCES arreglos(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Columna arreglo_id agregada a ventas_productos';
  ELSE
    RAISE NOTICE 'Columna arreglo_id ya existe';
  END IF;
END $$;

-- 2. Modificar producto_id para permitir NULL (cuando es arreglo)
ALTER TABLE ventas_productos 
ALTER COLUMN producto_id DROP NOT NULL;

-- 3. Agregar constraint para asegurar que haya producto_id O arreglo_id (no ambos, no ninguno)
ALTER TABLE ventas_productos 
DROP CONSTRAINT IF EXISTS ventas_productos_item_check;

ALTER TABLE ventas_productos 
ADD CONSTRAINT ventas_productos_item_check 
CHECK (
  (producto_id IS NOT NULL AND arreglo_id IS NULL) OR 
  (producto_id IS NULL AND arreglo_id IS NOT NULL)
);

-- Verificar cambios
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ventas_productos'
ORDER BY ordinal_position;
