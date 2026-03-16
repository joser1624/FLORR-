const trabajadoresService = require('../services/trabajadores.service');

class TrabajadoresController {
  /**
   * GET /api/trabajadores
   */
  async getAll(req, res, next) {
    try {
      const trabajadores = await trabajadoresService.getAll(req.query);
      
      res.json({
        success: true,
        trabajadores
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/trabajadores/:id
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
        trabajador
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/trabajadores
   */
  async create(req, res, next) {
    try {
      const trabajador = await trabajadoresService.create(req.body);
      
      res.status(201).json({
        success: true,
        trabajador,
        mensaje: 'Trabajador creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/trabajadores/:id
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
        trabajador,
        mensaje: 'Trabajador actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/trabajadores/:id
   */
  async delete(req, res, next) {
    try {
      await trabajadoresService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Trabajador eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrabajadoresController();
