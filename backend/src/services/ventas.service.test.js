const VentasService = require('./ventas.service');
const { query, getClient } = require('../config/database');

// Mock the database module
jest.mock('../config/database');

describe('VentasService', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock client for transactions
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    
    getClient.mockResolvedValue(mockClient);
  });

  describe('getAll', () => {
    it('should return all ventas without filters', async () => {
      const mockVentas = [
        { id: 1, total: 100, metodo_pago: 'Efectivo' },
        { id: 2, total: 200, metodo_pago: 'Yape' }
      ];
      
      query.mockResolvedValue({ rows: mockVentas });

      const result = await VentasService.getAll();

      expect(result).toEqual(mockVentas);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM ventas WHERE 1=1'),
        []
      );
    });

    it('should filter by fecha', async () => {
      query.mockResolvedValue({ rows: [] });

      await VentasService.getAll({ fecha: '2024-03-16' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(fecha) = $1'),
        ['2024-03-16']
      );
    });

    it('should filter by metodo_pago', async () => {
      query.mockResolvedValue({ rows: [] });

      await VentasService.getAll({ metodo_pago: 'Efectivo' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('metodo_pago = $1'),
        ['Efectivo']
      );
    });

    it('should filter by trabajador_id', async () => {
      query.mockResolvedValue({ rows: [] });

      await VentasService.getAll({ trabajador_id: 1 });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('trabajador_id = $1'),
        [1]
      );
    });

    it('should apply multiple filters', async () => {
      query.mockResolvedValue({ rows: [] });

      await VentasService.getAll({ 
        fecha: '2024-03-16', 
        metodo_pago: 'Efectivo',
        trabajador_id: 1
      });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(fecha) = $1'),
        ['2024-03-16', 'Efectivo', 1]
      );
    });
  });

  describe('getById', () => {
    it('should return venta with productos details', async () => {
      const mockVenta = { id: 1, total: 100, metodo_pago: 'Efectivo' };
      const mockProductos = [
        { id: 1, producto_id: 1, cantidad: 2, precio_unitario: 50, producto_nombre: 'Ramo' }
      ];

      query
        .mockResolvedValueOnce({ rows: [mockVenta] })
        .mockResolvedValueOnce({ rows: mockProductos });

      const result = await VentasService.getById(1);

      expect(result).toEqual({ ...mockVenta, productos: mockProductos });
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('should return null if venta not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await VentasService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validVentaData = {
      productos: [
        { producto_id: 1, cantidad: 2, precio_unitario: 50 }
      ],
      metodo_pago: 'Efectivo',
      trabajador_id: 1
    };

    it('should throw error if productos array is empty', async () => {
      await expect(
        VentasService.create({ ...validVentaData, productos: [] })
      ).rejects.toThrow('La venta debe incluir al menos un producto');
    });

    it('should throw error if productos is not an array', async () => {
      await expect(
        VentasService.create({ ...validVentaData, productos: null })
      ).rejects.toThrow('La venta debe incluir al menos un producto');
    });

    it('should throw error if metodo_pago is invalid', async () => {
      await expect(
        VentasService.create({ ...validVentaData, metodo_pago: 'Bitcoin' })
      ).rejects.toThrow('El método de pago debe ser uno de');
    });

    it('should accept all valid metodos_pago', async () => {
      const validMetodos = ['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia bancaria'];
      
      for (const metodo of validMetodos) {
        mockClient.query
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto', stock: 10 }] }) // Stock check
          .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
          .mockResolvedValueOnce(undefined) // INSERT ventas_productos
          .mockResolvedValueOnce(undefined) // UPDATE stock
          .mockResolvedValueOnce(undefined); // COMMIT

        query.mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getById venta
          .mockResolvedValueOnce({ rows: [] }); // getById productos

        await VentasService.create({ ...validVentaData, metodo_pago: metodo });
      }
    });

    it('should throw error if trabajador_id is missing', async () => {
      await expect(
        VentasService.create({ ...validVentaData, trabajador_id: null })
      ).rejects.toThrow('El trabajador_id es requerido');
    });

    it('should throw error if product not found', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // Stock check - product not found

      await expect(
        VentasService.create(validVentaData)
      ).rejects.toThrow('Producto con ID 1 no encontrado');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if insufficient stock', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Ramo', stock: 1 }] }); // Stock check - insufficient

      await expect(
        VentasService.create(validVentaData)
      ).rejects.toThrow('Stock insuficiente para Ramo');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should calculate total correctly', async () => {
      const ventaData = {
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 50 },
          { producto_id: 2, cantidad: 3, precio_unitario: 30 }
        ],
        metodo_pago: 'Efectivo',
        trabajador_id: 1
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto 1', stock: 10 }] }) // Stock check 1
        .mockResolvedValueOnce({ rows: [{ id: 2, nombre: 'Producto 2', stock: 10 }] }) // Stock check 2
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos 1
        .mockResolvedValueOnce(undefined) // UPDATE stock 1
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos 2
        .mockResolvedValueOnce(undefined) // UPDATE stock 2
        .mockResolvedValueOnce(undefined); // COMMIT

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getById venta
        .mockResolvedValueOnce({ rows: [] }); // getById productos

      await VentasService.create(ventaData);

      // Check that total was calculated as 2*50 + 3*30 = 190
      const insertVentaCall = mockClient.query.mock.calls.find(
        call => call[0].includes('INSERT INTO ventas')
      );
      expect(insertVentaCall[1][0]).toBe(190); // total parameter
    });

    it('should create ventas_productos records for each product', async () => {
      const ventaData = {
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 50 },
          { producto_id: 2, cantidad: 1, precio_unitario: 30 }
        ],
        metodo_pago: 'Efectivo',
        trabajador_id: 1
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto 1', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2, nombre: 'Producto 2', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos 1
        .mockResolvedValueOnce(undefined) // UPDATE stock 1
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos 2
        .mockResolvedValueOnce(undefined) // UPDATE stock 2
        .mockResolvedValueOnce(undefined); // COMMIT

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.create(ventaData);

      // Check ventas_productos inserts
      const ventasProductosInserts = mockClient.query.mock.calls.filter(
        call => call[0].includes('INSERT INTO ventas_productos')
      );
      expect(ventasProductosInserts).toHaveLength(2);
    });

    it('should deduct stock for each product', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos
        .mockResolvedValueOnce(undefined) // UPDATE stock
        .mockResolvedValueOnce(undefined); // COMMIT

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.create(validVentaData);

      const stockUpdate = mockClient.query.mock.calls.find(
        call => call[0].includes('UPDATE productos SET stock')
      );
      expect(stockUpdate).toBeDefined();
      expect(stockUpdate[1]).toEqual([2, 1]); // cantidad, producto_id
    });

    it('should update cliente updated_at if cliente_id provided', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos
        .mockResolvedValueOnce(undefined) // UPDATE stock
        .mockResolvedValueOnce(undefined) // UPDATE cliente
        .mockResolvedValueOnce(undefined); // COMMIT

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.create({ ...validVentaData, cliente_id: 5 });

      const clienteUpdate = mockClient.query.mock.calls.find(
        call => call[0].includes('UPDATE clientes')
      );
      expect(clienteUpdate).toBeDefined();
      expect(clienteUpdate[1]).toEqual([5]);
    });

    it('should not update cliente if cliente_id not provided', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined) // INSERT ventas_productos
        .mockResolvedValueOnce(undefined) // UPDATE stock
        .mockResolvedValueOnce(undefined); // COMMIT

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.create(validVentaData);

      const clienteUpdate = mockClient.query.mock.calls.find(
        call => call[0].includes('UPDATE clientes')
      );
      expect(clienteUpdate).toBeUndefined();
    });

    it('should commit transaction on success', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined); // COMMIT

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.create(validVentaData);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        VentasService.create(validVentaData)
      ).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update venta metodo_pago and cliente_id', async () => {
      const mockUpdated = { id: 1, metodo_pago: 'Yape', cliente_id: 5 };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await VentasService.update(1, { 
        metodo_pago: 'Yape', 
        cliente_id: 5 
      });

      expect(result).toEqual(mockUpdated);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ventas'),
        ['Yape', 5, 1]
      );
    });
  });

  describe('delete', () => {
    it('should delete venta', async () => {
      query.mockResolvedValue({ rows: [] });

      await VentasService.delete(1);

      expect(query).toHaveBeenCalledWith(
        'DELETE FROM ventas WHERE id = $1',
        [1]
      );
    });
  });
});
