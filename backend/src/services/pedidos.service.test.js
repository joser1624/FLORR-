const pedidosService = require('./pedidos.service');
const { query } = require('../config/database');

// Mock the database query function
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('PedidosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all pedidos without filters', async () => {
      const mockPedidos = [
        { id: 1, cliente_nombre: 'Juan Pérez', estado: 'pendiente' },
        { id: 2, cliente_nombre: 'María García', estado: 'entregado' }
      ];
      query.mockResolvedValue({ rows: mockPedidos });

      const result = await pedidosService.getAll();

      expect(result).toEqual(mockPedidos);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 ORDER BY created_at DESC',
        []
      );
    });

    it('should filter by estado', async () => {
      const mockPedidos = [{ id: 1, cliente_nombre: 'Juan Pérez', estado: 'pendiente' }];
      query.mockResolvedValue({ rows: mockPedidos });

      await pedidosService.getAll({ estado: 'pendiente' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 AND estado = $1 ORDER BY fecha_entrega ASC',
        ['pendiente']
      );
    });

    it('should filter by cliente_telefono', async () => {
      const mockPedidos = [{ id: 1, cliente_telefono: '987654321' }];
      query.mockResolvedValue({ rows: mockPedidos });

      await pedidosService.getAll({ cliente_telefono: '987654321' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 AND cliente_telefono = $1 ORDER BY created_at DESC',
        ['987654321']
      );
    });

    it('should filter by fecha_entrega', async () => {
      const mockPedidos = [{ id: 1, fecha_entrega: '2024-03-20' }];
      query.mockResolvedValue({ rows: mockPedidos });

      await pedidosService.getAll({ fecha_entrega: '2024-03-20' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 AND fecha_entrega = $1 ORDER BY created_at DESC',
        ['2024-03-20']
      );
    });

    it('should order pending orders by fecha_entrega ascending', async () => {
      const mockPedidos = [
        { id: 1, estado: 'pendiente', fecha_entrega: '2024-03-20' },
        { id: 2, estado: 'pendiente', fecha_entrega: '2024-03-21' }
      ];
      query.mockResolvedValue({ rows: mockPedidos });

      await pedidosService.getAll({ estado: 'pendiente' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 AND estado = $1 ORDER BY fecha_entrega ASC',
        ['pendiente']
      );
    });

    it('should order "en preparación" orders by fecha_entrega ascending', async () => {
      const mockPedidos = [{ id: 1, estado: 'en preparación' }];
      query.mockResolvedValue({ rows: mockPedidos });

      await pedidosService.getAll({ estado: 'en preparación' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 AND estado = $1 ORDER BY fecha_entrega ASC',
        ['en preparación']
      );
    });

    it('should filter by multiple criteria', async () => {
      const mockPedidos = [{ id: 1, estado: 'pendiente', cliente_telefono: '987654321' }];
      query.mockResolvedValue({ rows: mockPedidos });

      await pedidosService.getAll({ estado: 'pendiente', cliente_telefono: '987654321' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM pedidos WHERE 1=1 AND estado = $1 AND cliente_telefono = $2 ORDER BY fecha_entrega ASC',
        ['pendiente', '987654321']
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
        expect.arrayContaining([
          null, // cliente_id
          'Juan Pérez',
          '987654321',
          null, // direccion
          '2024-03-20',
          'Ramo de rosas rojas',
          150.00,
          null, // metodo_pago
          'pendiente',
          1
        ])
      );
    });

    it('should set estado to "pendiente" on creation', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '987654321',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas'
      };
      const mockCreated = { id: 1, ...pedidoData, estado: 'pendiente' };
      query.mockResolvedValue({ rows: [mockCreated] });

      await pedidosService.create(pedidoData);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pedidos'),
        expect.arrayContaining(['pendiente'])
      );
    });

    it('should throw error if cliente_nombre is empty', async () => {
      const pedidoData = {
        cliente_nombre: '',
        cliente_telefono: '987654321',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas'
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'cliente_nombre no puede estar vacío'
      );
    });

    it('should throw error if cliente_nombre is missing', async () => {
      const pedidoData = {
        cliente_telefono: '987654321',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas'
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'cliente_nombre no puede estar vacío'
      );
    });

    it('should throw error if cliente_telefono is empty', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas'
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'cliente_telefono no puede estar vacío'
      );
    });

    it('should throw error if cliente_telefono is missing', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas'
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'cliente_telefono no puede estar vacío'
      );
    });

    it('should throw error if fecha_entrega is missing', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '987654321',
        descripcion: 'Ramo de rosas rojas'
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'fecha_entrega no puede estar vacía'
      );
    });

    it('should throw error if descripcion is empty', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '987654321',
        fecha_entrega: '2024-03-20',
        descripcion: ''
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'descripcion no puede estar vacía'
      );
    });

    it('should throw error if descripcion is missing', async () => {
      const pedidoData = {
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '987654321',
        fecha_entrega: '2024-03-20'
      };

      await expect(pedidosService.create(pedidoData)).rejects.toThrow(
        'descripcion no puede estar vacía'
      );
    });

    it('should accept optional fields', async () => {
      const pedidoData = {
        cliente_id: 5,
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '987654321',
        direccion: 'Av. Principal 123',
        fecha_entrega: '2024-03-20',
        descripcion: 'Ramo de rosas rojas',
        total: 150.00,
        metodo_pago: 'Efectivo',
        trabajador_id: 1
      };
      const mockCreated = { id: 1, ...pedidoData, estado: 'pendiente' };
      query.mockResolvedValue({ rows: [mockCreated] });

      const result = await pedidosService.create(pedidoData);

      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('should update a pedido', async () => {
      const updateData = {
        estado: 'en preparación',
        descripcion: 'Ramo de rosas rojas - actualizado'
      };
      const mockUpdated = { id: 1, ...updateData };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await pedidosService.update(1, updateData);

      expect(result).toEqual(mockUpdated);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE pedidos SET'),
        expect.arrayContaining(['en preparación', 'Ramo de rosas rojas - actualizado', 1])
      );
    });

    it('should validate estado is valid', async () => {
      const updateData = { estado: 'invalid_estado' };

      await expect(pedidosService.update(1, updateData)).rejects.toThrow(
        'estado debe ser uno de: pendiente, en preparación, listo para entrega, entregado, cancelado'
      );
    });

    it('should accept all valid estados', async () => {
      const validEstados = ['pendiente', 'en preparación', 'listo para entrega', 'entregado', 'cancelado'];
      
      for (const estado of validEstados) {
        const updateData = { estado };
        const mockUpdated = { id: 1, estado };
        query.mockResolvedValue({ rows: [mockUpdated] });

        await expect(pedidosService.update(1, updateData)).resolves.toBeDefined();
      }
    });

    it('should update updated_at timestamp', async () => {
      const updateData = { estado: 'entregado' };
      const mockUpdated = { id: 1, estado: 'entregado' };
      query.mockResolvedValue({ rows: [mockUpdated] });

      await pedidosService.update(1, updateData);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = CURRENT_TIMESTAMP'),
        expect.any(Array)
      );
    });

    it('should handle partial updates', async () => {
      const updateData = { total: 200.00 };
      const mockUpdated = { id: 1, total: 200.00 };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await pedidosService.update(1, updateData);

      expect(result).toEqual(mockUpdated);
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
