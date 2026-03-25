const solicitudesGastosService = require('../services/solicitudes-gastos.service');

class SolicitudesGastosController {
  /**
   * POST /api/solicitudes-gastos
   * Crear nueva solicitud de gasto (empleado)
   */
  async crear(req, res, next) {
    try {
      const trabajadorId = req.user.id;
      const solicitud = await solicitudesGastosService.crear(trabajadorId, req.body);
      
      res.status(201).json({
        success: true,
        data: solicitud,
        mensaje: 'Solicitud de gasto creada correctamente. Pendiente de aprobación.'
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/solicitudes-gastos
   * Listar solicitudes (empleado ve las suyas, admin ve todas)
   */
  async listar(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const usuarioRol = req.user.rol;
      const filtros = {
        estado: req.query.estado,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const solicitudes = await solicitudesGastosService.listar(usuarioId, usuarioRol, filtros);
      
      res.json({
        success: true,
        data: solicitudes,
        total: solicitudes.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/solicitudes-gastos/:id
   * Obtener solicitud por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const usuarioId = req.user.id;
      const usuarioRol = req.user.rol;

      const solicitud = await solicitudesGastosService.obtenerPorId(id, usuarioId, usuarioRol);
      
      res.json({
        success: true,
        data: solicitud
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      if (error.statusCode === 403) {
        return res.status(403).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * PUT /api/solicitudes-gastos/:id/aprobar
   * Aprobar solicitud (solo admin/dueña)
   */
  async aprobar(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const adminId = req.user.id;

      const solicitud = await solicitudesGastosService.aprobar(id, adminId);
      
      res.json({
        success: true,
        data: solicitud,
        mensaje: 'Solicitud aprobada correctamente. Gasto registrado.'
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * PUT /api/solicitudes-gastos/:id/rechazar
   * Rechazar solicitud (solo admin/dueña)
   */
  async rechazar(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const adminId = req.user.id;
      const { comentario } = req.body;

      if (!comentario || comentario.trim() === '') {
        return res.status(400).json({
          error: true,
          mensaje: 'Debes proporcionar un comentario para rechazar la solicitud'
        });
      }

      const solicitud = await solicitudesGastosService.rechazar(id, adminId, comentario);
      
      res.json({
        success: true,
        data: solicitud,
        mensaje: 'Solicitud rechazada correctamente.'
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/solicitudes-gastos/pendientes/count
   * Contar solicitudes pendientes (para dashboard)
   */
  async contarPendientes(req, res, next) {
    try {
      const count = await solicitudesGastosService.contarPendientes();
      
      res.json({
        success: true,
        count: count
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SolicitudesGastosController();
