-- =============================================
-- QUIEBRE DE CAJA (Cash Register Intermediate Cut)
-- Registro de cortes intermedios sin cerrar la caja
-- =============================================

CREATE TABLE IF NOT EXISTS caja_quiebre (
    id SERIAL PRIMARY KEY,
    caja_id INTEGER NOT NULL REFERENCES caja(id) ON DELETE CASCADE,
    trabajador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    monto_esperado DECIMAL(10, 2) NOT NULL,
    monto_fisico DECIMAL(10, 2),
    diferencia DECIMAL(10, 2) DEFAULT 0,
    total_efectivo_hasta_ahora DECIMAL(10, 2) DEFAULT 0,
    total_ventas_hasta_ahora DECIMAL(10, 2) DEFAULT 0,
    total_gastos_hasta_ahora DECIMAL(10, 2) DEFAULT 0,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_caja_quiebre_caja_id ON caja_quiebre(caja_id);
CREATE INDEX idx_caja_quiebre_fecha ON caja_quiebre(created_at);
