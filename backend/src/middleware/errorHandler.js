/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Error interno del servidor';

  // PostgreSQL errors
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
        message = 'Error de base de datos';
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }

  res.status(status).json({
    error: true,
    mensaje: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: true,
    mensaje: 'Ruta no encontrada',
  });
};

module.exports = {
  errorHandler,
  notFound,
};
