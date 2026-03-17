const clientesService = require('./clientes.service');
const { query } = require('../config/database');

// Mock the database query function
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('ClientesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated clientes with default pagination', async () => {
      const mockClientes = [
        { id: 1, nombre: 'Cliente 1', telefono: '123456789', direccion: 'Calle 1', email: 'cliente1@test.com', created_at: new Date(), updated_at: new Date() },
        { id: 2, nombre: 'Cliente 2', telefono: '987654321', direccion: 'Calle 2', email: 'cliente2@test.com', created_at: new Date(), updated_at: new Date() }
      ];

      query.mockResolvedValueOnce({ rows: [{ total: '2' }] });
      query.mockResolvedValueOnce({ rows: mockClientes });

      const result = await clientesService.getAll({});

      expect(result.clientes).toEqual(mockClientes);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.pages).toBe(1);
    });

    it('should support custom pagination parameters', async () => {
      const mockClientes = [{ id: 1, nombre: 'Cliente 1', telefono: '123456789' }];

      query.mockResolvedValueOnce({ rows: [{ total: '100' }] });
      query.mockResolvedValueOnce({ rows: mockClientes });

      const result = await clientesService.getAll({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.pages).toBe(10);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM clientes ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [10, 10]
      );
    });
  });

  describe('getById', () => {
    it('should return cliente by id', async () => {
      const mockCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789' };
      query.mockResolvedValueOnce({ rows: [mockCliente] });

      const result = await clientesService.getById(1);

      expect(result).toEqual(mockCliente);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM clientes WHERE id = $1',
        [1]
      );
    });

    it('should return undefined if cliente not found', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await clientesService.getById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getByTelefono', () => {
    it('should return cliente by telefono', async () => {
      const mockCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789' };
      query.mockResolvedValueOnce({ rows: [mockCliente] });

      const result = await clientesService.getByTelefono('123456789');

      expect(result).toEqual(mockCliente);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM clientes WHERE telefono = $1',
        ['123456789']
      );
    });

    it('should return undefined if cliente not found by telefono', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await clientesService.getByTelefono('999999999');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create cliente with valid data', async () => {
      const mockCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789', direccion: 'Calle 1', email: 'cliente@test.com' };
      query.mockResolvedValueOnce({ rows: [mockCliente] });

      const result = await clientesService.create({
        nombre: 'Cliente 1',
        telefono: '123456789',
        direccion: 'Calle 1',
        email: 'cliente@test.com'
      });

      expect(result).toEqual(mockCliente);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        ['Cliente 1', '123456789', 'Calle 1', 'cliente@test.com']
      );
    });

    it('should throw error if nombre is empty', async () => {
      await expect(clientesService.create({
        nombre: '',
        telefono: '123456789'
      })).rejects.toThrow('El nombre del cliente no puede estar vacío');
    });

    it('should throw error if telefono is empty', async () => {
      await expect(clientesService.create({
        nombre: 'Cliente 1',
        telefono: ''
      })).rejects.toThrow('El teléfono del cliente no puede estar vacío');
    });

    it('should trim whitespace from nombre and telefono', async () => {
      const mockCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789' };
      query.mockResolvedValueOnce({ rows: [mockCliente] });

      await clientesService.create({
        nombre: '  Cliente 1  ',
        telefono: '  123456789  '
      });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        ['Cliente 1', '123456789', null, null]
      );
    });
  });

  describe('update', () => {
    it('should update cliente with valid data', async () => {
      const existingCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789', direccion: null, email: null };
      const mockCliente = { id: 1, nombre: 'Cliente Updated', telefono: '123456789', updated_at: new Date() };
      // First call: getById (SELECT), second call: UPDATE
      query.mockResolvedValueOnce({ rows: [existingCliente] });
      query.mockResolvedValueOnce({ rows: [mockCliente] });

      const result = await clientesService.update(1, {
        nombre: 'Cliente Updated',
        telefono: '123456789'
      });

      expect(result).toEqual(mockCliente);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE clientes'),
        expect.arrayContaining(['Cliente Updated', '123456789', null, null, 1])
      );
    });

    it('should throw error if nombre is empty during update', async () => {
      await expect(clientesService.update(1, {
        nombre: ''
      })).rejects.toThrow('El nombre del cliente no puede estar vacío');
    });

    it('should throw error if telefono is empty during update', async () => {
      await expect(clientesService.update(1, {
        telefono: ''
      })).rejects.toThrow('El teléfono del cliente no puede estar vacío');
    });

    it('should update updated_at timestamp', async () => {
      const existingCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789', direccion: null, email: null };
      const mockCliente = { id: 1, nombre: 'Cliente 1', telefono: '123456789', updated_at: new Date() };
      // First call: getById (SELECT), second call: UPDATE
      query.mockResolvedValueOnce({ rows: [existingCliente] });
      query.mockResolvedValueOnce({ rows: [mockCliente] });

      await clientesService.update(1, {
        nombre: 'Cliente 1',
        telefono: '123456789'
      });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = CURRENT_TIMESTAMP'),
        expect.any(Array)
      );
    });
  });

  describe('delete', () => {
    it('should delete cliente by id', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await clientesService.delete(1);

      expect(query).toHaveBeenCalledWith(
        'DELETE FROM clientes WHERE id = $1',
        [1]
      );
    });
  });
});
