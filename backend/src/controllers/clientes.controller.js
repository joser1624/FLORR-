const clientesService = require('../services/clientes.service');

class ClientesController {
  /**
   * GET /api/clientes
   */
  async getAll(req, res, next) {
    try {
      const clientes = await clientesService.getAll(req.query);
      
      res.json({
        success: true,
        clientes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clientes/:id
   */
  async getById(req, res, next) {
    try {
      const cliente = await clientesService.getById(req.params.id);
      
      if (!cliente) {
        return res.status(404).json({
          error: true,
          mensaje: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        cliente
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clientes
   */
  async create(req, res, next) {
    try {
      const cliente = await clientesService.create(req.body);
      
      res.status(201).json({
        success: true,
        cliente,
        mensaje: 'Cliente creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/clientes/:id
   */
  async update(req, res, next) {
    try {
      const cliente = await clientesService.update(req.params.id, req.body);
      
      if (!cliente) {
        return res.status(404).json({
          error: true,
          mensaje: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        cliente,
        mensaje: 'Cliente actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/clientes/:id
   */
  async delete(req, res, next) {
    try {
      await clientesService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientesController();
