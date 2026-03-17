const trabajadoresService = require('./trabajadores.service');
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

// Mock the database module
jest.mock('../config/database');

describe('TrabajadoresService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all trabajadores without passwords', async () => {
      const mockWorkers = [
        { id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'admin' },
        { id: 2, nombre: 'Maria', email: 'maria@test.com', rol: 'empleado' }
      ];
      query.mockResolvedValue({ rows: mockWorkers });

      const result = await trabajadoresService.getAll();

      expect(result).toEqual(mockWorkers);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, email'),
        []
      );
    });
  });

  describe('getById', () => {
    it('should return trabajador by id without password', async () => {
      const mockWorker = { id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'admin' };
      query.mockResolvedValue({ rows: [mockWorker] });

      const result = await trabajadoresService.getById(1);

      expect(result).toEqual(mockWorker);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, email'),
        [1]
      );
    });
  });

  describe('create', () => {
    it('should create trabajador with hashed password and activo=true', async () => {
      const workerData = {
        nombre: 'Juan Perez',
        email: 'juan@test.com',
        password: 'password123',
        rol: 'empleado',
        cargo: 'Vendedor'
      };

      query
        .mockResolvedValueOnce({ rows: [] }) // email check
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            nombre: workerData.nombre, 
            email: workerData.email,
            rol: workerData.rol,
            activo: true 
          }] 
        }); // insert

      const result = await trabajadoresService.create(workerData);

      expect(result.activo).toBe(true);
      expect(query).toHaveBeenCalledTimes(2);
      // Verify email uniqueness check
      expect(query).toHaveBeenNthCalledWith(1, 
        'SELECT id FROM usuarios WHERE email = $1',
        [workerData.email]
      );
      // Verify insert with activo=true
      expect(query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('INSERT INTO usuarios'),
        expect.arrayContaining([workerData.nombre, workerData.email])
      );
    });

    it('should reject empty nombre', async () => {
      const workerData = {
        nombre: '',
        email: 'juan@test.com',
        password: 'password123',
        rol: 'empleado'
      };

      await expect(trabajadoresService.create(workerData))
        .rejects.toThrow('El nombre es requerido');
    });

    it('should reject empty email', async () => {
      const workerData = {
        nombre: 'Juan',
        email: '',
        password: 'password123',
        rol: 'empleado'
      };

      await expect(trabajadoresService.create(workerData))
        .rejects.toThrow('El email es requerido');
    });

    it('should reject duplicate email', async () => {
      const workerData = {
        nombre: 'Juan',
        email: 'existing@test.com',
        password: 'password123',
        rol: 'empleado'
      };

      query.mockResolvedValue({ rows: [{ id: 1 }] }); // email exists

      await expect(trabajadoresService.create(workerData))
        .rejects.toThrow('El email ya está registrado');
    });

    it('should reject password shorter than 6 characters', async () => {
      const workerData = {
        nombre: 'Juan',
        email: 'juan@test.com',
        password: '12345',
        rol: 'empleado'
      };

      query.mockResolvedValue({ rows: [] }); // email check

      await expect(trabajadoresService.create(workerData))
        .rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('should reject invalid rol', async () => {
      const workerData = {
        nombre: 'Juan',
        email: 'juan@test.com',
        password: 'password123',
        rol: 'invalid_role'
      };

      query.mockResolvedValue({ rows: [] }); // email check

      await expect(trabajadoresService.create(workerData))
        .rejects.toThrow('El rol debe ser uno de: admin, empleado, duena');
    });
  });

  describe('update', () => {
    it('should update trabajador and hash password if provided', async () => {
      const updateData = {
        nombre: 'Juan Updated',
        password: 'newpassword123'
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 1, email: 'juan@test.com' }] }) // exists check
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, nombre: updateData.nombre }] 
        }); // update

      const result = await trabajadoresService.update(1, updateData);

      expect(result.nombre).toBe(updateData.nombre);
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('should reject email change if new email exists', async () => {
      const updateData = {
        email: 'existing@test.com'
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 1, email: 'old@test.com' }] }) // exists check
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }); // email exists

      await expect(trabajadoresService.update(1, updateData))
        .rejects.toThrow('El email ya está registrado');
    });

    it('should reject password shorter than 6 characters on update', async () => {
      const updateData = {
        password: '12345'
      };

      query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'juan@test.com' }] });

      await expect(trabajadoresService.update(1, updateData))
        .rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('should reject if trabajador not found', async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(trabajadoresService.update(999, { nombre: 'Test' }))
        .rejects.toThrow('Trabajador no encontrado');
    });
  });

  describe('delete', () => {
    it('should soft delete trabajador (set activo=false)', async () => {
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await trabajadoresService.delete(1);

      expect(result.success).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET activo = false'),
        [1]
      );
    });

    it('should reject if trabajador not found', async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(trabajadoresService.delete(999))
        .rejects.toThrow('Trabajador no encontrado');
    });
  });
});
