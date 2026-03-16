const authService = require('../services/auth.service');

class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      // Handle authentication errors with proper status codes
      if (error.statusCode === 401) {
        return res.status(401).json({
          error: true,
          mensaje: error.message,
        });
      }
      if (error.statusCode === 403) {
        return res.status(403).json({
          error: true,
          mensaje: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      
      res.json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    // With JWT, logout is handled client-side by removing the token
    res.json({
      success: true,
      mensaje: 'Sesión cerrada correctamente',
    });
  }
}

module.exports = new AuthController();
