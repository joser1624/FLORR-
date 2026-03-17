const clientesService = require('../services/clientes.service');

class ClientesController {
  /**
   * GET /api/clientes
   * Requirement 21.6, 21.7: Support pagination with page and limit query parameters
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await clientesService.getAll(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clientes/:id
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getById(req, res, next) {
    try {
      const cliente = await clientesService.getById(req.params.id);
      
      if (!cliente) {
        return res.status(404).json({
          error: true,
          mensaje: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clientes/telefono/:telefono
   * Requirement 8.4: Query by telefono
   * Requirement 20.1, 20.2: Return standardized success response with data field
   * Requirement 20.7: Return 200 for successful retrieval
   * Requirement 20.8: Return 404 for resource not found
   */
  async getByTelefono(req, res, next) {
    try {
      const cliente = await clientesService.getByTelefono(req.params.telefono);
      
      if (!cliente) {
        return res.status(404).json({
          error: true,
          mensaje: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clientes
   * Requirement 20.6: Return 201 for successful creation
   * Requirement 20.1, 20.2, 20.3: Return standardized success response with data and mensaje
   */
  async create(req, res, next) {
    try {
      const cliente = await clientesService.create(req.body);
      
      res.status(201).json({
        success: true,
        data: cliente,
        mensaje: 'Cliente creado correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message && (error.message.includes('no puede estar vacío') || error.message.includes('es requerido'))) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/clientes/:id
   * Requirement 20.1, 20.2, 20.3: Return standardized success response with data and mensaje
   * Requirement 20.7: Return 200 for successful update
   * Requirement 20.8: Return 404 for resource not found
   */
  async update(req, res, next) {
    try {
      const cliente = await clientesService.update(req.params.id, req.body);
      
      if (!cliente) {
        return res.status(404).json({
          error: true,
          mensaje: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente,
        mensaje: 'Cliente actualizado correctamente'
      });
    } catch (error) {
      // Handle validation errors from service
      if (error.message && (error.message.includes('no puede estar vacío') || error.message.includes('es requerido'))) {
        return res.status(400).json({
          error: true,
          mensaje: error.message
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/clientes/:id
   * Requirement 20.1, 20.3: Return standardized success response with mensaje
   * Requirement 20.7: Return 200 for successful deletion
   */
  async delete(req, res, next) {
    try {
      await clientesService.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientesController();
