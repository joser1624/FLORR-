const request = require('supertest');
const express = require('express');
const clientesController = require('./clientes.controller');
const clientesService = require('../services/clientes.service');

// Mock the service
jest.mock('../services/clientes.service');

describe('ClientesController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock middleware
    app.use((req, res, next) => {
      req.user = { id: 1, rol: 'admin' };
      next();
    });

    // Setup routes
    app.get('/clientes', clientesController.getAll.bind(clientesController));
    app.get('/clientes/:id', clientesController.getById.bind(clientesController));
    app.get('/clientes/telefono/:telefono', clientesController.getByTelefono.bind(clientesController));
    app.post('/clientes', clientesController.create.bind(clientesController));
    app.put('/clientes/:id', clientesController.update.bind(clientesController));
    app.delete('/clientes/:id', clientesController.delete.bind(clientesController));

    // Error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ error: true, mensaje: err.message });
    });

    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated list of clients', async () => {
      const mockResult = {
        clientes: [
          { id: 1, nombre: 'Juan', telefono: '123456789' },
          { id: 2, nombre: 'María', telefono: '987654321' }
        ],
        total: 2,
        page: 1,
        limit: 50,
        pages: 1
      };

      clientesService.getAll.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/clientes')
        .query({ page: 1, limit: 50 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.clientes).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(50);
      expect(res.body.data.pages).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const mockResult = {
        clientes: [{ id: 3, nombre: 'Pedro', telefono: '555555555' }],
        total: 100,
        page: 2,
        limit: 50,
        pages: 2
      };

      clientesService.getAll.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/clientes')
        .query({ page: 2, limit: 50 });

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.total).toBe(100);
      expect(clientesService.getAll).toHaveBeenCalledWith({ page: '2', limit: '50' });
    });

    it('should return empty list when no clients exist', async () => {
      const mockResult = {
        clientes: [],
        total: 0,
        page: 1,
        limit: 50,
        pages: 0
      };

      clientesService.getAll.mockResolvedValue(mockResult);

      const res = await request(app).get('/clientes');

      expect(res.status).toBe(200);
      expect(res.body.data.clientes).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('should return a client by ID', async () => {
      const mockCliente = {
        id: 1,
        nombre: 'Juan',
        telefono: '123456789',
        direccion: 'Calle 1',
        email: 'juan@example.com'
      };

      clientesService.getById.mockResolvedValue(mockCliente);

      const res = await request(app).get('/clientes/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockCliente);
    });

    it('should return 404 when client not found', async () => {
      clientesService.getById.mockResolvedValue(null);

      const res = await request(app).get('/clientes/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Cliente no encontrado');
    });
  });

  describe('getByTelefono', () => {
    it('should return a client by phone number', async () => {
      const mockCliente = {
        id: 1,
        nombre: 'Juan',
        telefono: '123456789',
        direccion: 'Calle 1',
        email: 'juan@example.com'
      };

      clientesService.getByTelefono.mockResolvedValue(mockCliente);

      const res = await request(app).get('/clientes/telefono/123456789');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockCliente);
    });

    it('should return 404 when client not found by phone', async () => {
      clientesService.getByTelefono.mockResolvedValue(null);

      const res = await request(app).get('/clientes/telefono/999999999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Cliente no encontrado');
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const newCliente = {
        id: 1,
        nombre: 'Juan',
        telefono: '123456789',
        direccion: 'Calle 1',
        email: 'juan@example.com',
        created_at: '2026-03-16T22:46:44.928Z',
        updated_at: '2026-03-16T22:46:44.928Z'
      };

      clientesService.create.mockResolvedValue(newCliente);

      const res = await request(app)
        .post('/clientes')
        .send({
          nombre: 'Juan',
          telefono: '123456789',
          direccion: 'Calle 1',
          email: 'juan@example.com'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(newCliente);
      expect(res.body.mensaje).toBe('Cliente creado correctamente');
    });

    it('should handle validation errors from service', async () => {
      clientesService.create.mockRejectedValue(
        new Error('El nombre del cliente no puede estar vacío')
      );

      const res = await request(app)
        .post('/clientes')
        .send({
          nombre: '',
          telefono: '123456789'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toContain('no puede estar vacío');
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const updatedCliente = {
        id: 1,
        nombre: 'Juan Updated',
        telefono: '123456789',
        direccion: 'Calle 2',
        email: 'juan@example.com',
        updated_at: '2026-03-16T22:46:44.987Z'
      };

      clientesService.update.mockResolvedValue(updatedCliente);

      const res = await request(app)
        .put('/clientes/1')
        .send({
          nombre: 'Juan Updated',
          direccion: 'Calle 2'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(updatedCliente);
      expect(res.body.mensaje).toBe('Cliente actualizado correctamente');
    });

    it('should return 404 when client not found for update', async () => {
      clientesService.update.mockResolvedValue(null);

      const res = await request(app)
        .put('/clientes/999')
        .send({ nombre: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Cliente no encontrado');
    });

    it('should handle validation errors on update', async () => {
      clientesService.update.mockRejectedValue(
        new Error('El teléfono del cliente no puede estar vacío')
      );

      const res = await request(app)
        .put('/clientes/1')
        .send({ telefono: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      clientesService.delete.mockResolvedValue(true);

      const res = await request(app).delete('/clientes/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mensaje).toBe('Cliente eliminado correctamente');
    });

    it('should handle errors during deletion', async () => {
      clientesService.delete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/clientes/1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(true);
    });
  });
});
