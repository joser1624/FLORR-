-- Agregar método de pago a gastos para distinguir qué gastos afectan la caja

-- Agregar columna metodo_pago
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo_caja';

-- Comentario para documentación
COMMENT ON COLUMN gastos.metodo_pago IS 'Método de pago del gasto: efectivo_caja, transferencia, tarjeta, no_aplica';

-- Actualizar gastos de merma existentes para que no afecten caja
UPDATE gastos 
SET metodo_pago = 'no_aplica' 
WHERE categoria = 'merma' AND metodo_pago = 'efectivo_caja';

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_gastos_metodo_pago ON gastos(metodo_pago);
