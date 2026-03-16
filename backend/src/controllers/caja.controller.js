const cajaService = require('../services/caja.service');

class CajaController {
  /**
   * GET /api/caja/hoy
   */
  async getToday(req, res, next) {
    try {
      const caja = await cajaService.getToday();
      
      if (!caja) {
        return res.json({
          success: true,
          caja: null,
          mensaje: 'No hay caja abierta para hoy'
        });
      }

      res.json({
        success: true,
        ...caja
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/caja/apertura
   */
  async openCaja(req, res, next) {
    try {
      const { monto_inicial } = req.body;
      const trabajadorId = req.user.id;

      if (monto_inicial === undefined || monto_inicial < 0) {
        return res.status(400).json({
          error: true,
          mensaje: 'Monto inicial inválido'
        });
      }

      const caja = await cajaService.openCaja(trabajadorId, monto_inicial);
      
      res.status(201).json({
        success: true,
        caja,
        mensaje: 'Caja abierta correctamente'
      });
    } catch (error) {
      if (error.message.includes('ya está abierta')) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/caja/cierre
   */
  async closeCaja(req, res, next) {
    try {
      const { monto_cierre } = req.body;
      const trabajadorId = req.user.id;

      if (monto_cierre === undefined || monto_cierre < 0) {
        return res.status(400).json({
          error: true,
          mensaje: 'Monto de cierre inválido'
        });
      }

      const caja = await cajaService.closeCaja(trabajadorId, monto_cierre);
      
      res.json({
        success: true,
        caja,
        mensaje: 'Caja cerrada correctamente'
      });
    } catch (error) {
      if (error.message.includes('No hay caja') || error.message.includes('ya está cerrada')) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * GET /api/caja/historial
   */
  async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 30;
      const history = await cajaService.getHistory(limit);
      
      res.json({
        success: true,
        historial: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CajaController();
