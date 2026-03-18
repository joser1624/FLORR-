const capitalService = require('../services/capital.service');

class CapitalController {
  /**
   * GET /api/capital
   * Get current capital with breakdown
   */
  async getCapital(req, res, next) {
    try {
      const capital = await capitalService.getCapitalActual();
      res.json({ success: true, data: capital });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/capital/aportes
   * Register a new aporte (contribution)
   */
  async registrarAporte(req, res, next) {
    try {
      const { monto, descripcion, fecha } = req.body;
      const trabajadorId = req.user.id;

      const aporte = await capitalService.registrarAporte(
        trabajadorId,
        monto,
        descripcion,
        fecha
      );

      res.status(201).json({ success: true, data: aporte });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/capital/retiros
   * Register a new retiro (withdrawal)
   */
  async registrarRetiro(req, res, next) {
    try {
      const { monto, descripcion, fecha } = req.body;
      const trabajadorId = req.user.id;

      const retiro = await capitalService.registrarRetiro(
        trabajadorId,
        monto,
        descripcion,
        fecha
      );

      res.status(201).json({ success: true, data: retiro });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/capital/movimientos
   * Get capital movements history
   */
  async getMovimientos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const tipo = req.query.tipo; // 'aporte' | 'retiro' | null

      const result = await capitalService.getMovimientos(page, limit, tipo);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/capital/inicial
   * Get capital inicial value
   */
  async getCapitalInicial(req, res, next) {
    try {
      const capitalInicial = await capitalService.getCapitalInicial();
      res.json({ success: true, data: { capital_inicial: capitalInicial } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CapitalController();
