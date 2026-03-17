const promocionesService = require('../services/promociones.service');

class PromocionesController {
  async getAll(req, res, next) {
    try {
      const promociones = await promocionesService.getAll(req.query);
      res.json({ success: true, data: promociones });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const promocion = await promocionesService.getById(req.params.id);
      if (!promocion) {
        return res.status(404).json({ error: true, mensaje: 'Promoción no encontrada' });
      }
      res.json({ success: true, data: promocion });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const promocion = await promocionesService.create(req.body);
      res.status(201).json({ success: true, data: promocion, mensaje: 'Promoción creada correctamente' });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message, detalles: error.details });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const promocion = await promocionesService.update(req.params.id, req.body);
      if (!promocion) {
        return res.status(404).json({ error: true, mensaje: 'Promoción no encontrada' });
      }
      res.json({ success: true, data: promocion, mensaje: 'Promoción actualizada correctamente' });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message, detalles: error.details });
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const existing = await promocionesService.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: true, mensaje: 'Promoción no encontrada' });
      }
      await promocionesService.delete(req.params.id);
      res.json({ success: true, mensaje: 'Promoción eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromocionesController();
