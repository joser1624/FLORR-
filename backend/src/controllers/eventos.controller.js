const eventosService = require('../services/eventos.service');

class EventosController {
  /**
   * GET /api/eventos
   */
  async getAll(req, res, next) {
    try {
      const eventos = await eventosService.getAll(req.query);
      
      res.json({
        success: true,
        eventos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/eventos/:id
   */
  async getById(req, res, next) {
    try {
      const evento = await eventosService.getById(req.params.id);
      
      if (!evento) {
        return res.status(404).json({
          error: true,
          mensaje: 'Evento no encontrado'
        });
      }

      res.json({
        success: true,
        evento
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/eventos
   */
  async create(req, res, next) {
    try {
      const evento = await eventosService.create(req.body);
      
      res.status(201).json({
        success: true,
        evento,
        mensaje: 'Evento creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/eventos/:id
   */
  async update(req, res, next) {
    try {
      const evento = await eventosService.update(req.params.id, req.body);
      
      if (!evento) {
        return res.status(404).json({
          error: true,
          mensaje: 'Evento no encontrado'
        });
      }

      res.json({
        success: true,
        evento,
        mensaje: 'Evento actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/eventos/:id
   */
  async delete(req, res, next) {
    try {
      await eventosService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Evento eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventosController();
