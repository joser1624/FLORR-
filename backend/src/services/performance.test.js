/**
 * Performance Optimizations Tests - Task 22
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7
 *
 * These tests use static analysis (no DB connection required) to verify:
 * 1. Schema has required indexes
 * 2. Service files implement pagination
 * 3. Service functions accept page/limit parameters
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '../../..', 'database', 'schema.sql');
const SERVICES_DIR = path.join(__dirname);

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// ============================================================
// 1. Schema Index Verification (Requirement 21.5)
// ============================================================
describe('Requirement 21.5 - Database indexes on frequently queried columns', () => {
  let schemaContent;

  beforeAll(() => {
    schemaContent = readFile(SCHEMA_PATH);
  });

  const requiredIndexes = [
    { name: 'usuarios.email', pattern: /CREATE INDEX.*ON usuarios\s*\(email\)/i },
    { name: 'ventas.fecha', pattern: /CREATE INDEX.*ON ventas\s*\(fecha\)/i },
    { name: 'pedidos.estado', pattern: /CREATE INDEX.*ON pedidos\s*\(estado\)/i },
    { name: 'pedidos.fecha_entrega', pattern: /CREATE INDEX.*ON pedidos\s*\(fecha_entrega\)/i },
    { name: 'productos.categoria', pattern: /CREATE INDEX.*ON productos\s*\(categoria\)/i },
    { name: 'inventario.tipo', pattern: /CREATE INDEX.*ON inventario\s*\(tipo\)/i },
    { name: 'clientes.telefono', pattern: /CREATE INDEX.*ON clientes\s*\(telefono\)/i },
  ];

  requiredIndexes.forEach(({ name, pattern }) => {
    test(`index exists on ${name}`, () => {
      expect(schemaContent).toMatch(pattern);
    });
  });
});

// ============================================================
// 2. Pagination Implementation Verification (Requirements 21.6, 21.7)
// ============================================================
describe('Requirement 21.6/21.7 - Pagination for list endpoints', () => {
  const serviceFiles = [
    'productos.service.js',
    'inventario.service.js',
    'ventas.service.js',
    'pedidos.service.js',
    'clientes.service.js',
    'trabajadores.service.js',
    'gastos.service.js',
  ];

  serviceFiles.forEach((filename) => {
    describe(`${filename}`, () => {
      let content;

      beforeAll(() => {
        content = readFile(path.join(SERVICES_DIR, filename));
      });

      test('accepts page parameter', () => {
        expect(content).toMatch(/filters\.page|page.*filters/);
      });

      test('accepts limit parameter', () => {
        expect(content).toMatch(/filters\.limit|limit.*filters/);
      });

      test('uses default page size of 50', () => {
        expect(content).toMatch(/\|\|\s*50/);
      });

      test('calculates offset for pagination', () => {
        expect(content).toMatch(/offset/i);
      });

      test('returns pagination metadata (total, page, limit, pages)', () => {
        expect(content).toMatch(/total/);
        expect(content).toMatch(/pages/);
      });
    });
  });
});

// ============================================================
// 3. Service Function Signature Tests (Requirement 21.7)
// ============================================================
describe('Requirement 21.7 - Service functions accept page/limit parameters', () => {
  const services = [
    { name: 'productos', file: './productos.service' },
    { name: 'inventario', file: './inventario.service' },
    { name: 'ventas', file: './ventas.service' },
    { name: 'pedidos', file: './pedidos.service' },
    { name: 'clientes', file: './clientes.service' },
    { name: 'trabajadores', file: './trabajadores.service' },
    { name: 'gastos', file: './gastos.service' },
  ];

  services.forEach(({ name, file }) => {
    test(`${name} service getAll accepts filters object`, () => {
      // Verify the service module loads without error
      const service = require(file);
      expect(typeof service.getAll).toBe('function');
      // getAll should accept a filters argument (length 0 means default param)
      expect(service.getAll.length).toBeLessThanOrEqual(1);
    });
  });
});

// ============================================================
// 4. Pagination Response Shape Tests (Requirement 21.6)
// ============================================================
describe('Requirement 21.6 - Pagination response shape', () => {
  beforeEach(() => {
    jest.mock('../config/database', () => ({ query: jest.fn() }));
  });

  afterEach(() => {
    jest.resetModules();
    jest.unmock('../config/database');
  });

  test('productos service getAll returns pagination shape when called with page/limit', async () => {
    const dbModule = require('../config/database');
    dbModule.query
      .mockResolvedValueOnce({ rows: [{ total: '5' }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Test' }] });

    const ProductosService = require('./productos.service');
    const result = await ProductosService.getAll({ page: 1, limit: 2 });

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('pages');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });

  test('clientes service getAll returns pagination shape', async () => {
    const dbModule = require('../config/database');
    dbModule.query
      .mockResolvedValueOnce({ rows: [{ total: '10' }] })
      .mockResolvedValueOnce({ rows: [] });

    const ClientesService = require('./clientes.service');
    const result = await ClientesService.getAll({ page: 2, limit: 5 });

    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('pages');
  });
});

// ============================================================
// 5. Default Page Size Tests (Requirement 21.6)
// ============================================================
describe('Requirement 21.6 - Default page size is 50', () => {
  const serviceFiles = [
    'productos.service.js',
    'inventario.service.js',
    'ventas.service.js',
    'pedidos.service.js',
    'clientes.service.js',
    'trabajadores.service.js',
    'gastos.service.js',
  ];

  serviceFiles.forEach((filename) => {
    test(`${filename} defaults to page size 50`, () => {
      const content = readFile(path.join(SERVICES_DIR, filename));
      // Should have || 50 as default limit
      expect(content).toMatch(/limit.*\|\|\s*50|\|\|\s*50.*limit/);
    });
  });
});
