const eventosService = require('../services/eventos.service');

class EventosController {
  async getAll(req, res, next) {
    try {
      const eventos = await eventosService.getAll(req.query);
      res.json({ success: true, data: eventos });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const evento = await eventosService.getById(req.params.id);
      if (!evento) {
        return res.status(404).json({ error: true, mensaje: 'Evento no encontrado' });
      }
      res.json({ success: true, data: evento });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const evento = await eventosService.create(req.body);
      res.status(201).json({ success: true, data: evento, mensaje: 'Evento creado correctamente' });
    } catch (error) {
      if (error.message && (error.message.includes('no puede estar vacío') || error.message.includes('debe ser uno de'))) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const evento = await eventosService.update(req.params.id, req.body);
      if (!evento) {
        return res.status(404).json({ error: true, mensaje: 'Evento no encontrado' });
      }
      res.json({ success: true, data: evento, mensaje: 'Evento actualizado correctamente' });
    } catch (error) {
      if (error.message && (error.message.includes('no puede estar vacío') || error.message.includes('debe ser uno de'))) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const existing = await eventosService.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: true, mensaje: 'Evento no encontrado' });
      }
      await eventosService.delete(req.params.id);
      res.json({ success: true, mensaje: 'Evento eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventosController();
