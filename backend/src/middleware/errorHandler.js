/**
 * Global error handler middleware
 * Implements Requirements 19.1-19.7
 */
const errorHandler = (err, req, res, next) => {
  // Determine status code and message
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Error interno del servidor';
  let detalles = err.detalles || undefined;

  // PostgreSQL errors - handle first to determine correct status
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        status = 409;
        message = 'El registro ya existe';
        break;
      case '23503': // Foreign key violation
        status = 400;
        message = 'Referencia inválida';
        break;
      case '23502': // Not null violation
        status = 400;
        message = 'Faltan campos requeridos';
        break;
      case '22P02': // Invalid text representation
        status = 400;
        message = 'Formato de datos inválido';
        break;
      default:
        status = 500;
        message = 'Error interno del servidor';
        // Log database error details but don't expose to client
        console.error('Database error code:', err.code);
        console.error('Database error detail:', err.detail);
    }
  }

  // Requirement 19.2: Validation errors (400) include details
  if (err.name === 'ValidationError') {
    status = 400;
    // Keep validation error message and details
  }

  // Requirement 19.6: Log full stack trace for 500 errors
  if (status === 500) {
    console.error('=== 500 ERROR - FULL STACK TRACE ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('====================================');
  } else {
    console.error('Error:', err.message || err);
  }

  // Handle specific HTTP status codes with standardized messages
  // Requirement 19.3: 401 error returns "No autorizado"
  if (status === 401) {
    message = 'No autorizado';
  }
  // Requirement 19.4: 403 error returns "Acceso denegado"
  else if (status === 403) {
    message = 'Acceso denegado';
  }
  // Requirement 19.5: 404 error returns "Recurso no encontrado"
  else if (status === 404) {
    message = 'Recurso no encontrado';
  }
  // Requirement 19.7: 500 errors return generic message without internal details
  else if (status === 500) {
    message = 'Error interno del servidor';
  }

  // Requirement 19.1: Standardized error response with error, mensaje, and optional detalles
  const response = {
    error: true,
    mensaje: message,
  };

  // Include detalles field for validation errors (400)
  if (detalles) {
    response.detalles = detalles;
  }

  // Only include stack trace in development mode (never in production)
  if (process.env.NODE_ENV === 'development' && status !== 500) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

/**
 * 404 Not Found handler
 * Implements Requirement 19.5
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: true,
    mensaje: 'Recurso no encontrado',
  });
};

module.exports = {
  errorHandler,
  notFound,
};
