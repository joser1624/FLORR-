const VentasService = require('./ventas.service');
const { query, getClient } = require('../config/database');

jest.mock('../config/database');

describe('VentasService', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    getClient.mockResolvedValue(mockClient);
  });

  describe('getAll', () => {
    it('should return paginated ventas without filters', async () => {
      const mockVentas = [
        { id: 1, total: 100, metodo_pago: 'Efectivo' },
        { id: 2, total: 200, metodo_pago: 'Yape' }
      ];
      query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({ rows: mockVentas });

      const result = await VentasService.getAll();

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockVentas);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should filter by fecha', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.getAll({ fecha: '2024-03-16' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(fecha) = $1'),
        expect.arrayContaining(['2024-03-16'])
      );
    });

    it('should filter by metodo_pago', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.getAll({ metodo_pago: 'Efectivo' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('metodo_pago = $1'),
        expect.arrayContaining(['Efectivo'])
      );
    });

    it('should filter by trabajador_id', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.getAll({ trabajador_id: 1 });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('trabajador_id = $1'),
        expect.arrayContaining([1])
      );
    });

    it('should apply multiple filters', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await VentasService.getAll({ fecha: '2024-03-16', metodo_pago: 'Efectivo', trabajador_id: 1 });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(fecha) = $1'),
        expect.arrayContaining(['2024-03-16', 'Efectivo', 1])
      );
    });
  });

  describe('getById', () => {
    it('should return venta with productos details', async () => {
      const mockVenta = { id: 1, total: 100, metodo_pago: 'Efectivo' };
      const mockProductos = [{ id: 1, producto_id: 1, cantidad: 2, precio_unitario: 50, producto_nombre: 'Ramo' }];

      query
        .mockResolvedValueOnce({ rows: [mockVenta] })
        .mockResolvedValueOnce({ rows: mockProductos });

      const result = await VentasService.getById(1);

      expect(result).toEqual({ ...mockVenta, productos: mockProductos });
    });

    it('should return null if venta not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await VentasService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validVentaData = {
      productos: [{ producto_id: 1, cantidad: 2, precio_unitario: 50 }],
      metodo_pago: 'Efectivo'
    };
    const trabajadorId = 1;

    it('should throw error if productos array is empty', async () => {
      await expect(VentasService.create({ ...validVentaData, productos: [] }, trabajadorId))
        .rejects.toThrow('El array de productos no puede estar vacío');
    });

    it('should throw error if metodo_pago is invalid', async () => {
      await expect(VentasService.create({ ...validVentaData, metodo_pago: 'Bitcoin' }, trabajadorId))
        .rejects.toThrow('Método de pago inválido');
    });

    it('should throw error if product not found', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // product not found

      await expect(VentasService.create(validVentaData, trabajadorId))
        .rejects.toThrow('Producto con ID 1 no encontrado');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if insufficient stock', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Ramo', stock: 1 }] }); // insufficient

      await expect(VentasService.create(validVentaData, trabajadorId))
        .rejects.toThrow('Stock insuficiente para el producto "Ramo"');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should calculate total correctly', async () => {
      const ventaData = {
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 50 },
          { producto_id: 2, cantidad: 3, precio_unitario: 30 }
        ],
        metodo_pago: 'Efectivo'
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'P1', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2, nombre: 'P2', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT venta
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined); // COMMIT

      await VentasService.create(ventaData, trabajadorId);

      const insertVentaCall = mockClient.query.mock.calls.find(call => call[0].includes('INSERT INTO ventas'));
      expect(insertVentaCall[1][0]).toBe(190); // 2*50 + 3*30
    });

    it('should commit transaction on success', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Producto', stock: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined); // COMMIT

      await VentasService.create(validVentaData, trabajadorId);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(VentasService.create(validVentaData, trabajadorId)).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete venta', async () => {
      query.mockResolvedValue({ rows: [] });

      await VentasService.delete(1);

      expect(query).toHaveBeenCalledWith('DELETE FROM ventas WHERE id = $1', [1]);
    });
  });
});
