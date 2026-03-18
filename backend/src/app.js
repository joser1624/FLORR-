const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { validateEnv } = require('./config/env');
const { checkConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const ventasRoutes = require('./routes/ventas.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const trabajadoresRoutes = require('./routes/trabajadores.routes');
const gastosRoutes = require('./routes/gastos.routes');
const reportesRoutes = require('./routes/reportes.routes');
const cajaRoutes = require('./routes/caja.routes');
const arreglosRoutes = require('./routes/arreglos.routes');
const promocionesRoutes = require('./routes/promociones.routes');
const eventosRoutes = require('./routes/eventos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const capitalRoutes = require('./routes/capital.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware Configuration
// Configure helmet with specific security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  xContentTypeOptions: true, // X-Content-Type-Options: nosniff
  xFrameOptions: { action: 'deny' }, // X-Frame-Options: DENY
  xXssProtection: true, // X-XSS-Protection: 1; mode=block
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// Configure CORS with allowed origins from environment
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // Reject unauthorized origins with 403
      callback(new Error('Origen no autorizado por política CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true,
  optionsSuccessStatus: 200
}));
// Logging Middleware Configuration
// Requirement 19.8: Log all incoming requests with method, path, and timestamp
// Morgan format: :method :url :status :response-time ms - :res[content-length]
if (process.env.NODE_ENV === 'production') {
  // Production: Use combined format (Apache style)
  app.use(morgan('combined'));
} else {
  // Development: Use dev format with colors
  app.use(morgan('dev'));
}

// Custom logging for additional request details
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check with database connectivity test
app.get('/health', async (req, res) => {
  const dbStatus = await checkConnection();
  
  if (dbStatus.connected) {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } else {
    res.status(503).json({
      status: 'Database unavailable',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: dbStatus.error,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/arreglos', arreglosRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/capital', capitalRoutes);

// 404 handler
app.use(notFound);

// CORS error handler - must come before general error handler
app.use((err, req, res, next) => {
  if (err.message === 'Origen no autorizado por política CORS') {
    return res.status(403).json({
      error: true,
      mensaje: 'Origen no autorizado por política CORS'
    });
  }
  next(err);
});

// Error handler
app.use(errorHandler);

// Start server only when run directly (not when required by tests)
if (require.main === module) {
  // Validate env vars only at startup, not when imported by tests
  validateEnv();

  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌸 Florería Encantos Eternos - Backend API 🌸          ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Database: ${process.env.DB_NAME}                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;
