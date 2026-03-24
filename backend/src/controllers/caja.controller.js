const cajaService = require('../services/caja.service');

class CajaController {
  /**
   * GET /api/caja/hoy
   * Requirements: 12.14, 12.15
   */
  async getHoy(req, res, next) {
    try {
      const caja = await cajaService.getHoy();
      res.json({ success: true, data: caja });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/caja/apertura
   * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async apertura(req, res, next) {
    try {
      const { monto_apertura } = req.body;
      const trabajadorId = req.user.id;

      const caja = await cajaService.apertura(trabajadorId, monto_apertura);
      res.status(201).json({ success: true, data: caja, mensaje: 'Caja abierta correctamente' });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/caja/cierre
   * Requirements: 12.6-12.13
   */
  async cierre(req, res, next) {
    try {
      const trabajadorId = req.user.id;
      const { monto_cierre } = req.body;

      // Validar monto_cierre si se proporciona
      if (monto_cierre !== undefined && monto_cierre !== null) {
        const montoNum = parseFloat(monto_cierre);
        if (isNaN(montoNum) || montoNum < 0) {
          return res.status(400).json({ 
            error: true, 
            mensaje: 'El monto de cierre debe ser un número mayor o igual a 0' 
          });
        }
      }

      const caja = await cajaService.cierre(trabajadorId, monto_cierre);
      res.json({ success: true, data: caja, mensaje: caja.mensaje || 'Caja cerrada correctamente' });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/caja/historial
   */
  async getHistorial(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await cajaService.getHistorial(page, limit);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  // Backward-compatible aliases
  async getToday(req, res, next) { return this.getHoy(req, res, next); }
  async openCaja(req, res, next) { return this.apertura(req, res, next); }
  async closeCaja(req, res, next) { return this.cierre(req, res, next); }
  async getHistory(req, res, next) { return this.getHistorial(req, res, next); }
}

module.exports = new CajaController();
