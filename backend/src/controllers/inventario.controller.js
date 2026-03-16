const inventarioService = require('../services/inventario.service');

class InventarioController {
  /**
   * GET /api/inventario
   */
  async getAll(req, res, next) {
    try {
      const items = await inventarioService.getAll(req.query);
      
      res.json({
        success: true,
        items
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/inventario/:id
   */
  async getById(req, res, next) {
    try {
      const item = await inventarioService.getById(req.params.id);
      
      if (!item) {
        return res.status(404).json({
          error: true,
          mensaje: 'Item no encontrado'
        });
      }

      res.json({
        success: true,
        item
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/inventario
   */
  async create(req, res, next) {
    try {
      const item = await inventarioService.create(req.body);
      
      res.status(201).json({
        success: true,
        item,
        mensaje: 'Item creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/inventario/:id
   */
  async update(req, res, next) {
    try {
      const item = await inventarioService.update(req.params.id, req.body);
      
      if (!item) {
        return res.status(404).json({
          error: true,
          mensaje: 'Item no encontrado'
        });
      }

      res.json({
        success: true,
        item,
        mensaje: 'Item actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/inventario/:id
   */
  async delete(req, res, next) {
    try {
      await inventarioService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Item eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventarioController();
