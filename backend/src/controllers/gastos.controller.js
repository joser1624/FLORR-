const gastosService = require('../services/gastos.service');

class GastosController {
  /**
   * GET /api/gastos
   */
  async getAll(req, res, next) {
    try {
      const gastos = await gastosService.getAll(req.query);
      
      res.json({
        success: true,
        gastos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/gastos/:id
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
        gasto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/gastos
   */
  async create(req, res, next) {
    try {
      const gasto = await gastosService.create(req.body);
      
      res.status(201).json({
        success: true,
        gasto,
        mensaje: 'Gasto creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/gastos/:id
   */
  async update(req, res, next) {
    try {
      const gasto = await gastosService.update(req.params.id, req.body);
      
      if (!gasto) {
        return res.status(404).json({
          error: true,
          mensaje: 'Gasto no encontrado'
        });
      }

      res.json({
        success: true,
        gasto,
        mensaje: 'Gasto actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/gastos/:id
   */
  async delete(req, res, next) {
    try {
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
