/**
 * Unit tests for pedidos controller
 * Task 9.2: Test orders controller implementation
 */

const pedidosController = require('./pedidos.controller');
const pedidosService = require('../services/pedidos.service');

// Mock the service
jest.mock('../services/pedidos.service');

describe('PedidosController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 1, rol: 'admin' }
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all pedidos with success response', async () => {
      const mockPedidos = [
        { id: 1, cliente_nombre: 'Test Cliente', estado: 'pendiente' },
        { id: 2, cliente_nombre: 'Test Cliente 2', estado: 'entregado' }
      ];
      pedidosService.getAll.mockResolvedValue(mockPedidos);

      await pedidosController.getAll(req, res, next);

      expect(pedidosService.getAll).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        pedidos: mockPedidos
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Database error');
      pedidosService.getAll.mockRejectedValue(error);

      await pedidosController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getByCliente', () => {
    it('should return pedidos filtered by telefono', async () => {
      req.query.telefono = '987654321';
      const mockPedidos = [
        { id: 1, cliente_nombre: 'Test Cliente', cliente_telefono: '987654321' }
      ];
      pedidosService.getAll.mockResolvedValue(mockPedidos);

      await pedidosController.getByCliente(req, res, next);

      expect(pedidosService.getAll).toHaveBeenCalledWith({ cliente_telefono: '987654321' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        pedidos: mockPedidos
      });
    });

    it('should return 400 if telefono parameter is missing', async () => {
      req.query = {};

      await pedidosController.getByCliente(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'El parámetro telefono es requerido'
      });
      expect(pedidosService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return pedido by id with success response', async () => {
      req.params.id = '1';
      const mockPedido = { id: 1, cliente_nombre: 'Test Cliente', estado: 'pendiente' };
      pedidosService.getById.mockResolvedValue(mockPedido);

      await pedidosController.getById(req, res, next);

      expect(pedidosService.getById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        pedido: mockPedido
      });
    });

    it('should return 404 if pedido not found', async () => {
      req.params.id = '999';
      pedidosService.getById.mockResolvedValue(null);

      await pedidosController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Pedido no encontrado'
      });
    });
  });

  describe('create', () => {
    it('should create pedido and return 201 status', async () => {
      req.body = {
        cliente_nombre: 'Test Cliente',
        cliente_telefono: '987654321',
        fecha_entrega: '2024-02-14',
        descripcion: 'Test pedido',
        total: 100
      };
      const mockPedido = { id: 1, ...req.body, estado: 'pendiente' };
      pedidosService.create.mockResolvedValue(mockPedido);

      await pedidosController.create(req, res, next);

      expect(pedidosService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        pedido: mockPedido,
        mensaje: 'Pedido creado correctamente'
      });
    });

    it('should return 400 for validation errors', async () => {
      req.body = { cliente_nombre: '' };
      const error = new Error('cliente_nombre no puede estar vacío');
      pedidosService.create.mockRejectedValue(error);

      await pedidosController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'cliente_nombre no puede estar vacío'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update pedido and return success response', async () => {
      req.params.id = '1';
      req.body = { estado: 'en preparación' };
      const mockPedido = { id: 1, estado: 'en preparación' };
      pedidosService.update.mockResolvedValue(mockPedido);

      await pedidosController.update(req, res, next);

      expect(pedidosService.update).toHaveBeenCalledWith('1', req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        pedido: mockPedido,
        mensaje: 'Pedido actualizado correctamente'
      });
    });

    it('should return 404 if pedido not found', async () => {
      req.params.id = '999';
      req.body = { estado: 'entregado' };
      pedidosService.update.mockResolvedValue(null);

      await pedidosController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Pedido no encontrado'
      });
    });

    it('should return 400 for invalid estado', async () => {
      req.params.id = '1';
      req.body = { estado: 'estado_invalido' };
      const error = new Error('estado debe ser uno de: pendiente, en preparación, listo para entrega, entregado, cancelado');
      pedidosService.update.mockRejectedValue(error);

      await pedidosController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'estado debe ser uno de: pendiente, en preparación, listo para entrega, entregado, cancelado'
      });
    });
  });

  describe('delete', () => {
    it('should delete pedido and return success response', async () => {
      req.params.id = '1';
      pedidosService.delete.mockResolvedValue();

      await pedidosController.delete(req, res, next);

      expect(pedidosService.delete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        mensaje: 'Pedido eliminado correctamente'
      });
    });

    it('should call next with error on service failure', async () => {
      req.params.id = '1';
      const error = new Error('Database error');
      pedidosService.delete.mockRejectedValue(error);

      await pedidosController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
