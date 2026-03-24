-- =============================================
-- FLORERÍA ENCANTOS ETERNOS - DATABASE SCHEMA
-- PostgreSQL 14+
-- =============================================

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS movimientos_capital CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;
DROP TABLE IF EXISTS arreglos_inventario CASCADE;
DROP TABLE IF EXISTS arreglos CASCADE;
DROP TABLE IF EXISTS ventas_productos CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS caja CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- =============================================
-- USUARIOS (Workers/Employees)
-- =============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    cargo VARCHAR(100) NOT NULL, -- Vendedor/a, Florista, Delivery, Administrador/a
    rol VARCHAR(50) NOT NULL DEFAULT 'empleado', -- admin, empleado, duena
    fecha_ingreso DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =============================================
-- PRODUCTOS (Products)
-- =============================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL, -- Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros
    precio DECIMAL(10, 2) NOT NULL,
    costo DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    imagen_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_costo_positivo CHECK (costo >= 0),
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);

-- =============================================
-- INVENTARIO (Inventory - Flowers & Materials)
-- =============================================
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- flores, materiales, accesorios
    stock INTEGER NOT NULL DEFAULT 0,
    stock_min INTEGER DEFAULT 5,
    unidad VARCHAR(50) DEFAULT 'unidad', -- unidad, docena, metro, rollo, caja
    costo DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_inv_stock_positivo CHECK (stock >= 0),
    CONSTRAINT chk_inv_costo_positivo CHECK (costo >= 0)
);

CREATE INDEX idx_inventario_tipo ON inventario(tipo);
CREATE INDEX idx_inventario_stock ON inventario(stock);

-- =============================================
-- CLIENTES (Clients)
-- =============================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_telefono ON clientes(telefono);

-- =============================================
-- PEDIDOS (Orders)
-- =============================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    direccion TEXT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATE NOT NULL,
    descripcion TEXT NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    metodo_pago VARCHAR(100), -- Efectivo, Yape, Plin, Tarjeta, Transferencia bancaria
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- pendiente, en preparación, listo para entrega, entregado, cancelado
    trabajador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_pedido_total_positivo CHECK (total >= 0)
);

CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha_entrega ON pedidos(fecha_entrega);
CREATE INDEX idx_pedidos_cliente_telefono ON pedidos(cliente_telefono);
CREATE INDEX idx_pedidos_trabajador ON pedidos(trabajador_id);

-- =============================================
-- VENTAS (Sales)
-- =============================================
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    metodo_pago VARCHAR(100) NOT NULL, -- Efectivo, Yape, Plin, Tarjeta, Transferencia bancaria
    trabajador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_venta_total_positivo CHECK (total >= 0)
);

CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_trabajador ON ventas(trabajador_id);
CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago);

-- =============================================
-- VENTAS_PRODUCTOS (Sales Items - Junction Table)
-- =============================================
CREATE TABLE ventas_productos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vp_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_vp_precio_positivo CHECK (precio_unitario >= 0),
    CONSTRAINT chk_vp_subtotal_positivo CHECK (subtotal >= 0)
);

CREATE INDEX idx_ventas_productos_venta ON ventas_productos(venta_id);
CREATE INDEX idx_ventas_productos_producto ON ventas_productos(producto_id);

-- =============================================
-- GASTOS (Expenses)
-- =============================================
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- flores, transporte, materiales, mantenimiento, otros
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_gasto_monto_positivo CHECK (monto >= 0)
);

CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);

-- =============================================
-- CAJA (Cash Register)
-- =============================================
CREATE TABLE caja (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    monto_apertura DECIMAL(10, 2) NOT NULL DEFAULT 0,
    monto_cierre DECIMAL(10, 2),
    total_efectivo DECIMAL(10, 2) DEFAULT 0,
    total_digital DECIMAL(10, 2) DEFAULT 0,
    total_tarjeta DECIMAL(10, 2) DEFAULT 0,
    total_ventas DECIMAL(10, 2) DEFAULT 0,
    total_gastos DECIMAL(10, 2) DEFAULT 0,
    trabajador_apertura_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    trabajador_cierre_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'abierta', -- abierta, cerrada
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_caja_fecha ON caja(fecha);
CREATE INDEX idx_caja_estado ON caja(estado);

-- =============================================
-- ARREGLOS (Custom Arrangements)
-- =============================================
CREATE TABLE arreglos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    margen INTEGER NOT NULL, -- profit margin percentage
    costo_total DECIMAL(10, 2) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_arreglo_margen CHECK (margen >= 0 AND margen <= 100),
    CONSTRAINT chk_arreglo_costo_positivo CHECK (costo_total >= 0),
    CONSTRAINT chk_arreglo_precio_positivo CHECK (precio_venta >= 0)
);

-- =============================================
-- ARREGLOS_INVENTARIO (Arrangement Recipe - Junction Table)
-- =============================================
CREATE TABLE arreglos_inventario (
    id SERIAL PRIMARY KEY,
    arreglo_id INTEGER NOT NULL REFERENCES arreglos(id) ON DELETE CASCADE,
    inventario_id INTEGER NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ai_cantidad_positiva CHECK (cantidad > 0)
);

CREATE INDEX idx_arreglos_inventario_arreglo ON arreglos_inventario(arreglo_id);
CREATE INDEX idx_arreglos_inventario_inventario ON arreglos_inventario(inventario_id);

-- =============================================
-- PROMOCIONES (Promotions)
-- =============================================
CREATE TABLE promociones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    descuento INTEGER DEFAULT 0, -- percentage
    tipo VARCHAR(50) DEFAULT 'porcentaje', -- porcentaje, 2x1, precio_fijo, regalo
    fecha_desde DATE,
    fecha_hasta DATE,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_promo_descuento CHECK (descuento >= 0 AND descuento <= 100)
);

CREATE INDEX idx_promociones_activa ON promociones(activa);
CREATE INDEX idx_promociones_fechas ON promociones(fecha_desde, fecha_hasta);

-- =============================================
-- EVENTOS (Special Events)
-- =============================================
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    emoji VARCHAR(10),
    fecha DATE,
    color VARCHAR(50) DEFAULT 'rosa', -- rosa, dorado, rojo, morado
    activo BOOLEAN DEFAULT true,
    metadata JSONB, -- Información adicional: imagen, precios, productos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eventos_activo ON eventos(activo);
CREATE INDEX idx_eventos_fecha ON eventos(fecha);

-- =============================================
-- CONFIGURACION (System Configuration)
-- =============================================
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert capital inicial
INSERT INTO configuracion (clave, valor, descripcion)
VALUES ('capital_inicial', '10000.00', 'Capital inicial del negocio');

CREATE INDEX idx_configuracion_clave ON configuracion(clave);

-- =============================================
-- MOVIMIENTOS_CAPITAL (Capital Movements)
-- =============================================
CREATE TABLE movimientos_capital (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('aporte', 'retiro')),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    trabajador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimientos_capital_tipo ON movimientos_capital(tipo);
CREATE INDEX idx_movimientos_capital_fecha ON movimientos_capital(fecha);
CREATE INDEX idx_movimientos_capital_trabajador ON movimientos_capital(trabajador_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caja_updated_at BEFORE UPDATE ON caja
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arreglos_updated_at BEFORE UPDATE ON arreglos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promociones_updated_at BEFORE UPDATE ON promociones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movimientos_capital_updated_at BEFORE UPDATE ON movimientos_capital
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View: Ventas mensuales por trabajador
CREATE OR REPLACE VIEW ventas_mensuales_trabajador AS
SELECT 
    t.id as trabajador_id,
    t.nombre,
    DATE_TRUNC('month', v.fecha) as mes,
    COUNT(v.id) as total_ventas,
    COALESCE(SUM(v.total), 0) as monto_total
FROM usuarios t
LEFT JOIN ventas v ON t.id = v.trabajador_id
WHERE t.activo = true
GROUP BY t.id, t.nombre, DATE_TRUNC('month', v.fecha);

-- View: Stock bajo en inventario
CREATE OR REPLACE VIEW inventario_stock_bajo AS
SELECT 
    id,
    nombre,
    tipo,
    stock,
    stock_min,
    unidad,
    costo
FROM inventario
WHERE stock <= stock_min
ORDER BY stock ASC;

-- View: Pedidos pendientes
CREATE OR REPLACE VIEW pedidos_pendientes AS
SELECT 
    p.*,
    u.nombre as trabajador_nombre
FROM pedidos p
LEFT JOIN usuarios u ON p.trabajador_id = u.id
WHERE p.estado IN ('pendiente', 'en preparación')
ORDER BY p.fecha_entrega ASC;

-- =============================================
-- GRANT PERMISSIONS (adjust as needed)
-- =============================================

-- Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =============================================
-- SCHEMA CREATION COMPLETE
-- =============================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
