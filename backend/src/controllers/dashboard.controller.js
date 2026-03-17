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
}

module.exports = new DashboardController();
