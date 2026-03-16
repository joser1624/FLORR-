const productosController = require('./productos.controller');
const productosService = require('../services/productos.service');

// Mock the service
jest.mock('../services/productos.service');

describe('ProductosController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products with success response (Requirement 20.1, 20.2, 20.7)', async () => {
      const mockProducts = [
        { id: 1, nombre: 'Ramo de Rosas', precio: 50 },
        { id: 2, nombre: 'Arreglo Floral', precio: 75 }
      ];
      productosService.getAll.mockResolvedValue(mockProducts);

      await productosController.getAll(req, res, next);

      expect(productosService.getAll).toHaveBeenCalledWith({
        categoria: undefined,
        activo: undefined,
        stock_bajo: false
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass filters to service', async () => {
      req.query = { categoria: 'Ramos', activo: 'true' };
      productosService.getAll.mockResolvedValue([]);

      await productosController.getAll(req, res, next);

      expect(productosService.getAll).toHaveBeenCalledWith({
        categoria: 'Ramos',
        activo: 'true',
        stock_bajo: false
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      productosService.getAll.mockRejectedValue(error);

      await productosController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should return product by id with success response (Requirement 20.1, 20.2, 20.7)', async () => {
      const mockProduct = { id: 1, nombre: 'Ramo de Rosas', precio: 50 };
      req.params.id = '1';
      productosService.getById.mockResolvedValue(mockProduct);

      await productosController.getById(req, res, next);

      expect(productosService.getById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when product not found (Requirement 20.8)', async () => {
      req.params.id = '999';
      productosService.getById.mockResolvedValue(null);

      await productosController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Producto no encontrado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      productosService.getById.mockRejectedValue(error);

      await productosController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should create product and return 201 (Requirement 20.6, 20.1, 20.2)', async () => {
      const productData = {
        nombre: 'Ramo de Rosas',
        categoria: 'Ramos',
        precio: 50,
        costo: 30,
        stock: 10
      };
      const mockCreated = { id: 1, ...productData };
      req.body = productData;
      productosService.create.mockResolvedValue(mockCreated);

      await productosController.create(req, res, next);

      expect(productosService.create).toHaveBeenCalledWith(productData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreated,
        mensaje: 'Producto creado correctamente'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle validation errors from service (Requirement 20.9)', async () => {
      req.body = { nombre: '', categoria: 'Ramos', precio: 50, costo: 30 };
      const error = new Error('El nombre del producto no puede estar vacío');
      productosService.create.mockRejectedValue(error);

      await productosController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'El nombre del producto no puede estar vacío'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle range validation errors from service', async () => {
      req.body = { nombre: 'Test', categoria: 'Ramos', precio: -10, costo: 30 };
      const error = new Error('El precio debe ser mayor o igual a cero');
      productosService.create.mockRejectedValue(error);

      await productosController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'El precio debe ser mayor o igual a cero'
      });
    });

    it('should handle categoria validation errors from service', async () => {
      req.body = { nombre: 'Test', categoria: 'Invalid', precio: 50, costo: 30 };
      const error = new Error('La categoría debe ser una de: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros');
      productosService.create.mockRejectedValue(error);

      await productosController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'La categoría debe ser una de: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros'
      });
    });

    it('should pass other errors to error handler', async () => {
      const error = new Error('Database connection failed');
      req.body = { nombre: 'Test', categoria: 'Ramos', precio: 50, costo: 30 };
      productosService.create.mockRejectedValue(error);

      await productosController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should update product and return success response (Requirement 20.1, 20.2, 20.7)', async () => {
      const updateData = { nombre: 'Ramo Actualizado', precio: 60 };
      const mockUpdated = { id: 1, ...updateData };
      req.params.id = '1';
      req.body = updateData;
      productosService.update.mockResolvedValue(mockUpdated);

      await productosController.update(req, res, next);

      expect(productosService.update).toHaveBeenCalledWith('1', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdated,
        mensaje: 'Producto actualizado correctamente'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when product not found (Requirement 20.8)', async () => {
      req.params.id = '999';
      req.body = { nombre: 'Test' };
      productosService.update.mockResolvedValue(null);

      await productosController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Producto no encontrado'
      });
    });

    it('should handle validation errors from service', async () => {
      req.params.id = '1';
      req.body = { precio: -10 };
      const error = new Error('El precio debe ser mayor o igual a cero');
      productosService.update.mockRejectedValue(error);

      await productosController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'El precio debe ser mayor o igual a cero'
      });
    });
  });

  describe('delete', () => {
    it('should delete product and return success response (Requirement 20.1, 20.2, 20.7)', async () => {
      const mockDeleted = { id: 1, nombre: 'Ramo de Rosas', activo: false };
      req.params.id = '1';
      productosService.delete.mockResolvedValue(mockDeleted);

      await productosController.delete(req, res, next);

      expect(productosService.delete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        mensaje: 'Producto eliminado correctamente'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when product not found', async () => {
      req.params.id = '999';
      productosService.delete.mockResolvedValue(null);

      await productosController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Producto no encontrado'
      });
    });

    it('should handle foreign key constraint violation (Requirement 20.9)', async () => {
      req.params.id = '1';
      const error = new Error('Foreign key violation');
      error.code = '23503';
      productosService.delete.mockRejectedValue(error);

      await productosController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass other errors to error handler', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      productosService.delete.mockRejectedValue(error);

      await productosController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
