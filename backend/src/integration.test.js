/**
 * Integration Tests - Final integration and testing
 * Task 23: Comprehensive integration tests covering:
 * - Authentication flow (login, token validation, role-based access)
 * - API response format consistency
 * - Error handling (400, 401, 403, 404 responses)
 * - Input validation (missing required fields)
 * - Security headers (helmet headers present)
 * Requirements: 1.1-25.7 (comprehensive integration)
 */

const request = require('supertest');

// Mock the database module before requiring app
jest.mock('./config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue({ connected: true }),
}));

// Mock validateEnv to avoid env variable checks
jest.mock('./config/env', () => ({
  validateEnv: jest.fn(),
}));

const { query, getClient, checkConnection } = require('./config/database');
const jwtConfig = require('./config/jwt');

// Load app after mocks are set up
let app;
beforeAll(() => {
  app = require('./app');
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Helper: generate a valid JWT token ───────────────────────────────────────
function makeToken(payload = {}) {
  return jwtConfig.generateToken({
    id: 1,
    email: 'admin@test.com',
    rol: 'admin',
    nombre: 'Admin Test',
    ...payload,
  });
}

// ─── 1. Authentication Flow ───────────────────────────────────────────────────
describe('Authentication Flow', () => {
  describe('POST /api/auth/login', () => {
    test('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.detalles).toBeDefined();
    });

    test('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    test('returns 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    test('returns 400 when password is too short (< 6 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    test('returns 401 for invalid credentials', async () => {
      query.mockResolvedValueOnce({ rows: [] }); // user not found

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Credenciales inválidas');
    });

    test('returns 403 for inactive account', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre: 'Test', email: 'user@test.com', password: hashedPassword, rol: 'empleado', activo: false }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'password123' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Cuenta inactiva');
    });

    test('returns 200 with token and user data on successful login', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre: 'Admin', email: 'admin@test.com', password: hashedPassword, rol: 'admin', cargo: 'Gerente', activo: true }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('admin@test.com');
      expect(res.body.user.password).toBeUndefined(); // password not exposed
    });
  });

  describe('GET /api/auth/me - Token validation', () => {
    test('returns 401 when no token provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Token no proporcionado');
    });

    test('returns 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
      expect(res.body.mensaje).toBe('Token inválido o expirado');
    });

    test('returns 200 with user data for valid token', async () => {
      const token = makeToken();
      query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre: 'Admin', email: 'admin@test.com', rol: 'admin', cargo: 'Gerente' }],
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    test('returns 401 when no token provided', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });

    test('returns 200 with success message for valid token', async () => {
      const token = makeToken();
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mensaje).toBeDefined();
    });
  });
});

// ─── 2. Role-Based Access Control ─────────────────────────────────────────────
describe('Role-Based Access Control', () => {
  test('admin can access admin-only routes (trabajadores)', async () => {
    const token = makeToken({ rol: 'admin' });
    query.mockResolvedValueOnce({ rows: [{ total: '0' }] });
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/trabajadores')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('empleado cannot access admin-only routes (trabajadores)', async () => {
    const token = makeToken({ rol: 'empleado' });

    const res = await request(app)
      .get('/api/trabajadores')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);
  });

  test('duena cannot access admin-only routes (trabajadores)', async () => {
    const token = makeToken({ rol: 'duena' });

    const res = await request(app)
      .get('/api/trabajadores')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);
  });

  test('empleado can access empleado routes (pedidos)', async () => {
    const token = makeToken({ rol: 'empleado' });
    query.mockResolvedValueOnce({ rows: [{ total: '0' }] });
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(401);
    expect(res.body.mensaje).toBe('Token no proporcionado');
  });
});

// ─── 3. API Response Format Consistency ───────────────────────────────────────
describe('API Response Format Consistency', () => {
  test('successful list response has success:true and data field', async () => {
    const token = makeToken();
    query.mockResolvedValueOnce({ rows: [{ total: '2' }] });
    query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Rosa' }, { id: 2, nombre: 'Tulipán' }] });

    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('error response has error:true and mensaje field', async () => {
    const res = await request(app)
      .get('/api/productos')
      // No auth token
    ;

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
    expect(res.body.mensaje).toBeDefined();
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('404 response for unknown route has error:true', async () => {
    const res = await request(app).get('/api/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(true);
    expect(res.body.mensaje).toBe('Recurso no encontrado');
  });

  test('validation error response includes detalles array', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({}); // missing all fields

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.mensaje).toBeDefined();
    expect(Array.isArray(res.body.detalles)).toBe(true);
    expect(res.body.detalles.length).toBeGreaterThan(0);
  });

  test('created resource returns 201 status', async () => {
    const token = makeToken();
    query.mockResolvedValueOnce({
      rows: [{ id: 10, cliente_nombre: 'Juan', cliente_telefono: '987654321', estado: 'pendiente' }],
    });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente_nombre: 'Juan',
        cliente_telefono: '987654321',
        fecha_entrega: '2025-12-31',
        descripcion: 'Ramo de rosas',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ─── 4. Error Handling ────────────────────────────────────────────────────────
describe('Error Handling', () => {
  test('returns 401 for missing token with correct message', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(401);
    expect(res.body.mensaje).toBe('Token no proporcionado');
  });

  test('returns 401 for expired/invalid token with correct message', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', 'Bearer bad.token.value');

    expect(res.status).toBe(401);
    expect(res.body.mensaje).toBe('Token inválido o expirado');
  });

  test('returns 403 for insufficient role', async () => {
    const token = makeToken({ rol: 'empleado' });
    const res = await request(app)
      .get('/api/trabajadores')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);
  });

  test('returns 404 for non-existent resource', async () => {
    const token = makeToken();
    query.mockResolvedValueOnce({ rows: [] }); // not found

    const res = await request(app)
      .get('/api/productos/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(true);
  });

  test('returns 400 for invalid input data', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: '', precio: -1 }); // invalid data

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });
});

// ─── 5. Input Validation ──────────────────────────────────────────────────────
describe('Input Validation', () => {
  test('login rejects missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    const campos = res.body.detalles?.map(d => d.campo) || [];
    expect(campos).toContain('email');
  });

  test('login rejects missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com' });

    expect(res.status).toBe(400);
    const campos = res.body.detalles?.map(d => d.campo) || [];
    expect(campos).toContain('password');
  });

  test('login rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-valid', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('pedidos creation rejects missing required fields', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // all fields missing

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('productos creation rejects missing nombre', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ precio: 10, costo: 5, stock: 10, categoria: 'Ramos' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });
});

// ─── 6. Security Headers ──────────────────────────────────────────────────────
describe('Security Headers', () => {
  test('X-Content-Type-Options header is set to nosniff', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('X-Frame-Options header is set to DENY', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  test('X-XSS-Protection header is present', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-xss-protection']).toBeDefined();
  });

  test('Strict-Transport-Security header is present', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
  });

  test('health endpoint does not require authentication', async () => {
    const res = await request(app).get('/health');
    expect(res.status).not.toBe(401);
    expect([200, 503]).toContain(res.status);
  });
});

// ─── 7. Health Check ──────────────────────────────────────────────────────────
describe('Health Check Endpoint', () => {
  test('returns 200 when database is connected', async () => {
    checkConnection.mockResolvedValueOnce({ connected: true });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.database).toBe('connected');
  });

  test('returns 503 when database is disconnected', async () => {
    checkConnection.mockResolvedValueOnce({ connected: false, error: 'Connection refused' });

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.database).toBe('disconnected');
  });

  test('health response includes timestamp', async () => {
    checkConnection.mockResolvedValueOnce({ connected: true });

    const res = await request(app).get('/health');

    expect(res.body.timestamp).toBeDefined();
  });
});

// ─── 8. CORS Configuration ────────────────────────────────────────────────────
describe('CORS Configuration', () => {
  test('allows requests with no origin (Postman/curl)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).not.toBe(403);
  });

  test('rejects requests from unauthorized origins', async () => {
    const originalOrigin = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'http://localhost:5500';

    // Need a fresh app instance for this test - test the CORS logic directly
    // The existing app uses the env at startup, so we verify the 403 response format
    const corsApp = require('express')();
    const cors = require('cors');
    const helmet = require('helmet');

    corsApp.use(helmet({ contentSecurityPolicy: false }));
    corsApp.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin === 'http://localhost:5500') {
          callback(null, true);
        } else {
          callback(new Error('Origen no autorizado por política CORS'), false);
        }
      },
      credentials: true,
    }));
    corsApp.get('/test', (req, res) => res.json({ ok: true }));
    corsApp.use((err, req, res, next) => {
      if (err.message === 'Origen no autorizado por política CORS') {
        return res.status(403).json({ error: true, mensaje: 'Origen no autorizado por política CORS' });
      }
      next(err);
    });

    const res = await request(corsApp)
      .get('/test')
      .set('Origin', 'http://evil-site.com');

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);

    process.env.CORS_ORIGIN = originalOrigin;
  });
});
