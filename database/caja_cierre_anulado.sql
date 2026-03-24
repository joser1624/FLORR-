-- Tabla para auditoría de cierres de caja anulados
-- Registra cada vez que un administrador anula un cierre de caja

CREATE TABLE IF NOT EXISTS caja_cierre_anulado (
  id SERIAL PRIMARY KEY,
  caja_id INTEGER NOT NULL REFERENCES caja(id) ON DELETE CASCADE,
  
  -- Datos del cierre anulado (snapshot)
  fecha_cierre TIMESTAMP NOT NULL,
  trabajador_cierre_id INTEGER REFERENCES usuarios(id),
  monto_cierre DECIMAL(10,2),
  total_efectivo DECIMAL(10,2),
  total_digital DECIMAL(10,2),
  total_tarjeta DECIMAL(10,2),
  total_ventas DECIMAL(10,2),
  total_gastos DECIMAL(10,2),
  
  -- Datos de la anulación
  anulado_por_id INTEGER NOT NULL REFERENCES usuarios(id),
  motivo_anulacion TEXT NOT NULL,
  fecha_anulacion TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_caja_cierre_anulado_caja ON caja_cierre_anulado(caja_id);
CREATE INDEX idx_caja_cierre_anulado_fecha ON caja_cierre_anulado(fecha_anulacion);
CREATE INDEX idx_caja_cierre_anulado_anulado_por ON caja_cierre_anulado(anulado_por_id);

COMMENT ON TABLE caja_cierre_anulado IS 'Auditoría de cierres de caja anulados por administradores';
COMMENT ON COLUMN caja_cierre_anulado.motivo_anulacion IS 'Razón por la cual se anuló el cierre';
COMMENT ON COLUMN caja_cierre_anulado.anulado_por_id IS 'Usuario administrador que anuló el cierre';
