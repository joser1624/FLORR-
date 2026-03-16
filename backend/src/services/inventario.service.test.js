const inventarioService = require('./inventario.service');
const { query } = require('../config/database');

// Mock the database module
jest.mock('../config/database');

describe('InventarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all inventory items ordered by created_at DESC when no filters', async () => {
      const mockItems = [
        { id: 1, nombre: 'Rosas', tipo: 'flores', stock: 50, stock_min: 10 },
        { id: 2, nombre: 'Cinta', tipo: 'materiales', stock: 100, stock_min: 20 }
      ];
      query.mockResolvedValue({ rows: mockItems });

      const result = await inventarioService.getAll({});

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM inventario WHERE 1=1 ORDER BY created_at DESC',
        []
      );
      expect(result).toEqual(mockItems);
    });

    it('should filter by tipo when provided', async () => {
      const mockItems = [
        { id: 1, nombre: 'Rosas', tipo: 'flores', stock: 50, stock_min: 10 }
      ];
      query.mockResolvedValue({ rows: mockItems });

      const result = await inventarioService.getAll({ tipo: 'flores' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM inventario WHERE 1=1 AND tipo = $1 ORDER BY created_at DESC',
        ['flores']
      );
      expect(result).toEqual(mockItems);
    });

    it('should filter by low stock and order by stock ASC when stock_bajo is true', async () => {
      const mockItems = [
        { id: 1, nombre: 'Rosas', tipo: 'flores', stock: 5, stock_min: 10 },
        { id: 2, nombre: 'Tulipanes', tipo: 'flores', stock: 8, stock_min: 10 }
      ];
      query.mockResolvedValue({ rows: mockItems });

      const result = await inventarioService.getAll({ stock_bajo: true });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM inventario WHERE 1=1 AND stock <= stock_min ORDER BY stock ASC',
        []
      );
      expect(result).toEqual(mockItems);
    });

    it('should filter by tipo and low stock together', async () => {
      const mockItems = [
        { id: 1, nombre: 'Rosas', tipo: 'flores', stock: 5, stock_min: 10 }
      ];
      query.mockResolvedValue({ rows: mockItems });

      const result = await inventarioService.getAll({ tipo: 'flores', stock_bajo: 'true' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM inventario WHERE 1=1 AND tipo = $1 AND stock <= stock_min ORDER BY stock ASC',
        ['flores']
      );
      expect(result).toEqual(mockItems);
    });
  });

  describe('getById', () => {
    it('should return inventory item by id', async () => {
      const mockItem = { id: 1, nombre: 'Rosas', tipo: 'flores', stock: 50 };
      query.mockResolvedValue({ rows: [mockItem] });

      const result = await inventarioService.getById(1);

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM inventario WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe('create', () => {
    it('should create inventory item with valid data', async () => {
      const newItem = {
        nombre: 'Rosas',
        tipo: 'flores',
        stock: 50,
        stock_min: 10,
        unidad: 'docena',
        costo: 25.50
      };
      const mockCreated = { id: 1, ...newItem };
      query.mockResolvedValue({ rows: [mockCreated] });

      const result = await inventarioService.create(newItem);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO inventario'),
        [newItem.nombre, newItem.tipo, newItem.stock, newItem.stock_min, newItem.unidad, newItem.costo]
      );
      expect(result).toEqual(mockCreated);
    });

    it('should throw error when nombre is empty', async () => {
      const invalidItem = {
        nombre: '',
        tipo: 'flores',
        stock: 50,
        costo: 25.50
      };

      await expect(inventarioService.create(invalidItem)).rejects.toThrow('El nombre es requerido');
    });

    it('should throw error when tipo is invalid', async () => {
      const invalidItem = {
        nombre: 'Rosas',
        tipo: 'invalid',
        stock: 50,
        costo: 25.50
      };

      await expect(inventarioService.create(invalidItem)).rejects.toThrow('El tipo debe ser: flores, materiales o accesorios');
    });

    it('should throw error when stock is negative', async () => {
      const invalidItem = {
        nombre: 'Rosas',
        tipo: 'flores',
        stock: -5,
        costo: 25.50
      };

      await expect(inventarioService.create(invalidItem)).rejects.toThrow('El stock debe ser mayor o igual a 0');
    });

    it('should throw error when costo is negative', async () => {
      const invalidItem = {
        nombre: 'Rosas',
        tipo: 'flores',
        stock: 50,
        costo: -10
      };

      await expect(inventarioService.create(invalidItem)).rejects.toThrow('El costo debe ser mayor o igual a 0');
    });
  });

  describe('update', () => {
    it('should update inventory item with valid data', async () => {
      const updateData = {
        nombre: 'Rosas Rojas',
        tipo: 'flores',
        stock: 60,
        stock_min: 15,
        unidad: 'docena',
        costo: 30.00
      };
      const mockUpdated = { id: 1, ...updateData };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await inventarioService.update(1, updateData);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE inventario'),
        [updateData.nombre, updateData.tipo, updateData.stock, updateData.stock_min, updateData.unidad, updateData.costo, 1]
      );
      expect(result).toEqual(mockUpdated);
    });

    it('should throw error when nombre is empty string', async () => {
      const invalidUpdate = {
        nombre: '  ',
        tipo: 'flores',
        stock: 50,
        costo: 25.50
      };

      await expect(inventarioService.update(1, invalidUpdate)).rejects.toThrow('El nombre no puede estar vacío');
    });

    it('should throw error when tipo is invalid', async () => {
      const invalidUpdate = {
        nombre: 'Rosas',
        tipo: 'invalid',
        stock: 50,
        costo: 25.50
      };

      await expect(inventarioService.update(1, invalidUpdate)).rejects.toThrow('El tipo debe ser: flores, materiales o accesorios');
    });
  });

  describe('delete', () => {
    it('should delete inventory item by id', async () => {
      query.mockResolvedValue({ rows: [] });

      await inventarioService.delete(1);

      expect(query).toHaveBeenCalledWith(
        'DELETE FROM inventario WHERE id = $1',
        [1]
      );
    });
  });
});
