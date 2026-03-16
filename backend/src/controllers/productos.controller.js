const productosService = require('../services/productos.service');

class ProductosController {
  /**
   * GET /api/productos
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        categoria: req.query.categoria,
        activo: req.query.activo,
        stock_bajo: req.query.stock_bajo === 'true'
      };

      const productos = await productosService.getAll(filters);
      
      res.json({
        success: true,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/productos/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getById(req, res, next) {
    try {
      const producto = await productosService.getById(req.params.id);
      
      if (!producto) {
        return res.status(404).json({
          error: true,
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/productos
   * Requirement 20.6: Return 201 for successful creation
   * Requirement 20.1, 20.2: Return standardized success response
   */
  async create(req, res, next) {
    try {
      const producto = await productosService.create(req.body);
      
      res.status(201).json({
        success: true,
        data: producto,
        mensaje: 'Producto creado correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message && error.message.includes('no puede estar vacío')) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      if (error.message && (error.message.includes('debe ser mayor') || error.message.includes('debe ser una de'))) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/productos/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful update
   * Requirement 20.8: Return 404 for resource not found
   */
  async update(req, res, next) {
    try {
      const producto = await productosService.update(req.params.id, req.body);
      
      if (!producto) {
        return res.status(404).json({
          error: true,
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: producto,
        mensaje: 'Producto actualizado correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message && error.message.includes('no puede estar vacío')) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      if (error.message && (error.message.includes('debe ser mayor') || error.message.includes('debe ser una de'))) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/productos/:id
   * Requirement 20.1, 20.2: Return standardized success response
   * Requirement 20.7: Return 200 for successful deletion
   * Requirement 20.9: Handle service errors appropriately
   */
  async delete(req, res, next) {
    try {
      const producto = await productosService.delete(req.params.id);
      
      if (!producto) {
        return res.status(404).json({
          error: true,
          mensaje: 'Producto no encontrado'
        });
      }
      
      res.json({
        success: true,
        mensaje: 'Producto eliminado correctamente'
      });
    } catch (error) {
      // Handle foreign key constraint violation
      if (error.code === '23503') {
        return res.status(400).json({
          error: true,
          mensaje: 'No se puede eliminar el producto porque tiene ventas asociadas'
        });
      }
      next(error);
    }
  }
}

module.exports = new ProductosController();
