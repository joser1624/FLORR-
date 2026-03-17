const reportesService = require('../services/reportes.service');

class ReportesController {
  /**
   * GET /api/reportes?mes=YYYY-MM
   * Requirements: 2.6, 20.1, 20.2
   */
  async getMonthlyReport(req, res, next) {
    try {
      const { mes } = req.query;

      const reporte = await reportesService.getMonthlyReport(mes);

      res.json({
        success: true,
        data: { reporte },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportesController();
