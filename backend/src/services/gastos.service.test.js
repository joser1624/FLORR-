const gastosService = require('./gastos.service');
const { query } = require('../config/database');

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('GastosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated gastos without filters', async () => {
      const mockGastos = [
        { id: 1, descripcion: 'Compra de flores', categoria: 'flores', monto: 100.50, fecha: '2024-03-15' },
        { id: 2, descripcion: 'Transporte', categoria: 'transporte', monto: 50.00, fecha: '2024-03-14' }
      ];
      query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({ rows: mockGastos });

      const result = await gastosService.getAll({});

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockGastos);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should filter gastos by mes (YYYY-MM format)', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await gastosService.getAll({ mes: '2024-03' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("TO_CHAR(fecha, 'YYYY-MM') = $1"),
        expect.arrayContaining(['2024-03'])
      );
    });

    it('should filter gastos by categoria', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await gastosService.getAll({ categoria: 'flores' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('categoria = $1'),
        expect.arrayContaining(['flores'])
      );
    });

    it('should filter gastos by both mes and categoria', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [] });

      await gastosService.getAll({ mes: '2024-03', categoria: 'flores' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("TO_CHAR(fecha, 'YYYY-MM') = $1"),
        expect.arrayContaining(['2024-03', 'flores'])
      );
    });
  });

  describe('getById', () => {
    it('should return gasto by id', async () => {
      const mockGasto = { id: 1, descripcion: 'Compra de flores', categoria: 'flores', monto: 100.50, fecha: '2024-03-15' };
      query.mockResolvedValueOnce({ rows: [mockGasto] });

      const result = await gastosService.getById(1);

      expect(result).toEqual(mockGasto);
      expect(query).toHaveBeenCalledWith('SELECT * FROM gastos WHERE id = $1', [1]);
    });

    it('should return undefined if gasto not found', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await gastosService.getById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create gasto with valid data', async () => {
      const mockGasto = { id: 1, descripcion: 'Compra de flores', categoria: 'flores', monto: 100.50, fecha: '2024-03-15' };
      query.mockResolvedValueOnce({ rows: [mockGasto] });

      const result = await gastosService.create({ descripcion: 'Compra de flores', categoria: 'flores', monto: 100.50, fecha: '2024-03-15' });

      expect(result).toEqual(mockGasto);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO gastos'),
        ['Compra de flores', 'flores', 100.50, '2024-03-15']
      );
    });

    it('should throw error if descripcion is empty', async () => {
      await expect(gastosService.create({ descripcion: '', categoria: 'flores', monto: 100.50, fecha: '2024-03-15' }))
        .rejects.toThrow('Errores de validación');
    });

    it('should throw error if categoria is not in allowed list', async () => {
      await expect(gastosService.create({ descripcion: 'Test', categoria: 'invalid', monto: 100.50, fecha: '2024-03-15' }))
        .rejects.toThrow('Errores de validación');
    });

    it('should accept all valid categorias', async () => {
      const validCategorias = ['flores', 'transporte', 'materiales', 'mantenimiento', 'otros'];
      for (const categoria of validCategorias) {
        query.mockResolvedValueOnce({ rows: [{ id: 1, descripcion: 'Test', categoria, monto: 100, fecha: '2024-03-15' }] });
        await expect(gastosService.create({ descripcion: 'Test', categoria, monto: 100, fecha: '2024-03-15' })).resolves.toBeDefined();
      }
    });

    it('should throw error if monto is negative', async () => {
      await expect(gastosService.create({ descripcion: 'Test', categoria: 'flores', monto: -10, fecha: '2024-03-15' }))
        .rejects.toThrow('Errores de validación');
    });

    it('should accept monto of 0', async () => {
      const mockGasto = { id: 1, descripcion: 'Test', categoria: 'flores', monto: 0, fecha: '2024-03-15' };
      query.mockResolvedValueOnce({ rows: [mockGasto] });

      const result = await gastosService.create({ descripcion: 'Test', categoria: 'flores', monto: 0, fecha: '2024-03-15' });

      expect(result).toEqual(mockGasto);
    });

    it('should throw error if fecha is empty', async () => {
      await expect(gastosService.create({ descripcion: 'Test', categoria: 'flores', monto: 100.50, fecha: '' }))
        .rejects.toThrow('Errores de validación');
    });

    it('should throw multiple validation errors', async () => {
      try {
        await gastosService.create({ descripcion: '', categoria: 'invalid', monto: -10, fecha: '' });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).toBe('Errores de validación');
        expect(error.statusCode).toBe(400);
        expect(error.details).toHaveLength(4);
      }
    });
  });

  describe('update', () => {
    it('should update gasto with valid data', async () => {
      const mockGasto = { id: 1, descripcion: 'Updated', categoria: 'transporte', monto: 200.00, fecha: '2024-03-16' };
      query.mockResolvedValueOnce({ rows: [mockGasto] });

      const result = await gastosService.update(1, { descripcion: 'Updated', categoria: 'transporte', monto: 200.00, fecha: '2024-03-16' });

      expect(result).toEqual(mockGasto);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE gastos'),
        ['Updated', 'transporte', 200.00, '2024-03-16', 1]
      );
    });
  });

  describe('delete', () => {
    it('should delete gasto by id', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await gastosService.delete(1);

      expect(query).toHaveBeenCalledWith('DELETE FROM gastos WHERE id = $1', [1]);
    });
  });
});
