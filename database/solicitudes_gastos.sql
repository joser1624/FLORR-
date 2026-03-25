-- Tabla para solicitudes de gastos con aprobación
-- Los empleados crean solicitudes que deben ser aprobadas por admin

CREATE TABLE IF NOT EXISTS solicitudes_gastos (
  id SERIAL PRIMARY KEY,
  trabajador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  caja_id INTEGER NOT NULL REFERENCES caja(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('flores', 'transporte', 'materiales', 'mantenimiento', 'otros')),
  descripcion TEXT NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  numero_comprobante VARCHAR(100) NOT NULL,
  fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_aprobacion TIMESTAMP,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  comentario_rechazo TEXT,
  aprobado_por_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_solicitudes_gastos_trabajador ON solicitudes_gastos(trabajador_id);
CREATE INDEX idx_solicitudes_gastos_caja ON solicitudes_gastos(caja_id);
CREATE INDEX idx_solicitudes_gastos_estado ON solicitudes_gastos(estado);
CREATE INDEX idx_solicitudes_gastos_fecha ON solicitudes_gastos(fecha_solicitud);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_solicitudes_gastos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solicitudes_gastos_updated_at
  BEFORE UPDATE ON solicitudes_gastos
  FOR EACH ROW
  EXECUTE FUNCTION update_solicitudes_gastos_updated_at();

-- Comentarios
COMMENT ON TABLE solicitudes_gastos IS 'Solicitudes de gastos creadas por empleados que requieren aprobación de admin';
COMMENT ON COLUMN solicitudes_gastos.estado IS 'Estado de la solicitud: pendiente, aprobada, rechazada';
COMMENT ON COLUMN solicitudes_gastos.fecha_solicitud IS 'Fecha y hora en que el empleado creó la solicitud';
COMMENT ON COLUMN solicitudes_gastos.fecha_aprobacion IS 'Fecha y hora en que el admin aprobó/rechazó la solicitud';
