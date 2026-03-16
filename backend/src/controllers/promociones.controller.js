const promocionesService = require('../services/promociones.service');

class PromocionesController {
  /**
   * GET /api/promociones
   */
  async getAll(req, res, next) {
    try {
      const promociones = await promocionesService.getAll(req.query);
      
      res.json({
        success: true,
        promociones
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/promociones/:id
   */
  async getById(req, res, next) {
    try {
      const promocion = await promocionesService.getById(req.params.id);
      
      if (!promocion) {
        return res.status(404).json({
          error: true,
          mensaje: 'Promocion no encontrado'
        });
      }

      res.json({
        success: true,
        promocion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/promociones
   */
  async create(req, res, next) {
    try {
      const promocion = await promocionesService.create(req.body);
      
      res.status(201).json({
        success: true,
        promocion,
        mensaje: 'Promocion creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/promociones/:id
   */
  async update(req, res, next) {
    try {
      const promocion = await promocionesService.update(req.params.id, req.body);
      
      if (!promocion) {
        return res.status(404).json({
          error: true,
          mensaje: 'Promocion no encontrado'
        });
      }

      res.json({
        success: true,
        promocion,
        mensaje: 'Promocion actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/promociones/:id
   */
  async delete(req, res, next) {
    try {
      await promocionesService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Promocion eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromocionesController();
