const gastosService = require('../services/gastos.service');

/**
 * Gastos Controller
 * Implements Requirements 2.6, 20.1, 20.2
 * All endpoints require admin or duena role (enforced at route level)
 */
class GastosController {
  /**
   * GET /api/gastos
   * Supports query parameters: mes (YYYY-MM), categoria
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getAll(req, res, next) {
    try {
      const gastos = await gastosService.getAll(req.query);

      res.json({
        success: true,
        data: gastos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/gastos/:id
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getById(req, res, next) {
    try {
      const gasto = await gastosService.getById(req.params.id);

      if (!gasto) {
        return res.status(404).json({
          error: true,
          mensaje: 'Gasto no encontrado'
        });
      }

      res.json({
        success: true,
        data: gasto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/gastos
   * Requirement 20.6: Return 201 for successful creation
   * Requirement 20.1, 20.2, 20.3: Return standardized success response with data and mensaje
   */
  async create(req, res, next) {
    try {
      const gasto = await gastosService.create(req.body);

      res.status(201).json({
        success: true,
        data: gasto,
        mensaje: 'Gasto creado correctamente'
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({
          error: true,
          mensaje: error.message,
          detalles: error.details
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/gastos/:id
   * Requirement 20.1, 20.3: Return standardized success response with mensaje
   * Requirement 20.7: Return 200 for successful deletion
   * Requirement 20.8: Return 404 for resource not found
   */
  async delete(req, res, next) {
    try {
      const gasto = await gastosService.getById(req.params.id);

      if (!gasto) {
        return res.status(404).json({
          error: true,
          mensaje: 'Gasto no encontrado'
        });
      }

      await gastosService.delete(req.params.id);

      res.json({
        success: true,
        mensaje: 'Gasto eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GastosController();
