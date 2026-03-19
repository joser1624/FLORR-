const dashboardService = require('../services/dashboard.service');

class DashboardController {
  /**
   * GET /api/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /api/dashboard/ventas-periodo?dias=N
   */
  async getVentasPeriodo(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || 7;
      const ventas = await dashboardService.getVentasPeriodo(dias);
      res.json({ success: true, data: ventas });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
