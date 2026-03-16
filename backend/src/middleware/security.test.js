const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Create a test app with the same security configuration
function createTestApp(corsOrigin = 'http://localhost:5500') {
  const app = express();
  
  // Set environment variable for testing
  process.env.CORS_ORIGIN = corsOrigin;
  
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];
  
  // Configure helmet with specific security headers
  app.use(helmet({
    contentSecurityPolicy: false,
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    xXssProtection: true,
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // Configure CORS
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Origen no autorizado por política CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
  
  // Test route
  app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Test endpoint' });
  });
  
  // CORS error handler
  app.use((err, req, res, next) => {
    if (err.message === 'Origen no autorizado por política CORS') {
      return res.status(403).json({ error: true, mensaje: 'Origen no autorizado' });
    }
    next(err);
  });
  
  return app;
}

describe('Security Middleware Tests', () => {
  describe('Helmet Security Headers', () => {
    let app;
    
    beforeEach(() => {
      app = createTestApp();
    });
    
    test('should set X-Content-Type-Options header to nosniff', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
    
    test('should set X-Frame-Options header to DENY', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });
    
    test('should set X-XSS-Protection header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
    
    test('should set Strict-Transport-Security header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['strict-transport-security']).toContain('includeSubDomains');
    });
  });
  
  describe('CORS Configuration', () => {
    test('should allow requests from configured origin', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:5500');
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5500');
    });
    
    test('should allow requests from multiple configured origins', async () => {
      const app = createTestApp('http://localhost:5500,http://127.0.0.1:5500');
      
      const response1 = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:5500');
      expect(response1.status).toBe(200);
      
      const response2 = await request(app)
        .get('/test')
        .set('Origin', 'http://127.0.0.1:5500');
      expect(response2.status).toBe(200);
    });
    
    test('should reject requests from unauthorized origins with 403', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://evil-site.com');
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe(true);
      expect(response.body.mensaje).toBe('Origen no autorizado');
    });
    
    test('should allow requests with no origin (Postman, curl)', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
    });
    
    test('should allow wildcard origin', async () => {
      const app = createTestApp('*');
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://any-site.com');
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('HTTP Methods', () => {
    test('should allow GET method', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });
    
    test('should allow POST method', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500')
        .set('Access-Control-Request-Method', 'POST');
      
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
    
    test('should allow PUT method', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500')
        .set('Access-Control-Request-Method', 'PUT');
      
      expect(response.headers['access-control-allow-methods']).toContain('PUT');
    });
    
    test('should allow DELETE method', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500')
        .set('Access-Control-Request-Method', 'DELETE');
      
      expect(response.headers['access-control-allow-methods']).toContain('DELETE');
    });
    
    test('should allow OPTIONS method', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500');
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('Allowed Headers', () => {
    test('should allow Content-Type header', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500')
        .set('Access-Control-Request-Headers', 'Content-Type');
      
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    });
    
    test('should allow Authorization header', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5500')
        .set('Access-Control-Request-Headers', 'Authorization');
      
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
    });
  });
  
  describe('Credentials', () => {
    test('should allow credentials', async () => {
      const app = createTestApp('http://localhost:5500');
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:5500');
      
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
