const productosService = require('./productos.service');
const { query } = require('../config/database');

// Mock the database query function
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('ProductosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [
        { id: 1, nombre: 'Ramo de Rosas', categoria: 'Ramos', activo: true },
        { id: 2, nombre: 'Arreglo Floral', categoria: 'Arreglos', activo: true }
      ];
      query.mockResolvedValue({ rows: mockProducts });

      const result = await productosService.getAll();

      expect(result).toEqual(mockProducts);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM productos WHERE 1=1 ORDER BY created_at DESC',
        []
      );
    });

    it('should filter by categoria', async () => {
      const mockProducts = [{ id: 1, nombre: 'Ramo de Rosas', categoria: 'Ramos' }];
      query.mockResolvedValue({ rows: mockProducts });

      await productosService.getAll({ categoria: 'Ramos' });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM productos WHERE 1=1 AND categoria = $1 ORDER BY created_at DESC',
        ['Ramos']
      );
    });

    it('should filter by activo status', async () => {
      const mockProducts = [{ id: 1, nombre: 'Ramo de Rosas', activo: true }];
      query.mockResolvedValue({ rows: mockProducts });

      await productosService.getAll({ activo: true });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM productos WHERE 1=1 AND activo = $1 ORDER BY created_at DESC',
        [true]
      );
    });

    it('should filter by both categoria and activo', async () => {
      const mockProducts = [{ id: 1, nombre: 'Ramo de Rosas', categoria: 'Ramos', activo: true }];
      query.mockResolvedValue({ rows: mockProducts });

      await productosService.getAll({ categoria: 'Ramos', activo: true });

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM productos WHERE 1=1 AND categoria = $1 AND activo = $2 ORDER BY created_at DESC',
        ['Ramos', true]
      );
    });
  });

  describe('getById', () => {
    it('should return product by id', async () => {
      const mockProduct = { id: 1, nombre: 'Ramo de Rosas' };
      query.mockResolvedValue({ rows: [mockProduct] });

      const result = await productosService.getById(1);

      expect(result).toEqual(mockProduct);
      expect(query).toHaveBeenCalledWith('SELECT * FROM productos WHERE id = $1', [1]);
    });
  });

  describe('create', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        nombre: 'Ramo de Rosas',
        descripcion: 'Hermoso ramo',
        categoria: 'Ramos',
        precio: 50,
        costo: 30,
        stock: 10
      };
      const mockCreated = { id: 1, ...productData };
      query.mockResolvedValue({ rows: [mockCreated] });

      const result = await productosService.create(productData);

      expect(result).toEqual(mockCreated);
      expect(query).toHaveBeenCalled();
    });

    it('should throw error if nombre is empty', async () => {
      const productData = {
        nombre: '',
        categoria: 'Ramos',
        precio: 50,
        costo: 30
      };

      await expect(productosService.create(productData)).rejects.toThrow(
        'El nombre del producto no puede estar vacío'
      );
    });

    it('should throw error if precio is negative', async () => {
      const productData = {
        nombre: 'Ramo de Rosas',
        categoria: 'Ramos',
        precio: -10,
        costo: 30
      };

      await expect(productosService.create(productData)).rejects.toThrow(
        'El precio debe ser mayor o igual a cero'
      );
    });

    it('should throw error if costo is negative', async () => {
      const productData = {
        nombre: 'Ramo de Rosas',
        categoria: 'Ramos',
        precio: 50,
        costo: -10
      };

      await expect(productosService.create(productData)).rejects.toThrow(
        'El costo debe ser mayor o igual a cero'
      );
    });

    it('should throw error if stock is negative', async () => {
      const productData = {
        nombre: 'Ramo de Rosas',
        categoria: 'Ramos',
        precio: 50,
        costo: 30,
        stock: -5
      };

      await expect(productosService.create(productData)).rejects.toThrow(
        'El stock debe ser mayor o igual a cero'
      );
    });

    it('should throw error if categoria is invalid', async () => {
      const productData = {
        nombre: 'Ramo de Rosas',
        categoria: 'InvalidCategory',
        precio: 50,
        costo: 30
      };

      await expect(productosService.create(productData)).rejects.toThrow(
        'La categoría debe ser una de: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros'
      );
    });

    it('should accept all valid categorias', async () => {
      const validCategorias = ['Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros'];
      
      for (const categoria of validCategorias) {
        const productData = {
          nombre: 'Test Product',
          categoria,
          precio: 50,
          costo: 30
        };
        const mockCreated = { id: 1, ...productData };
        query.mockResolvedValue({ rows: [mockCreated] });

        await expect(productosService.create(productData)).resolves.toBeDefined();
      }
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateData = {
        nombre: 'Ramo Actualizado',
        categoria: 'Ramos',
        precio: 60,
        costo: 35,
        stock: 15
      };
      const mockUpdated = { id: 1, ...updateData };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await productosService.update(1, updateData);

      expect(result).toEqual(mockUpdated);
      expect(query).toHaveBeenCalled();
    });

    it('should throw error if nombre is empty on update', async () => {
      const updateData = { nombre: '' };

      await expect(productosService.update(1, updateData)).rejects.toThrow(
        'El nombre del producto no puede estar vacío'
      );
    });

    it('should throw error if precio is negative on update', async () => {
      const updateData = { precio: -10 };

      await expect(productosService.update(1, updateData)).rejects.toThrow(
        'El precio debe ser mayor o igual a cero'
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a product (set activo = false)', async () => {
      const mockDeleted = { id: 1, nombre: 'Ramo de Rosas', activo: false };
      query.mockResolvedValue({ rows: [mockDeleted] });

      const result = await productosService.delete(1);

      expect(result).toEqual(mockDeleted);
      expect(query).toHaveBeenCalledWith(
        'UPDATE productos SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [1]
      );
    });
  });

  describe('updateStock', () => {
    it('should update stock by adding quantity', async () => {
      const mockUpdated = { id: 1, nombre: 'Ramo de Rosas', stock: 15 };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await productosService.updateStock(1, 5);

      expect(result).toEqual(mockUpdated);
      expect(query).toHaveBeenCalledWith(
        'UPDATE productos SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [5, 1]
      );
    });
  });

  describe('deductStock', () => {
    it('should deduct stock when sufficient', async () => {
      const mockUpdated = { id: 1, nombre: 'Ramo de Rosas', stock: 5 };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await productosService.deductStock(1, 5);

      expect(result).toEqual(mockUpdated);
    });

    it('should throw error when stock is insufficient', async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(productosService.deductStock(1, 10)).rejects.toThrow('Stock insuficiente');
    });
  });
});
