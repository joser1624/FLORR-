const ventasService = require('../services/ventas.service');

/**
 * Sales Controller
 * Task 7.3: Implements sales controller with proper error handling
 * Requirements: 20.1, 20.2, 20.6, 20.7, 20.8
 */
class VentasController {
  /**
   * GET /api/ventas
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        fecha: req.query.fecha,
        metodo_pago: req.query.metodo_pago,
        trabajador_id: req.query.trabajador_id
      };

      const ventas = await ventasService.getAll(filters);
      
      res.json({
        success: true,
        ventas: ventas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ventas/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getById(req, res, next) {
    try {
      const venta = await ventasService.getById(req.params.id);
      
      if (!venta) {
        return res.status(404).json({
          error: true,
          mensaje: 'Venta no encontrada'
        });
      }

      res.json({
        success: true,
        venta: venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ventas
   * Task 7.3: Create sale with proper validation and error handling
   * Requirement 20.6: Return 201 for successful creation
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 2.5: Empleado and admin roles can create sales
   */
  async create(req, res, next) {
    try {
      // Get trabajador_id from authenticated user
      const trabajadorId = req.user.id;
      
      const venta = await ventasService.create(req.body, trabajadorId);
      
      // Fetch the full venta with productos details
      const fullVenta = await ventasService.getById(venta.id);
      
      res.status(201).json({
        success: true,
        venta: fullVenta,
        mensaje: 'Venta creada correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message) {
        // Stock insufficient error (Requirement 6.6)
        if (error.message.includes('Stock insuficiente')) {
          return res.status(400).json({
            error: true,
            mensaje: error.message
          });
        }
        
        // Validation errors (empty array, invalid payment method, etc.)
        if (error.message.includes('no puede estar vacío') || 
            error.message.includes('inválido') ||
            error.message.includes('debe tener') ||
            error.message.includes('debe ser') ||
            error.message.includes('no encontrado')) {
          return res.status(400).json({
            error: true,
            mensaje: error.message
          });
        }
      }
      
      next(error);
    }
  }

  /**
   * PUT /api/ventas/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful update
   * Requirement 20.8: Return 404 for resource not found
   */
  async update(req, res, next) {
    try {
      const venta = await ventasService.update(req.params.id, req.body);
      
      if (!venta) {
        return res.status(404).json({
          error: true,
          mensaje: 'Venta no encontrada'
        });
      }

      res.json({
        success: true,
        venta: venta,
        mensaje: 'Venta actualizada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ventas/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful deletion
   */
  async delete(req, res, next) {
    try {
      await ventasService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Venta eliminada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VentasController();
