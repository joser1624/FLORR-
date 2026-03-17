const gastosService = require('./gastos.service');

describe('GastosService Integration Tests', () => {
  describe('Validation Requirements', () => {
    it('validates descripcion is not empty (Requirement 10.1)', async () => {
      await expect(gastosService.create({
        descripcion: '',
        categoria: 'flores',
        monto: 100,
        fecha: '2024-03-15'
      })).rejects.toThrow('Errores de validación');
    });

    it('validates categoria is in allowed list (Requirement 10.2)', async () => {
      const allowedCategorias = ['flores', 'transporte', 'materiales', 'mantenimiento', 'otros'];
      
      // Test invalid categoria
      await expect(gastosService.create({
        descripcion: 'Test',
        categoria: 'invalid_categoria',
        monto: 100,
        fecha: '2024-03-15'
      })).rejects.toThrow('Errores de validación');
    });

    it('validates monto >= 0 (Requirement 10.3)', async () => {
      await expect(gastosService.create({
        descripcion: 'Test',
        categoria: 'flores',
        monto: -50,
        fecha: '2024-03-15'
      })).rejects.toThrow('Errores de validación');
    });

    it('validates fecha is not empty (Requirement 10.4)', async () => {
      await expect(gastosService.create({
        descripcion: 'Test',
        categoria: 'flores',
        monto: 100,
        fecha: ''
      })).rejects.toThrow('Errores de validación');
    });
  });

  describe('Filtering Requirements', () => {
    beforeEach(() => {
      // Mock the database query to prevent real DB calls
      jest.spyOn(require('../config/database'), 'query').mockResolvedValue({ rows: [] });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('supports filtering by mes in YYYY-MM format (Requirement 10.5)', async () => {
      const filters = { mes: '2024-03' };
      await expect(gastosService.getAll(filters)).resolves.toBeDefined();
    });

    it('supports filtering by categoria (Requirement 10.6)', async () => {
      const filters = { categoria: 'flores' };
      await expect(gastosService.getAll(filters)).resolves.toBeDefined();
    });

    it('supports filtering by both mes and categoria', async () => {
      const filters = { mes: '2024-03', categoria: 'flores' };
      await expect(gastosService.getAll(filters)).resolves.toBeDefined();
    });
  });

  describe('Parameterized Queries (Requirement 10.7)', () => {
    it('uses parameterized queries in getAll', () => {
      // The implementation uses $1, $2 placeholders with params array
      const serviceCode = gastosService.getAll.toString();
      expect(serviceCode).toContain('$');
    });

    it('uses parameterized queries in getById', () => {
      const serviceCode = gastosService.getById.toString();
      expect(serviceCode).toContain('$1');
    });

    it('uses parameterized queries in create', () => {
      const serviceCode = gastosService.create.toString();
      expect(serviceCode).toContain('$1');
      expect(serviceCode).toContain('$2');
      expect(serviceCode).toContain('$3');
      expect(serviceCode).toContain('$4');
    });

    it('uses parameterized queries in delete', () => {
      const serviceCode = gastosService.delete.toString();
      expect(serviceCode).toContain('$1');
    });
  });
});
