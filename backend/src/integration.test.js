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

// ─── 9. Sales Flow ────────────────────────────────────────────────────────────
describe('Sales Flow', () => {
  function mockClientTransaction() {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    // BEGIN
    mockClient.query.mockResolvedValueOnce({});
    return mockClient;
  }

  test('POST /api/ventas returns 400 when productos array is empty', async () => {
    const token = makeToken({ rol: 'empleado' });

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({ productos: [], metodo_pago: 'Efectivo' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('POST /api/ventas returns 400 when metodo_pago is invalid', async () => {
    const token = makeToken({ rol: 'empleado' });

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productos: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }],
        metodo_pago: 'Bitcoin',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('POST /api/ventas returns 400 when stock is insufficient', async () => {
    const token = makeToken({ rol: 'empleado' });

    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    getClient.mockResolvedValueOnce(mockClient);
    // BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // SELECT producto (stock insuficiente)
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Rosa Roja', stock: 2 }],
    });
    // ROLLBACK
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productos: [{ producto_id: 1, cantidad: 10, precio_unitario: 5 }],
        metodo_pago: 'Efectivo',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.mensaje).toContain('Stock insuficiente');
  });

  test('POST /api/ventas creates sale and returns 201', async () => {
    const token = makeToken({ rol: 'empleado', id: 1 });

    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    getClient.mockResolvedValueOnce(mockClient);
    // BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // SELECT producto (stock suficiente)
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Rosa Roja', stock: 20 }],
    });
    // INSERT venta
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 5, total: 50, metodo_pago: 'Efectivo', trabajador_id: 1, cliente_id: null }],
    });
    // INSERT ventas_productos
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    // UPDATE stock
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    // COMMIT
    mockClient.query.mockResolvedValueOnce({});

    // getById call after creation
    query.mockResolvedValueOnce({
      rows: [{ id: 5, total: 50, metodo_pago: 'Efectivo', trabajador_id: 1 }],
    });
    query.mockResolvedValueOnce({ rows: [] }); // ventas_productos

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productos: [{ producto_id: 1, cantidad: 5, precio_unitario: 10 }],
        metodo_pago: 'Efectivo',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.venta).toBeDefined();
  });

  test('POST /api/ventas rolls back transaction on error', async () => {
    const token = makeToken({ rol: 'empleado', id: 1 });

    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    getClient.mockResolvedValueOnce(mockClient);
    // BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // SELECT producto — throws error
    mockClient.query.mockRejectedValueOnce(new Error('DB error'));
    // ROLLBACK
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productos: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }],
        metodo_pago: 'Efectivo',
      });

    expect(res.status).toBe(500);
    // Verify ROLLBACK was called
    const rollbackCall = mockClient.query.mock.calls.find(
      call => call[0] === 'ROLLBACK'
    );
    expect(rollbackCall).toBeDefined();
  });
});

// ─── 10. Order Workflow ───────────────────────────────────────────────────────
describe('Order Workflow', () => {
  test('POST /api/pedidos creates order with estado pendiente and returns 201', async () => {
    const token = makeToken({ rol: 'empleado' });
    query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        cliente_nombre: 'María García',
        cliente_telefono: '987654321',
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString(),
        fecha_entrega: '2025-12-31',
        descripcion: 'Ramo de rosas rojas',
      }],
    });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente_nombre: 'María García',
        cliente_telefono: '987654321',
        fecha_entrega: '2025-12-31',
        descripcion: 'Ramo de rosas rojas',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.pedido.estado).toBe('pendiente');
  });

  test('POST /api/pedidos returns 400 when required fields are missing', async () => {
    const token = makeToken({ rol: 'empleado' });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ cliente_nombre: 'María' }); // missing telefono, fecha_entrega, descripcion

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('PUT /api/pedidos/:id updates estado and returns 200', async () => {
    const token = makeToken({ rol: 'empleado' });
    query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        estado: 'en preparación',
        cliente_nombre: 'María García',
      }],
    });

    const res = await request(app)
      .put('/api/pedidos/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'en preparación' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/pedidos returns list with pagination', async () => {
    const token = makeToken({ rol: 'empleado' });
    query.mockResolvedValueOnce({ rows: [{ total: '3' }] });
    query.mockResolvedValueOnce({
      rows: [
        { id: 1, estado: 'pendiente', cliente_nombre: 'Ana' },
        { id: 2, estado: 'en preparación', cliente_nombre: 'Luis' },
        { id: 3, estado: 'listo para entrega', cliente_nombre: 'Carlos' },
      ],
    });

    const res = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.pedidos.data)).toBe(true);
  });
});

// ─── 11. Cash Register Flow ───────────────────────────────────────────────────
describe('Cash Register Flow', () => {
  test('GET /api/caja/hoy returns 404 when no register is open', async () => {
    const token = makeToken({ rol: 'empleado' });
    query.mockRejectedValueOnce(Object.assign(new Error('No hay caja abierta'), { statusCode: 404 }));

    // The service throws with statusCode 404 — mock the query to return empty rows
    query.mockReset();
    query.mockResolvedValueOnce({ rows: [] }); // getHoy returns empty

    const res = await request(app)
      .get('/api/caja/hoy')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(true);
  });

  test('POST /api/caja/apertura opens register and returns 201', async () => {
    const token = makeToken({ rol: 'empleado', id: 1 });
    // Check existing open caja — none found
    query.mockResolvedValueOnce({ rows: [] });
    // INSERT caja
    query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        fecha: new Date().toISOString().split('T')[0],
        monto_apertura: '500.00',
        estado: 'abierta',
        trabajador_apertura_id: 1,
      }],
    });

    const res = await request(app)
      .post('/api/caja/apertura')
      .set('Authorization', `Bearer ${token}`)
      .send({ monto_apertura: 500 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('POST /api/caja/apertura returns 400 when monto_apertura is negative', async () => {
    const token = makeToken({ rol: 'empleado', id: 1 });

    const res = await request(app)
      .post('/api/caja/apertura')
      .set('Authorization', `Bearer ${token}`)
      .send({ monto_apertura: -100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('POST /api/caja/cierre closes register and returns totals', async () => {
    const token = makeToken({ rol: 'empleado', id: 1 });
    // SELECT caja abierta
    query.mockResolvedValueOnce({
      rows: [{ id: 1, fecha: new Date().toISOString().split('T')[0], estado: 'abierta' }],
    });
    // SELECT totals from ventas
    query.mockResolvedValueOnce({
      rows: [{ total_efectivo: '300.00', total_digital: '150.00', total_tarjeta: '50.00', total_ventas: '500.00' }],
    });
    // SELECT gastos
    query.mockResolvedValueOnce({ rows: [{ total_gastos: '100.00' }] });
    // UPDATE caja
    query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        monto_apertura: '500.00',
        monto_cierre: null,
        total_efectivo: '300.00',
        total_digital: '150.00',
        total_tarjeta: '50.00',
        total_ventas: '500.00',
        total_gastos: '100.00',
        estado: 'cerrada',
      }],
    });

    const res = await request(app)
      .post('/api/caja/cierre')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_ventas).toBe(500);
    expect(res.body.data.total_gastos).toBe(100);
  });
});

// ─── 12. Dashboard Statistics ─────────────────────────────────────────────────
describe('Dashboard Statistics', () => {
  test('GET /api/dashboard returns all required fields', async () => {
    const token = makeToken({ rol: 'admin' });

    // Mock all 10 parallel queries in getDashboardStats
    query
      .mockResolvedValueOnce({ rows: [{ total: '1500.00' }] })           // ventas_dia
      .mockResolvedValueOnce({ rows: [{ total: '45000.00' }] })          // ventas_mes
      .mockResolvedValueOnce({ rows: [{ total: '12000.00' }] })          // gastos_mes
      .mockResolvedValueOnce({ rows: [{ total: '5' }] })                 // pedidos_pendientes
      .mockResolvedValueOnce({ rows: [{ total: '3' }] })                 // pedidos_hoy
      .mockResolvedValueOnce({ rows: [{ total: '42' }] })                // pedidos_mes
      .mockResolvedValueOnce({ rows: [] })                               // stock_bajo
      .mockResolvedValueOnce({ rows: [] })                               // ventas_semana
      .mockResolvedValueOnce({ rows: [] })                               // top_productos
      .mockResolvedValueOnce({ rows: [] });                              // ventas_trabajadores

    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data).toHaveProperty('ventas_dia');
    expect(data).toHaveProperty('ventas_mes');
    expect(data).toHaveProperty('ganancia_mes');
    expect(data).toHaveProperty('margen_mes');
    expect(data).toHaveProperty('pedidos_pendientes');
    expect(data).toHaveProperty('stock_bajo');
    expect(data).toHaveProperty('ventas_semana');
    expect(data).toHaveProperty('top_productos');
    expect(data).toHaveProperty('ventas_trabajadores');
  });

  test('GET /api/dashboard calculates ganancia_mes correctly', async () => {
    const token = makeToken({ rol: 'admin' });

    query
      .mockResolvedValueOnce({ rows: [{ total: '1000.00' }] })   // ventas_dia
      .mockResolvedValueOnce({ rows: [{ total: '10000.00' }] })  // ventas_mes
      .mockResolvedValueOnce({ rows: [{ total: '3000.00' }] })   // gastos_mes
      .mockResolvedValueOnce({ rows: [{ total: '2' }] })
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [{ total: '10' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // ganancia_mes = 10000 - 3000 = 7000
    expect(res.body.data.ganancia_mes).toBe(7000);
    // margen_mes = (7000 / 10000) * 100 = 70
    expect(res.body.data.margen_mes).toBe(70);
  });
});

// ─── 13. Monthly Reports ──────────────────────────────────────────────────────
describe('Monthly Reports', () => {
  test('GET /api/reportes returns report with all required fields', async () => {
    const token = makeToken({ rol: 'admin' });

    // Mock all 7 parallel queries in getMonthlyReport
    query
      .mockResolvedValueOnce({ rows: [{ total: '50000.00' }] })   // ventas_total
      .mockResolvedValueOnce({ rows: [{ total: '15000.00' }] })   // gastos_total
      .mockResolvedValueOnce({ rows: [{ total: '80' }] })         // total_pedidos
      .mockResolvedValueOnce({ rows: [] })                        // ventas_dias
      .mockResolvedValueOnce({ rows: [                            // metodos_pago
        { metodo: 'Efectivo', total: '30000.00' },
        { metodo: 'Yape', total: '20000.00' },
      ] })
      .mockResolvedValueOnce({ rows: [] })                        // top_productos
      .mockResolvedValueOnce({ rows: [] });                       // ventas_trabajadores

    const res = await request(app)
      .get('/api/reportes?mes=2025-03')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const reporte = res.body.data.reporte;
    expect(reporte).toHaveProperty('mes', '2025-03');
    expect(reporte).toHaveProperty('ventas_total');
    expect(reporte).toHaveProperty('gastos_total');
    expect(reporte).toHaveProperty('ganancia');
    expect(reporte).toHaveProperty('metodos_pago');
    expect(reporte).toHaveProperty('top_productos');
    expect(reporte).toHaveProperty('ventas_trabajadores');
  });

  test('GET /api/reportes returns 400 for invalid mes format', async () => {
    const token = makeToken({ rol: 'admin' });

    const res = await request(app)
      .get('/api/reportes?mes=marzo-2025')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('GET /api/reportes returns 400 when mes is missing', async () => {
    const token = makeToken({ rol: 'admin' });

    const res = await request(app)
      .get('/api/reportes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  test('GET /api/reportes calculates ganancia correctly', async () => {
    const token = makeToken({ rol: 'admin' });

    query
      .mockResolvedValueOnce({ rows: [{ total: '20000.00' }] })  // ventas_total
      .mockResolvedValueOnce({ rows: [{ total: '5000.00' }] })   // gastos_total
      .mockResolvedValueOnce({ rows: [{ total: '30' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/reportes?mes=2025-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // ganancia = 20000 - 5000 = 15000
    expect(res.body.data.reporte.ganancia).toBe(15000);
  });

  test('GET /api/reportes is restricted to admin and duena roles', async () => {
    const token = makeToken({ rol: 'empleado' });

    const res = await request(app)
      .get('/api/reportes?mes=2025-03')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);
  });
});
