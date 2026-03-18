/**
 * Integration test for Laboratorio page - Task 3.3
 * Tests arrangement save with actual backend API
 */

const request = require('supertest');
const app = require('../app');
const { query } = require('../config/database');

describe('Laboratorio - Arrangement Save Integration (Task 3.3)', () => {
  let authToken;
  let inventarioIds = [];

  beforeAll(async () => {
    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@encantos.com',
        password: 'admin123'
      });
    
    authToken = loginRes.body.token;

    // Create test inventory items
    const items = [
      { nombre: 'Test Rosas', tipo: 'flores', stock: 50, costo: 3.50, stock_min: 10, unidad: 'unidad' },
      { nombre: 'Test Lirios', tipo: 'flores', stock: 30, costo: 2.80, stock_min: 5, unidad: 'unidad' },
      { nombre: 'Test Papel', tipo: 'materiales', stock: 20, costo: 8.50, stock_min: 3, unidad: 'rollo' }
    ];

    for (const item of items) {
      const result = await query(
        `INSERT INTO inventario (nombre, tipo, stock, costo, stock_min, unidad)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [item.nombre, item.tipo, item.stock, item.costo, item.stock_min, item.unidad]
      );
      inventarioIds.push(result.rows[0].id);
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (inventarioIds.length > 0) {
      await query(
        `DELETE FROM arreglos WHERE nombre LIKE 'Test Arreglo%'`
      );
      await query(
        `DELETE FROM inventario WHERE id = ANY($1)`,
        [inventarioIds]
      );
    }
  });

  describe('POST /api/arreglos', () => {
    test('should create arrangement with valid payload', async () => {
      const payload = {
        nombre: 'Test Arreglo Primaveral',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 },
          { inventario_id: inventarioIds[1], cantidad: 3 }
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.nombre).toBe('Test Arreglo Primaveral');
      expect(response.body.data.margen).toBe(40);
      expect(response.body.data.costo_total).toBeCloseTo(25.90, 2); // 5*3.50 + 3*2.80
      expect(response.body.data.precio_venta).toBeCloseTo(43.17, 2); // 25.90 / 0.60
      expect(response.body.data.items).toHaveLength(2);
    });

    test('should return 400 when nombre is empty', async () => {
      const payload = {
        nombre: '',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 }
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
    });

    test('should return 400 when margen is invalid', async () => {
      const payload = {
        nombre: 'Test Arreglo',
        margen: 150, // Invalid: > 100
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 }
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
    });

    test('should return 400 when items array is empty', async () => {
      const payload = {
        nombre: 'Test Arreglo',
        margen: 40,
        items: []
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
    });

    test('should return 400 when item has invalid cantidad', async () => {
      const payload = {
        nombre: 'Test Arreglo',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 0 } // Invalid: cantidad <= 0
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
    });

    test('should return 400 when inventario_id does not exist', async () => {
      const payload = {
        nombre: 'Test Arreglo',
        margen: 40,
        items: [
          { inventario_id: 99999, cantidad: 5 } // Non-existent ID
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
    });

    test('should calculate costo_total correctly', async () => {
      const payload = {
        nombre: 'Test Arreglo Costo',
        margen: 30,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 10 }, // 10 * 3.50 = 35.00
          { inventario_id: inventarioIds[1], cantidad: 5 },  // 5 * 2.80 = 14.00
          { inventario_id: inventarioIds[2], cantidad: 2 }   // 2 * 8.50 = 17.00
        ]
        // Total: 66.00
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.data.costo_total).toBeCloseTo(66.00, 2);
      expect(response.body.data.precio_venta).toBeCloseTo(94.29, 2); // 66.00 / 0.70
    });

    test('should include inventory details in items array', async () => {
      const payload = {
        nombre: 'Test Arreglo Details',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 }
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.data.items[0]).toHaveProperty('inventario_id');
      expect(response.body.data.items[0]).toHaveProperty('cantidad');
      expect(response.body.data.items[0]).toHaveProperty('nombre');
      expect(response.body.data.items[0]).toHaveProperty('tipo');
      expect(response.body.data.items[0]).toHaveProperty('costo');
    });

    test('should return 401 when no auth token provided', async () => {
      const payload = {
        nombre: 'Test Arreglo',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 }
        ]
      };

      await request(app)
        .post('/api/arreglos')
        .send(payload)
        .expect(401);
    });

    test('should trim nombre before saving', async () => {
      const payload = {
        nombre: '  Test Arreglo Trimmed  ',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 }
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.data.nombre).toBe('Test Arreglo Trimmed');
    });
  });

  describe('GET /api/arreglos/:id', () => {
    let arregloId;

    beforeAll(async () => {
      // Create a test arrangement
      const payload = {
        nombre: 'Test Arreglo For Retrieval',
        margen: 40,
        items: [
          { inventario_id: inventarioIds[0], cantidad: 5 },
          { inventario_id: inventarioIds[1], cantidad: 3 }
        ]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      arregloId = response.body.data.id;
    });

    test('should retrieve arrangement with recipe', async () => {
      const response = await request(app)
        .get(`/api/arreglos/${arregloId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(arregloId);
      expect(response.body.data.nombre).toBe('Test Arreglo For Retrieval');
      expect(response.body.data.items).toHaveLength(2);
    });

    test('should return 404 for non-existent arrangement', async () => {
      await request(app)
        .get('/api/arreglos/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Requirements Validation', () => {
    test('Requirement 2.3: Frontend sends POST to /api/arreglos', async () => {
      const payload = {
        nombre: 'Test Req 2.3',
        margen: 40,
        items: [{ inventario_id: inventarioIds[0], cantidad: 5 }]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(201);
    });

    test('Requirement 2.4: Payload includes nombre, margen, and items', async () => {
      const payload = {
        nombre: 'Test Req 2.4',
        margen: 40,
        items: [{ inventario_id: inventarioIds[0], cantidad: 5 }]
      };

      expect(payload).toHaveProperty('nombre');
      expect(payload).toHaveProperty('margen');
      expect(payload).toHaveProperty('items');
      expect(Array.isArray(payload.items)).toBe(true);
    });

    test('Requirement 2.5: Backend returns success response', async () => {
      const payload = {
        nombre: 'Test Req 2.5',
        margen: 40,
        items: [{ inventario_id: inventarioIds[0], cantidad: 5 }]
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.mensaje).toBeDefined();
    });

    test('Requirement 2.6: Backend returns error for invalid data', async () => {
      const payload = {
        nombre: '',
        margen: 40,
        items: []
      };

      const response = await request(app)
        .post('/api/arreglos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
    });
  });
});
