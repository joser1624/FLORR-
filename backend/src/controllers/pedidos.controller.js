const pedidosService = require('../services/pedidos.service');

class PedidosController {
  /**
   * GET /api/pedidos
   */
  async getAll(req, res, next) {
    try {
      const pedidos = await pedidosService.getAll(req.query);
      
      res.json({
        success: true,
        pedidos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pedidos/:id
   */
  async getById(req, res, next) {
    try {
      const pedido = await pedidosService.getById(req.params.id);
      
      if (!pedido) {
        return res.status(404).json({
          error: true,
          mensaje: 'Pedido no encontrado'
        });
      }

      res.json({
        success: true,
        pedido
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pedidos
   */
  async create(req, res, next) {
    try {
      const pedido = await pedidosService.create(req.body);
      
      res.status(201).json({
        success: true,
        pedido,
        mensaje: 'Pedido creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/pedidos/:id
   */
  async update(req, res, next) {
    try {
      const pedido = await pedidosService.update(req.params.id, req.body);
      
      if (!pedido) {
        return res.status(404).json({
          error: true,
          mensaje: 'Pedido no encontrado'
        });
      }

      res.json({
        success: true,
        pedido,
        mensaje: 'Pedido actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/pedidos/:id
   */
  async delete(req, res, next) {
    try {
      await pedidosService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Pedido eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PedidosController();
