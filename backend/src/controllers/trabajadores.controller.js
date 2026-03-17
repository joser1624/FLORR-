const trabajadoresService = require('../services/trabajadores.service');

/**
 * Trabajadores Controller
 * Implements Requirements 9.10, 2.4, 20.1, 20.2
 * All endpoints are admin-only (enforced at route level)
 */
class TrabajadoresController {
  /**
   * GET /api/trabajadores
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getAll(req, res, next) {
    try {
      const trabajadores = await trabajadoresService.getAll(req.query);

      res.json({
        success: true,
        data: trabajadores
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/trabajadores/:id
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getById(req, res, next) {
    try {
      const trabajador = await trabajadoresService.getById(req.params.id);

      if (!trabajador) {
        return res.status(404).json({
          error: true,
          mensaje: 'Trabajador no encontrado'
        });
      }

      res.json({
        success: true,
        data: trabajador
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/trabajadores
   * Requirement 20.6: Return 201 for successful creation
   * Requirement 20.1, 20.2, 20.3: Return standardized success response with data and mensaje
   */
  async create(req, res, next) {
    try {
      const trabajador = await trabajadoresService.create(req.body);

      res.status(201).json({
        success: true,
        data: trabajador,
        mensaje: 'Trabajador creado correctamente'
      });
    } catch (error) {
      if (error.message && (
        error.message.includes('es requerido') ||
        error.message.includes('ya está registrado') ||
        error.message.includes('debe tener al menos') ||
        error.message.includes('debe ser uno de')
      )) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/trabajadores/:id
   * Requirement 20.1, 20.2, 20.3: Return standardized success response with data and mensaje
   * Requirement 20.7: Return 200 for successful update
   * Requirement 20.8: Return 404 for resource not found
   */
  async update(req, res, next) {
    try {
      const trabajador = await trabajadoresService.update(req.params.id, req.body);

      if (!trabajador) {
        return res.status(404).json({
          error: true,
          mensaje: 'Trabajador no encontrado'
        });
      }

      res.json({
        success: true,
        data: trabajador,
        mensaje: 'Trabajador actualizado correctamente'
      });
    } catch (error) {
      if (error.message === 'Trabajador no encontrado') {
        return res.status(404).json({
          error: true,
          mensaje: error.message
        });
      }
      if (error.message && (
        error.message.includes('ya está registrado') ||
        error.message.includes('debe tener al menos')
      )) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/trabajadores/:id
   * Requirement 20.1, 20.3: Return standardized success response with mensaje
   * Requirement 20.7: Return 200 for successful deletion
   */
  async delete(req, res, next) {
    try {
      await trabajadoresService.delete(req.params.id);

      res.json({
        success: true,
        mensaje: 'Trabajador eliminado correctamente'
      });
    } catch (error) {
      if (error.message === 'Trabajador no encontrado') {
        return res.status(404).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new TrabajadoresController();
