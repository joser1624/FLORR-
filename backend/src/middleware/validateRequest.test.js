/**
 * Unit tests for validateRequest middleware
 * Tests validation rules for all requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */

const { validateRequest, validationRules, body, param, query } = require('./validateRequest');
const { validationResult } = require('express-validator');

// Mock express request/response/next
const createMockReq = (bodyData = {}, paramsData = {}, queryData = {}) => ({
  body: bodyData,
  params: paramsData,
  query: queryData,
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => jest.fn();

// Helper to run validation chain
const runValidation = async (validationChain, req) => {
  await Promise.all(validationChain.map(validation => validation.run(req)));
};

describe('validateRequest middleware', () => {
  describe('Requirement 17.1: Required fields validation', () => {
    test('should reject request when required string field is missing', async () => {
      const req = createMockReq({});
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('nombre', 'Nombre'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: 'Errores de validación',
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'nombre',
              mensaje: 'Nombre es requerido',
            }),
          ]),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should accept request when required field is present', async () => {
      const req = createMockReq({ nombre: 'Test Name' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('nombre', 'Nombre'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject when array field is empty', async () => {
      const req = createMockReq({ items: [] });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.array('items', 'Items'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'items',
              mensaje: 'Items no puede estar vacío',
            }),
          ]),
        })
      );
    });
  });

  describe('Requirement 17.2: Data type validation', () => {
    test('should validate string data type', async () => {
      const req = createMockReq({ nombre: 123 });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('nombre', 'Nombre'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'nombre',
              mensaje: 'Nombre debe ser texto',
            }),
          ]),
        })
      );
    });

    test('should validate numeric data type', async () => {
      const req = createMockReq({ precio: 'not-a-number' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.numericRange('precio', 'Precio', 0),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'precio',
              mensaje: 'Precio debe ser numérico',
            }),
          ]),
        })
      );
    });

    test('should validate boolean data type', async () => {
      const req = createMockReq({ activo: 'yes' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.boolean('activo', 'Activo'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'activo',
              mensaje: 'Activo debe ser verdadero o falso',
            }),
          ]),
        })
      );
    });

    test('should validate integer data type', async () => {
      const req = createMockReq({ cantidad: 5.5 });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.integerRange('cantidad', 'Cantidad', 1),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Requirement 17.3: Return 400 with detailed validation messages', () => {
    test('should return 400 status code on validation error', async () => {
      const req = createMockReq({});
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('nombre', 'Nombre'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return detailed validation messages with field names', async () => {
      const req = createMockReq({ precio: -10, email: 'invalid' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.numericRange('precio', 'Precio', 0),
        validationRules.email('email'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: 'Errores de validación',
          detalles: expect.any(Array),
        })
      );

      const response = res.json.mock.calls[0][0];
      expect(response.detalles.length).toBeGreaterThan(0);
      expect(response.detalles[0]).toHaveProperty('campo');
      expect(response.detalles[0]).toHaveProperty('mensaje');
    });

    test('should return multiple validation errors', async () => {
      const req = createMockReq({});
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('nombre', 'Nombre'),
        validationRules.email('email'),
        validationRules.numericRange('precio', 'Precio', 0),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.detalles.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Requirement 17.4: Sanitize string inputs', () => {
    test('should trim whitespace from string inputs', async () => {
      const req = createMockReq({ nombre: '  Test Name  ' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('nombre', 'Nombre'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(req.body.nombre).toBe('Test Name');
      expect(next).toHaveBeenCalled();
    });

    test('should escape HTML characters from string inputs', async () => {
      const req = createMockReq({ descripcion: '<script>alert("xss")</script>' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.requiredString('descripcion', 'Descripción'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(req.body.descripcion).not.toContain('<script>');
      expect(req.body.descripcion).toContain('&lt;');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Requirement 17.5: Validate email format', () => {
    test('should accept valid email format', async () => {
      const req = createMockReq({ email: 'test@example.com' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.email('email'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject invalid email format', async () => {
      const req = createMockReq({ email: 'not-an-email' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.email('email'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'email',
              mensaje: 'Email debe tener formato válido',
            }),
          ]),
        })
      );
    });

    test('should normalize email format', async () => {
      const req = createMockReq({ email: 'Test@Example.COM' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.email('email'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(req.body.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Requirement 17.6: Validate numeric ranges', () => {
    test('should accept numeric value within range', async () => {
      const req = createMockReq({ precio: 50 });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.numericRange('precio', 'Precio', 0, 100),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject numeric value below minimum', async () => {
      const req = createMockReq({ precio: -10 });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.numericRange('precio', 'Precio', 0),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'precio',
              mensaje: 'Precio debe ser mayor o igual a 0',
            }),
          ]),
        })
      );
    });

    test('should reject numeric value above maximum', async () => {
      const req = createMockReq({ descuento: 150 });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.numericRange('descuento', 'Descuento', 0, 100),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'descuento',
              mensaje: 'Descuento debe ser menor o igual a 100',
            }),
          ]),
        })
      );
    });

    test('should validate integer ranges', async () => {
      const req = createMockReq({ cantidad: 5 });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.integerRange('cantidad', 'Cantidad', 1, 100),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Requirement 17.7: Validate ISO 8601 date format', () => {
    test('should accept valid ISO 8601 date', async () => {
      const req = createMockReq({ fecha: '2024-01-15' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.isoDate('fecha', 'Fecha'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should accept ISO 8601 datetime format', async () => {
      const req = createMockReq({ fecha: '2024-01-15T10:30:00Z' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.isoDate('fecha', 'Fecha'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should reject invalid date format', async () => {
      const req = createMockReq({ fecha: '15/01/2024' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.isoDate('fecha', 'Fecha'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'fecha',
              mensaje: 'Fecha debe estar en formato ISO 8601 (YYYY-MM-DD)',
            }),
          ]),
        })
      );
    });

    test('should reject non-date string', async () => {
      const req = createMockReq({ fecha: 'not-a-date' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.isoDate('fecha', 'Fecha'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Additional validation helpers', () => {
    test('should validate enum values', async () => {
      const req = createMockReq({ categoria: 'Ramos' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.enum('categoria', 'Categoría', ['Ramos', 'Arreglos', 'Peluches']),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should reject invalid enum value', async () => {
      const req = createMockReq({ categoria: 'Invalid' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.enum('categoria', 'Categoría', ['Ramos', 'Arreglos', 'Peluches']),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should validate phone number format', async () => {
      const req = createMockReq({ telefono: '123-456-7890' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.phone('telefono'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should validate password minimum length', async () => {
      const req = createMockReq({ password: '12345' });
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.password('password', 6),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should validate URL parameter ID', async () => {
      const req = createMockReq({}, { id: '123' }, {});
      const res = createMockRes();
      const next = createMockNext();

      const validation = [
        validationRules.idParam('id'),
        validateRequest,
      ];

      await runValidation(validation.slice(0, -1), req);
      validation[validation.length - 1](req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
