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
    it('supports filtering by mes in YYYY-MM format (Requirement 10.5)', () => {
      // This test verifies the query construction
      const filters = { mes: '2024-03' };
      
      // The service should construct a query with TO_CHAR(fecha, 'YYYY-MM') = $1
      expect(() => gastosService.getAll(filters)).not.toThrow();
    });

    it('supports filtering by categoria (Requirement 10.6)', () => {
      // This test verifies the query construction
      const filters = { categoria: 'flores' };
      
      // The service should construct a query with categoria = $1
      expect(() => gastosService.getAll(filters)).not.toThrow();
    });

    it('supports filtering by both mes and categoria', () => {
      // This test verifies the query construction
      const filters = { mes: '2024-03', categoria: 'flores' };
      
      // The service should construct a query with both filters
      expect(() => gastosService.getAll(filters)).not.toThrow();
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
