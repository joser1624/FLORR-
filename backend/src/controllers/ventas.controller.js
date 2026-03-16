const ventasService = require('../services/ventas.service');

class VentasController {
  /**
   * GET /api/ventas
   */
  async getAll(req, res, next) {
    try {
      const ventas = await ventasService.getAll(req.query);
      
      res.json({
        success: true,
        ventas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ventas/:id
   */
  async getById(req, res, next) {
    try {
      const venta = await ventasService.getById(req.params.id);
      
      if (!venta) {
        return res.status(404).json({
          error: true,
          mensaje: 'Venta no encontrado'
        });
      }

      res.json({
        success: true,
        venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ventas
   */
  async create(req, res, next) {
    try {
      const venta = await ventasService.create(req.body);
      
      res.status(201).json({
        success: true,
        venta,
        mensaje: 'Venta creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/ventas/:id
   */
  async update(req, res, next) {
    try {
      const venta = await ventasService.update(req.params.id, req.body);
      
      if (!venta) {
        return res.status(404).json({
          error: true,
          mensaje: 'Venta no encontrado'
        });
      }

      res.json({
        success: true,
        venta,
        mensaje: 'Venta actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ventas/:id
   */
  async delete(req, res, next) {
    try {
      await ventasService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Venta eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VentasController();
