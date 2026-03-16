const arreglosService = require('../services/arreglos.service');

class ArreglosController {
  /**
   * GET /api/arreglos
   */
  async getAll(req, res, next) {
    try {
      const arreglos = await arreglosService.getAll(req.query);
      
      res.json({
        success: true,
        arreglos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/arreglos/:id
   */
  async getById(req, res, next) {
    try {
      const arreglo = await arreglosService.getById(req.params.id);
      
      if (!arreglo) {
        return res.status(404).json({
          error: true,
          mensaje: 'Arreglo no encontrado'
        });
      }

      res.json({
        success: true,
        arreglo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/arreglos
   */
  async create(req, res, next) {
    try {
      const arreglo = await arreglosService.create(req.body);
      
      res.status(201).json({
        success: true,
        arreglo,
        mensaje: 'Arreglo creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/arreglos/:id
   */
  async update(req, res, next) {
    try {
      const arreglo = await arreglosService.update(req.params.id, req.body);
      
      if (!arreglo) {
        return res.status(404).json({
          error: true,
          mensaje: 'Arreglo no encontrado'
        });
      }

      res.json({
        success: true,
        arreglo,
        mensaje: 'Arreglo actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/arreglos/:id
   */
  async delete(req, res, next) {
    try {
      await arreglosService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Arreglo eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArreglosController();
