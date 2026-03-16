/**
 * Unit tests for error handling middleware
 * Tests Requirements 19.1-19.7
 */

const { errorHandler, notFound } = require('./errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/api/test',
      method: 'GET',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  describe('Requirement 19.1: Standardized error response format', () => {
    test('should return error response with error, mensaje fields', () => {
      const error = new Error('Test error');
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: expect.any(String),
        })
      );
    });

    test('should include detalles field when provided', () => {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.detalles = [
        { field: 'email', message: 'Email is required' },
      ];

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: 'Validation failed',
          detalles: [{ field: 'email', message: 'Email is required' }],
        })
      );
    });
  });

  describe('Requirement 19.2: 400 errors include validation details', () => {
    test('should include detalles for validation errors', () => {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.detalles = [
        { field: 'nombre', message: 'Nombre is required' },
        { field: 'precio', message: 'Precio must be >= 0' },
      ];

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: 'Validation error',
          detalles: expect.arrayContaining([
            expect.objectContaining({ field: 'nombre' }),
            expect.objectContaining({ field: 'precio' }),
          ]),
        })
      );
    });
  });

  describe('Requirement 19.3: 401 errors return "No autorizado"', () => {
    test('should return "No autorizado" for 401 errors', () => {
      const error = new Error('Invalid token');
      error.statusCode = 401;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'No autorizado',
      });
    });
  });

  describe('Requirement 19.4: 403 errors return "Acceso denegado"', () => {
    test('should return "Acceso denegado" for 403 errors', () => {
      const error = new Error('Insufficient permissions');
      error.statusCode = 403;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Acceso denegado',
      });
    });
  });

  describe('Requirement 19.5: 404 errors return "Recurso no encontrado"', () => {
    test('should return "Recurso no encontrado" for 404 errors', () => {
      const error = new Error('Not found');
      error.statusCode = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Recurso no encontrado',
      });
    });

    test('notFound handler should return 404 with standard message', () => {
      notFound(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Recurso no encontrado',
      });
    });
  });

  describe('Requirement 19.6: Log full stack trace for 500 errors', () => {
    test('should log full stack trace for 500 errors', () => {
      const error = new Error('Database connection failed');
      error.statusCode = 500;
      error.stack = 'Error: Database connection failed\n    at test.js:1:1';

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('=== 500 ERROR - FULL STACK TRACE ===')
      );
      expect(console.error).toHaveBeenCalledWith('Stack:', error.stack);
    });

    test('should log full details for errors without status code (defaults to 500)', () => {
      const error = new Error('Unexpected error');
      error.stack = 'Error: Unexpected error\n    at test.js:1:1';

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('=== 500 ERROR - FULL STACK TRACE ===')
      );
    });
  });

  describe('Requirement 19.7: 500 errors return generic message without internal details', () => {
    test('should return generic message for 500 errors', () => {
      const error = new Error('Internal database error with sensitive info');
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Error interno del servidor',
      });
    });

    test('should not expose internal details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive internal error');
      error.statusCode = 500;
      error.stack = 'Sensitive stack trace';

      errorHandler(error, req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response.stack).toBeUndefined();
      expect(response.mensaje).toBe('Error interno del servidor');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('PostgreSQL error handling', () => {
    test('should handle unique constraint violation (23505)', () => {
      const error = new Error('duplicate key value');
      error.code = '23505';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: 'El registro ya existe',
        })
      );
    });

    test('should handle foreign key violation (23503)', () => {
      const error = new Error('foreign key constraint');
      error.code = '23503';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          mensaje: 'Referencia inválida',
        })
      );
    });

    test('should handle not null violation (23502)', () => {
      const error = new Error('null value in column');
      error.code = '23502';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should handle unknown database errors as 500', () => {
      const error = new Error('Unknown database error');
      error.code = '99999';
      error.detail = 'Sensitive database detail';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Error interno del servidor',
      });
      expect(console.error).toHaveBeenCalledWith('Database error code:', '99999');
    });
  });

  describe('Edge cases', () => {
    test('should handle errors with status instead of statusCode', () => {
      const error = new Error('Test error');
      error.status = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should default to 500 for errors without status', () => {
      const error = new Error('Unknown error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Error interno del servidor',
      });
    });
  });
});
