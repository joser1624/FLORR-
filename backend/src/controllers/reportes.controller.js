const reportesService = require('../services/reportes.service');

class ReportesController {
  /**
   * GET /api/reportes?mes=YYYY-MM
   */
  async getMonthlyReport(req, res, next) {
    try {
      const { mes } = req.query;

      if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
        return res.status(400).json({
          error: true,
          mensaje: 'Formato de mes inválido. Use YYYY-MM'
        });
      }

      const report = await reportesService.getMonthlyReport(mes);
      
      res.json({
        success: true,
        mes,
        ...report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportesController();
