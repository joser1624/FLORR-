const pedidosService = require('../services/pedidos.service');

/**
 * Orders Controller
 * Task 9.2: Implements orders controller with proper error handling
 * Requirements: 2.5, 20.1, 20.2, 20.6, 20.7
 */
class PedidosController {
  /**
   * GET /api/pedidos
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getAll(req, res, next) {
    try {
      const pedidos = await pedidosService.getAll(req.query);
      
      res.json({
        success: true,
        pedidos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pedidos/cliente
   * Filter orders by cliente_telefono query parameter
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getByCliente(req, res, next) {
    try {
      const { telefono } = req.query;
      
      if (!telefono) {
        return res.status(400).json({
          error: true,
          mensaje: 'El parámetro telefono es requerido'
        });
      }

      const pedidos = await pedidosService.getAll({ cliente_telefono: telefono });
      
      res.json({
        success: true,
        pedidos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pedidos/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getById(req, res, next) {
    try {
      const pedido = await pedidosService.getById(req.params.id);
      
      if (!pedido) {
        return res.status(404).json({
          error: true,
          mensaje: 'Pedido no encontrado'
        });
      }

      res.json({
        success: true,
        pedido
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pedidos
   * Task 9.2: Create order with proper validation and error handling
   * Requirement 20.6: Return 201 for successful creation
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 2.5: Empleado and admin roles can create orders
   */
  async create(req, res, next) {
    try {
      const pedido = await pedidosService.create(req.body);
      
      res.status(201).json({
        success: true,
        pedido,
        mensaje: 'Pedido creado correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message) {
        // Validation errors (empty fields, invalid estado, etc.)
        if (error.message.includes('no puede estar vacío') || 
            error.message.includes('no puede estar vacía') ||
            error.message.includes('inválido') ||
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
   * PUT /api/pedidos/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful update
   * Requirement 20.8: Return 404 for resource not found
   */
  async update(req, res, next) {
    try {
      const pedido = await pedidosService.update(req.params.id, req.body);
      
      if (!pedido) {
        return res.status(404).json({
          error: true,
          mensaje: 'Pedido no encontrado'
        });
      }

      res.json({
        success: true,
        pedido,
        mensaje: 'Pedido actualizado correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message) {
        // Estado validation error
        if (error.message.includes('debe ser uno de')) {
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
   * DELETE /api/pedidos/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful deletion
   */
  async delete(req, res, next) {
    try {
      await pedidosService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Pedido eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PedidosController();
