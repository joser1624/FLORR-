const trabajadoresService = require('./trabajadores.service');
const { query } = require('../config/database');

jest.mock('../config/database');

describe('TrabajadoresService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated trabajadores without passwords', async () => {
      const mockWorkers = [
        { id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'admin' },
        { id: 2, nombre: 'Maria', email: 'maria@test.com', rol: 'empleado' }
      ];
      query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({ rows: mockWorkers });

      const result = await trabajadoresService.getAll();

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockWorkers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
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
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: workerData.nombre, email: workerData.email, rol: workerData.rol, activo: true }] });

      const result = await trabajadoresService.create(workerData);

      expect(result.activo).toBe(true);
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('should reject empty nombre', async () => {
      await expect(trabajadoresService.create({ nombre: '', email: 'juan@test.com', password: 'password123', rol: 'empleado' }))
        .rejects.toThrow('El nombre es requerido');
    });

    it('should reject empty email', async () => {
      await expect(trabajadoresService.create({ nombre: 'Juan', email: '', password: 'password123', rol: 'empleado' }))
        .rejects.toThrow('El email es requerido');
    });

    it('should reject duplicate email', async () => {
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      await expect(trabajadoresService.create({ nombre: 'Juan', email: 'existing@test.com', password: 'password123', rol: 'empleado' }))
        .rejects.toThrow('El email ya está registrado');
    });

    it('should reject password shorter than 6 characters', async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(trabajadoresService.create({ nombre: 'Juan', email: 'juan@test.com', password: '12345', rol: 'empleado' }))
        .rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('should reject invalid rol', async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(trabajadoresService.create({ nombre: 'Juan', email: 'juan@test.com', password: 'password123', rol: 'invalid_role' }))
        .rejects.toThrow('El rol debe ser uno de: admin, empleado, duena');
    });
  });

  describe('update', () => {
    it('should update trabajador', async () => {
      const updateData = { nombre: 'Juan Updated', password: 'newpassword123' };

      query
        .mockResolvedValueOnce({ rows: [{ id: 1, email: 'juan@test.com' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre: updateData.nombre }] });

      const result = await trabajadoresService.update(1, updateData);

      expect(result.nombre).toBe(updateData.nombre);
    });

    it('should reject email change if new email exists', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ id: 1, email: 'old@test.com' }] })
        .mockResolvedValueOnce({ rows: [{ id: 2 }] });

      await expect(trabajadoresService.update(1, { email: 'existing@test.com' }))
        .rejects.toThrow('El email ya está registrado');
    });

    it('should reject password shorter than 6 characters on update', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'juan@test.com' }] });

      await expect(trabajadoresService.update(1, { password: '12345' }))
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
