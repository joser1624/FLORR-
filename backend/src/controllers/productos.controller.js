const productosService = require('../services/productos.service');

class ProductosController {
  /**
   * GET /api/productos
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
        productos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/productos/:id
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
        producto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/productos
   */
  async create(req, res, next) {
    try {
      const { nombre, descripcion, categoria, precio, costo, stock, activo, imagen_url } = req.body;

      if (!nombre || !categoria || precio === undefined || costo === undefined) {
        return res.status(400).json({
          error: true,
          mensaje: 'Faltan campos requeridos: nombre, categoria, precio, costo'
        });
      }

      const producto = await productosService.create(req.body);
      
      res.status(201).json({
        success: true,
        producto,
        mensaje: 'Producto creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/productos/:id
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
        producto,
        mensaje: 'Producto actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/productos/:id
   */
  async delete(req, res, next) {
    try {
      await productosService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Producto eliminado correctamente'
      });
    } catch (error) {
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
