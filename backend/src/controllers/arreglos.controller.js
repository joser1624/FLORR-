const arreglosService = require('../services/arreglos.service');

class ArreglosController {
  /**
   * GET /api/arreglos
   * Requirements: 20.1, 20.2
   */
  async getAll(req, res, next) {
    try {
      const arreglos = await arreglosService.getAll();

      res.json({
        success: true,
        data: arreglos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/arreglos/:id
   * Requirements: 20.1, 20.2, 20.8
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
        data: arreglo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/arreglos
   * Requirements: 20.1, 20.2, 20.6
   */
  async create(req, res, next) {
    try {
      const arreglo = await arreglosService.create(req.body);

      res.status(201).json({
        success: true,
        data: arreglo,
        mensaje: 'Arreglo creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/arreglos/:id
   * Requirements: 20.1, 20.2, 20.7
   */
  async update(req, res, next) {
    try {
      const arreglo = await arreglosService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: arreglo,
        mensaje: 'Arreglo actualizado correctamente'
      });
    } catch (error) {
      if (error.message === 'Arreglo no encontrado') {
        return res.status(404).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/arreglos/:id
   * Requirements: 20.1, 20.2, 20.7
   */
  async delete(req, res, next) {
    try {
      await arreglosService.delete(req.params.id);

      res.json({
        success: true,
        mensaje: 'Arreglo eliminado correctamente'
      });
    } catch (error) {
      if (error.message === 'Arreglo no encontrado') {
        return res.status(404).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new ArreglosController();
