/**
 * Task 20: Database Integrity and Constraints Verification
 * Requirements: 24.3, 24.4, 24.5, 24.6, 24.7, 24.8
 *
 * Verifies that the database schema enforces the required constraints
 * and that the service layer properly uses transactions with rollback.
 */

const fs = require('fs');
const path = require('path');

// Read the schema file for static analysis
const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// =============================================
// FOREIGN KEY CONSTRAINTS (Requirement 24.3)
// =============================================

describe('Foreign Key Constraints (Requirement 24.3)', () => {
  it('ventas.trabajador_id references usuarios ON DELETE SET NULL', () => {
    const ventasSection = schema.substring(
      schema.indexOf('-- VENTAS (Sales)'),
      schema.indexOf('-- VENTAS_PRODUCTOS')
    );
    expect(ventasSection).toMatch(/trabajador_id\s+INTEGER\s+REFERENCES\s+usuarios\(id\)\s+ON DELETE SET NULL/i);
  });

  it('ventas.cliente_id references clientes ON DELETE SET NULL', () => {
    const ventasSection = schema.substring(
      schema.indexOf('-- VENTAS (Sales)'),
      schema.indexOf('-- VENTAS_PRODUCTOS')
    );
    expect(ventasSection).toMatch(/cliente_id\s+INTEGER\s+REFERENCES\s+clientes\(id\)\s+ON DELETE SET NULL/i);
  });

  it('pedidos.cliente_id references clientes ON DELETE SET NULL', () => {
    const pedidosSection = schema.substring(
      schema.indexOf('-- PEDIDOS (Orders)'),
      schema.indexOf('-- VENTAS (Sales)')
    );
    expect(pedidosSection).toMatch(/cliente_id\s+INTEGER\s+REFERENCES\s+clientes\(id\)\s+ON DELETE SET NULL/i);
  });

  it('pedidos.trabajador_id references usuarios ON DELETE SET NULL', () => {
    const pedidosSection = schema.substring(
      schema.indexOf('-- PEDIDOS (Orders)'),
      schema.indexOf('-- VENTAS (Sales)')
    );
    expect(pedidosSection).toMatch(/trabajador_id\s+INTEGER\s+REFERENCES\s+usuarios\(id\)\s+ON DELETE SET NULL/i);
  });

  it('ventas_productos.venta_id references ventas ON DELETE CASCADE', () => {
    const vpSection = schema.substring(
      schema.indexOf('-- VENTAS_PRODUCTOS'),
      schema.indexOf('-- GASTOS')
    );
    expect(vpSection).toMatch(/venta_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+ventas\(id\)\s+ON DELETE CASCADE/i);
  });

  it('ventas_productos.producto_id references productos ON DELETE RESTRICT', () => {
    const vpSection = schema.substring(
      schema.indexOf('-- VENTAS_PRODUCTOS'),
      schema.indexOf('-- GASTOS')
    );
    expect(vpSection).toMatch(/producto_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+productos\(id\)\s+ON DELETE RESTRICT/i);
  });

  it('arreglos_inventario.arreglo_id references arreglos ON DELETE CASCADE', () => {
    const aiSection = schema.substring(
      schema.indexOf('-- ARREGLOS_INVENTARIO'),
      schema.indexOf('-- PROMOCIONES')
    );
    expect(aiSection).toMatch(/arreglo_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+arreglos\(id\)\s+ON DELETE CASCADE/i);
  });

  it('arreglos_inventario.inventario_id references inventario ON DELETE RESTRICT', () => {
    const aiSection = schema.substring(
      schema.indexOf('-- ARREGLOS_INVENTARIO'),
      schema.indexOf('-- PROMOCIONES')
    );
    expect(aiSection).toMatch(/inventario_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+inventario\(id\)\s+ON DELETE RESTRICT/i);
  });

  it('caja.trabajador_apertura_id references usuarios ON DELETE SET NULL', () => {
    const cajaSection = schema.substring(
      schema.indexOf('-- CAJA (Cash Register)'),
      schema.indexOf('-- ARREGLOS (Custom')
    );
    expect(cajaSection).toMatch(/trabajador_apertura_id\s+INTEGER\s+REFERENCES\s+usuarios\(id\)\s+ON DELETE SET NULL/i);
  });

  it('caja.trabajador_cierre_id references usuarios ON DELETE SET NULL', () => {
    const cajaSection = schema.substring(
      schema.indexOf('-- CAJA (Cash Register)'),
      schema.indexOf('-- ARREGLOS (Custom')
    );
    expect(cajaSection).toMatch(/trabajador_cierre_id\s+INTEGER\s+REFERENCES\s+usuarios\(id\)\s+ON DELETE SET NULL/i);
  });
});

// =============================================
// CHECK CONSTRAINTS (Requirement 24.4)
// =============================================

describe('Check Constraints on Numeric Fields (Requirement 24.4)', () => {
  it('productos.precio has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_precio_positivo\s+CHECK\s*\(\s*precio\s*>=\s*0\s*\)/i);
  });

  it('productos.costo has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_costo_positivo\s+CHECK\s*\(\s*costo\s*>=\s*0\s*\)/i);
  });

  it('productos.stock has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_stock_positivo\s+CHECK\s*\(\s*stock\s*>=\s*0\s*\)/i);
  });

  it('inventario.stock has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_inv_stock_positivo\s+CHECK\s*\(\s*stock\s*>=\s*0\s*\)/i);
  });

  it('inventario.costo has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_inv_costo_positivo\s+CHECK\s*\(\s*costo\s*>=\s*0\s*\)/i);
  });

  it('gastos.monto has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_gasto_monto_positivo\s+CHECK\s*\(\s*monto\s*>=\s*0\s*\)/i);
  });

  it('promociones.descuento has CHECK constraint BETWEEN 0 AND 100', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_promo_descuento\s+CHECK\s*\(\s*descuento\s*>=\s*0\s+AND\s+descuento\s*<=\s*100\s*\)/i);
  });

  it('arreglos.margen has CHECK constraint BETWEEN 0 AND 100', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_arreglo_margen\s+CHECK\s*\(\s*margen\s*>=\s*0\s+AND\s+margen\s*<=\s*100\s*\)/i);
  });

  it('ventas_productos.cantidad has CHECK constraint > 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_vp_cantidad_positiva\s+CHECK\s*\(\s*cantidad\s*>\s*0\s*\)/i);
  });

  it('ventas_productos.precio_unitario has CHECK constraint >= 0', () => {
    expect(schema).toMatch(/CONSTRAINT\s+chk_vp_precio_positivo\s+CHECK\s*\(\s*precio_unitario\s*>=\s*0\s*\)/i);
  });
});

// =============================================
// UNIQUE CONSTRAINTS (Requirements 24.5, 24.6)
// =============================================

describe('Unique Constraints (Requirements 24.5, 24.6)', () => {
  it('usuarios.email has UNIQUE constraint (Requirement 24.5)', () => {
    const usuariosSection = schema.substring(
      schema.indexOf('-- USUARIOS'),
      schema.indexOf('-- PRODUCTOS')
    );
    expect(usuariosSection).toMatch(/email\s+VARCHAR\([^)]+\)\s+UNIQUE\s+NOT NULL/i);
  });

  it('caja.fecha has UNIQUE constraint (Requirement 24.6)', () => {
    const cajaSection = schema.substring(
      schema.indexOf('-- CAJA (Cash Register)'),
      schema.indexOf('-- ARREGLOS (Custom')
    );
    expect(cajaSection).toMatch(/fecha\s+DATE\s+NOT NULL\s+UNIQUE/i);
  });
});

// =============================================
// RESTRICT CONSTRAINT (Requirement 24.7)
// =============================================

describe('RESTRICT Constraint on ventas_productos.producto_id (Requirement 24.7)', () => {
  it('prevents product deletion when referenced in ventas_productos via RESTRICT', () => {
    const vpSection = schema.substring(
      schema.indexOf('-- VENTAS_PRODUCTOS'),
      schema.indexOf('-- GASTOS')
    );
    expect(vpSection).toMatch(/producto_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+productos\(id\)\s+ON DELETE RESTRICT/i);
  });
});

// =============================================
// CASCADE CONSTRAINTS (Requirement 24.8)
// =============================================

describe('CASCADE Constraints (Requirement 24.8)', () => {
  it('deletes ventas_productos records when parent venta is deleted (CASCADE)', () => {
    const vpSection = schema.substring(
      schema.indexOf('-- VENTAS_PRODUCTOS'),
      schema.indexOf('-- GASTOS')
    );
    expect(vpSection).toMatch(/venta_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+ventas\(id\)\s+ON DELETE CASCADE/i);
  });

  it('deletes arreglos_inventario records when parent arreglo is deleted (CASCADE)', () => {
    const aiSection = schema.substring(
      schema.indexOf('-- ARREGLOS_INVENTARIO'),
      schema.indexOf('-- PROMOCIONES')
    );
    expect(aiSection).toMatch(/arreglo_id\s+INTEGER\s+NOT NULL\s+REFERENCES\s+arreglos\(id\)\s+ON DELETE CASCADE/i);
  });
});

// =============================================
// TRANSACTION ROLLBACK (Requirements 24.1, 24.2)
// =============================================

describe('Transaction Rollback on Errors (Requirements 24.1, 24.2)', () => {
  const { query, getClient } = require('../config/database');
  jest.mock('../config/database');

  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    getClient.mockResolvedValue(mockClient);
  });

  describe('VentasService', () => {
    const VentasService = require('./ventas.service');

    it('rolls back when product not found', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // product not found

      await expect(
        VentasService.create(
          { productos: [{ producto_id: 999, cantidad: 1, precio_unitario: 10 }], metodo_pago: 'Efectivo' },
          1
        )
      ).rejects.toThrow();

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('rolls back when stock is insufficient', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Ramo', stock: 0 }] });

      await expect(
        VentasService.create(
          { productos: [{ producto_id: 1, cantidad: 5, precio_unitario: 10 }], metodo_pago: 'Efectivo' },
          1
        )
      ).rejects.toThrow('Stock insuficiente');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('rolls back when a DB error occurs mid-transaction', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Ramo', stock: 10 }] }) // stock ok
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockRejectedValueOnce(new Error('DB constraint violation'));

      await expect(
        VentasService.create(
          { productos: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }], metodo_pago: 'Efectivo' },
          1
        )
      ).rejects.toThrow('DB constraint violation');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('commits and releases client on success', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Ramo', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, total: 10 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos
        .mockResolvedValueOnce(undefined) // UPDATE stock
        .mockResolvedValueOnce(undefined); // COMMIT

      await VentasService.create(
        { productos: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }], metodo_pago: 'Efectivo' },
        1
      );

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).not.toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('always releases the client even on error', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(
        VentasService.create(
          { productos: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }], metodo_pago: 'Efectivo' },
          1
        )
      ).rejects.toThrow();

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('ArreglosService', () => {
    const ArreglosService = require('./arreglos.service');

    it('rolls back when inventory item not found', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // inventory not found

      await expect(
        ArreglosService.create({ nombre: 'Test', margen: 30, items: [{ inventario_id: 999, cantidad: 2 }] })
      ).rejects.toThrow('Inventario con ID 999 no encontrado');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('rolls back when a DB error occurs during arrangement creation', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, costo: 10 }] }) // inventory found
        .mockRejectedValueOnce(new Error('DB insert error'));

      await expect(
        ArreglosService.create({ nombre: 'Test', margen: 30, items: [{ inventario_id: 1, cantidad: 2 }] })
      ).rejects.toThrow('DB insert error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('always releases the client even on error', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(
        ArreglosService.create({ nombre: 'Test', margen: 30, items: [{ inventario_id: 1, cantidad: 2 }] })
      ).rejects.toThrow();

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('commits and releases client on successful arrangement creation', async () => {
      const mockArreglo = { id: 1, nombre: 'Test', margen: 30, costo_total: 20, precio_venta: 26, items: [] };
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, costo: 10 }] }) // inventory found
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT arreglo
        .mockResolvedValueOnce(undefined) // INSERT arreglos_inventario
        .mockResolvedValueOnce(undefined); // COMMIT

      // getById is called after commit - mock the module-level query
      query.mockResolvedValueOnce({ rows: [mockArreglo] });

      await ArreglosService.create({ nombre: 'Test', margen: 30, items: [{ inventario_id: 1, cantidad: 2 }] });

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).not.toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
