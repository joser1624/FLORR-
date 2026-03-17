const pedidosService = require('./pedidos.service');
const { query } = require('../config/database');

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('PedidosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated pedidos without filters', async () => {
      const mockPedidos = [
        { id: 1, cliente_nombre: 'Juan Pérez', estado: 'pendiente' },
        { id: 2, cliente_nombre: 'María García', estado: 'entregado' }
      ];
      query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({ rows: mockPedidos });

      const result = await pedidosService.getAll();

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockPedidos);
      expect(result.total).toBe(2);
    });

    it('should filter by estado', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, estado: 'pendiente' }] });

      await pedidosService.getAll({ estado: 'pendiente' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('estado = $1'),
        expect.arrayContaining(['pendiente'])
      );
    });

    it('should filter by cliente_telefono', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await pedidosService.getAll({ cliente_telefono: '987654321' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('cliente_telefono = $1'),
        expect.arrayContaining(['987654321'])
      );
    });

    it('should filter by fecha_entrega', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await pedidosService.getAll({ fecha_entrega: '2024-03-20' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(fecha_entrega) = $1'),
        expect.arrayContaining(['2024-03-20'])
      );
    });

    it('should order pending orders by fecha_entrega ascending', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await pedidosService.getAll({ estado: 'pendiente' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY fecha_entrega ASC'),
        expect.any(Array)
      );
    });

    it('should order "en preparación" orders by fecha_entrega ascending', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await pedidosService.getAll({ estado: 'en preparación' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY fecha_entrega ASC'),
        expect.any(Array)
      );
    });
  });

  describe('getById', () => {
    it('should return pedido by id', async () => {
      const mockPedido = { id: 1, cliente_nombre: 'Juan Pérez' };
      query.mockResolvedValue({ rows: [mockPedido] });

      const result = await pedidosService.getById(1);

      expect(result).toEqual(mockPedido);
      expect(query).toHaveBeenCalledWith('SELECT * FROM pedidos WHERE id = $1', [1]);
    });
  });

  describe('create', () => {
    it('should create a pedido with valid data', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '987654321',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas',
        total: 150.00,
        trabajador_id: 1
      };
      const mockCreated = { id: 1, ...pedidoData, estado: 'pendiente' };
      query.mockResolvedValue({ rows: [mockCreated] });

      const result = await pedidosService.create(pedidoData);

      expect(result).toEqual(mockCreated);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pedidos'),
        expect.arrayContaining(['Juan Pérez', '987654321', 'Ramo de rosas rojas', 'pendiente'])
      );
    });

    it('should throw error if cliente_nombre is empty', async () => {
      await expect(pedidosService.create({ cliente_nombre: '', cliente_telefono: '987654321', fecha_entrega: '2024-03-20', descripcion: 'Test' }))
        .rejects.toThrow('cliente_nombre no puede estar vacío');
    });

    it('should throw error if cliente_telefono is empty', async () => {
      await expect(pedidosService.create({ cliente_nombre: 'Juan', cliente_telefono: '', fecha_entrega: '2024-03-20', descripcion: 'Test' }))
        .rejects.toThrow('cliente_telefono no puede estar vacío');
    });

    it('should throw error if fecha_entrega is missing', async () => {
      await expect(pedidosService.create({ cliente_nombre: 'Juan', cliente_telefono: '987654321', descripcion: 'Test' }))
        .rejects.toThrow('fecha_entrega no puede estar vacía');
    });

    it('should throw error if descripcion is empty', async () => {
      await expect(pedidosService.create({ cliente_nombre: 'Juan', cliente_telefono: '987654321', fecha_entrega: '2024-03-20', descripcion: '' }))
        .rejects.toThrow('descripcion no puede estar vacía');
    });
  });

  describe('update', () => {
    it('should update a pedido', async () => {
      const updateData = { estado: 'en preparación', descripcion: 'Updated' };
      const mockUpdated = { id: 1, ...updateData };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await pedidosService.update(1, updateData);

      expect(result).toEqual(mockUpdated);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE pedidos SET'),
        expect.arrayContaining(['en preparación', 'Updated', 1])
      );
    });

    it('should validate estado is valid', async () => {
      await expect(pedidosService.update(1, { estado: 'invalid_estado' }))
        .rejects.toThrow('estado debe ser uno de: pendiente, en preparación, listo para entrega, entregado, cancelado');
    });

    it('should accept all valid estados', async () => {
      const validEstados = ['pendiente', 'en preparación', 'listo para entrega', 'entregado', 'cancelado'];
      for (const estado of validEstados) {
        query.mockResolvedValue({ rows: [{ id: 1, estado }] });
        await expect(pedidosService.update(1, { estado })).resolves.toBeDefined();
      }
    });

    it('should update updated_at timestamp', async () => {
      query.mockResolvedValue({ rows: [{ id: 1, estado: 'entregado' }] });

      await pedidosService.update(1, { estado: 'entregado' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = CURRENT_TIMESTAMP'),
        expect.any(Array)
      );
    });

    it('should return existing pedido if no fields to update', async () => {
      const mockPedido = { id: 1, cliente_nombre: 'Juan Pérez' };
      query.mockResolvedValue({ rows: [mockPedido] });

      const result = await pedidosService.update(1, {});

      expect(result).toEqual(mockPedido);
      expect(query).toHaveBeenCalledWith('SELECT * FROM pedidos WHERE id = $1', [1]);
    });
  });

  describe('delete', () => {
    it('should delete a pedido', async () => {
      query.mockResolvedValue({ rows: [] });

      await pedidosService.delete(1);

      expect(query).toHaveBeenCalledWith('DELETE FROM pedidos WHERE id = $1', [1]);
    });
  });
});
