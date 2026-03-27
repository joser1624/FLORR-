-- Migration: Add tipo column to ventas_productos to support arreglos
-- This allows ventas_productos to reference both productos and arreglos

-- Add tipo column (default 'producto' for backward compatibility)
ALTER TABLE ventas_productos 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'producto';

-- Remove the FK constraint temporarily (we'll add a new one later)
-- Note: This might fail if there are existing constraints, adjust as needed
DO $$
BEGIN
    -- Try to drop the old foreign key if it exists
    ALTER TABLE ventas_productos DROP CONSTRAINT IF EXISTS ventas_productos_producto_id_fkey;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint did not exist or could not be dropped: %', SQLERRM;
END $$;

-- Add a more flexible constraint that allows both productos and arreglos
-- Or just leave it without FK for now to allow both types
COMMENT ON COLUMN ventas_productos.tipo IS 'Tipo de item: producto o arreglo';

-- Create a check constraint to validate tipo values
ALTER TABLE ventas_productos 
ADD CONSTRAINT chk_ventas_productos_tipo 
CHECK (tipo IN ('producto', 'arreglo'));

-- Create a function to get the referenced table based on tipo
-- (for reference, not used in the constraint)

-- Update existing rows to have 'producto' as default
UPDATE ventas_productos SET tipo = 'producto' WHERE tipo IS NULL;

-- Make tipo NOT NULL after the update
ALTER TABLE ventas_productos ALTER COLUMN tipo SET NOT NULL;

-- Add index on tipo for better query performance
CREATE INDEX IF NOT EXISTS idx_ventas_productos_tipo ON ventas_productos(tipo);
