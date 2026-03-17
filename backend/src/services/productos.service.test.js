const productosService = require('./productos.service');
const { query } = require('../config/database');

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('ProductosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated products without filters', async () => {
      const mockProducts = [
        { id: 1, nombre: 'Ramo de Rosas', categoria: 'Ramos', activo: true },
        { id: 2, nombre: 'Arreglo Floral', categoria: 'Arreglos', activo: true }
      ];
      query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] }) // count
        .mockResolvedValueOnce({ rows: mockProducts }); // data

      const result = await productosService.getAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 2);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 50);
      expect(result.data).toEqual(mockProducts);
    });

    it('should filter by categoria', async () => {
      const mockProducts = [{ id: 1, nombre: 'Ramo de Rosas', categoria: 'Ramos' }];
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: mockProducts });

      await productosService.getAll({ categoria: 'Ramos' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('categoria = $1'),
        expect.arrayContaining(['Ramos'])
      );
    });

    it('should filter by activo status', async () => {
      const mockProducts = [{ id: 1, nombre: 'Ramo de Rosas', activo: true }];
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: mockProducts });

      await productosService.getAll({ activo: true });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('activo = $1'),
        expect.arrayContaining([true])
      );
    });

    it('should filter by both categoria and activo', async () => {
      const mockProducts = [{ id: 1, nombre: 'Ramo de Rosas', categoria: 'Ramos', activo: true }];
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: mockProducts });

      await productosService.getAll({ categoria: 'Ramos', activo: true });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('categoria = $1'),
        expect.arrayContaining(['Ramos', true])
      );
    });

    it('should support custom page and limit', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '100' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await productosService.getAll({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.pages).toBe(10);
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
      await expect(productosService.create({ nombre: '', categoria: 'Ramos', precio: 50, costo: 30 }))
        .rejects.toThrow('El nombre del producto no puede estar vacío');
    });

    it('should throw error if precio is negative', async () => {
      await expect(productosService.create({ nombre: 'Test', categoria: 'Ramos', precio: -10, costo: 30 }))
        .rejects.toThrow('El precio debe ser mayor o igual a cero');
    });

    it('should throw error if costo is negative', async () => {
      await expect(productosService.create({ nombre: 'Test', categoria: 'Ramos', precio: 50, costo: -10 }))
        .rejects.toThrow('El costo debe ser mayor o igual a cero');
    });

    it('should throw error if stock is negative', async () => {
      await expect(productosService.create({ nombre: 'Test', categoria: 'Ramos', precio: 50, costo: 30, stock: -5 }))
        .rejects.toThrow('El stock debe ser mayor o igual a cero');
    });

    it('should throw error if categoria is invalid', async () => {
      await expect(productosService.create({ nombre: 'Test', categoria: 'InvalidCategory', precio: 50, costo: 30 }))
        .rejects.toThrow('La categoría debe ser una de: Ramos, Arreglos, Peluches, Cajas sorpresa, Globos, Otros');
    });

    it('should accept all valid categorias', async () => {
      const validCategorias = ['Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros'];
      for (const categoria of validCategorias) {
        query.mockResolvedValue({ rows: [{ id: 1, nombre: 'Test', categoria }] });
        await expect(productosService.create({ nombre: 'Test', categoria, precio: 50, costo: 30 })).resolves.toBeDefined();
      }
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateData = { nombre: 'Ramo Actualizado', categoria: 'Ramos', precio: 60, costo: 35, stock: 15 };
      const mockUpdated = { id: 1, ...updateData };
      query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await productosService.update(1, updateData);

      expect(result).toEqual(mockUpdated);
    });

    it('should throw error if nombre is empty on update', async () => {
      await expect(productosService.update(1, { nombre: '' }))
        .rejects.toThrow('El nombre del producto no puede estar vacío');
    });

    it('should throw error if precio is negative on update', async () => {
      await expect(productosService.update(1, { precio: -10 }))
        .rejects.toThrow('El precio debe ser mayor o igual a cero');
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
