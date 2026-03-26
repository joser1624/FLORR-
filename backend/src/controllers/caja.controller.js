const cajaService = require('../services/caja.service');

class CajaController {
  /**
   * GET /api/caja/hoy
   * Requirements: 12.14, 12.15
   */
  async getHoy(req, res, next) {
    try {
      const caja = await cajaService.getHoy();
      res.json({ success: true, data: caja });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/caja/apertura
   * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async apertura(req, res, next) {
    try {
      const { monto_apertura } = req.body;
      const trabajadorId = req.user.id;

      const caja = await cajaService.apertura(trabajadorId, monto_apertura);
      res.status(201).json({ success: true, data: caja, mensaje: 'Caja abierta correctamente' });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/caja/cierre-fecha
   * Cierra caja de una fecha específica (admin only)
   */
  async cierreFecha(req, res, next) {
    try {
      // Solo admin o dueña pueden cerrar cajas de días anteriores
      if (req.user.rol !== 'admin' && req.user.rol !== 'duena') {
        return res.status(403).json({ 
          error: true, 
          mensaje: 'Solo administradores pueden cerrar cajas de días anteriores' 
        });
      }

      const trabajadorId = req.user.id;
      const { fecha, monto_cierre } = req.body;

      if (!fecha) {
        return res.status(400).json({ 
          error: true, 
          mensaje: 'La fecha es requerida (formato: YYYY-MM-DD)' 
        });
      }

      // Validar monto_cierre si se proporciona
      if (monto_cierre !== undefined && monto_cierre !== null) {
        const montoNum = parseFloat(monto_cierre);
        if (isNaN(montoNum) || montoNum < 0) {
          return res.status(400).json({ 
            error: true, 
            mensaje: 'El monto de cierre debe ser un número mayor o igual a 0' 
          });
        }
      }

      const caja = await cajaService.cierreFecha(trabajadorId, fecha, monto_cierre);
      res.json({ success: true, data: caja, mensaje: caja.mensaje || 'Caja cerrada correctamente' });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 400) {
        return res.status(error.statusCode).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/caja/cierre
   * Requirements: 12.6-12.13
   */
  async cierre(req, res, next) {
    try {
      const trabajadorId = req.user.id;
      const { monto_cierre } = req.body;

      // Validar monto_cierre si se proporciona
      if (monto_cierre !== undefined && monto_cierre !== null) {
        const montoNum = parseFloat(monto_cierre);
        if (isNaN(montoNum) || montoNum < 0) {
          return res.status(400).json({ 
            error: true, 
            mensaje: 'El monto de cierre debe ser un número mayor o igual a 0' 
          });
        }
      }

      const caja = await cajaService.cierre(trabajadorId, monto_cierre);
      res.json({ success: true, data: caja, mensaje: caja.mensaje || 'Caja cerrada correctamente' });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/caja/historial
   */
  async getHistorial(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await cajaService.getHistorial(page, limit);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  // Backward-compatible aliases
  async getToday(req, res, next) { return this.getHoy(req, res, next); }
  async openCaja(req, res, next) { return this.apertura(req, res, next); }
  async closeCaja(req, res, next) { return this.cierre(req, res, next); }
  async getHistory(req, res, next) { return this.getHistorial(req, res, next); }

  /**
   * POST /api/caja/quiebre
   * Genera un quiebre de caja (corte intermedio sin cerrar)
   */
  async generarQuiebre(req, res, next) {
    try {
      const trabajadorId = req.user.id;
      const { monto_fisico, observaciones } = req.body;

      // Validar monto_fisico si se proporciona
      if (monto_fisico !== undefined && monto_fisico !== null) {
        const montoNum = parseFloat(monto_fisico);
        if (isNaN(montoNum) || montoNum < 0) {
          return res.status(400).json({ 
            error: true, 
            mensaje: 'El monto físico debe ser un número mayor o igual a 0' 
          });
        }
      }

      const resultado = await cajaService.generarQuiebre(trabajadorId, monto_fisico, observaciones);
      res.status(201).json({ success: true, data: resultado });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/caja/quiebres
   * Obtiene el historial de quiebres del día
   */
  async getQuiebres(req, res, next) {
    try {
      const quiebres = await cajaService.getQuiebresHoy();
      res.json({ success: true, data: quiebres });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/caja/anular-cierre
   * Anula el cierre de caja del día (solo admin)
   */
  async anularCierre(req, res, next) {
    try {
      const adminId = req.user.id;
      const { motivo } = req.body;

      // Validar que el usuario es admin o dueña
      if (req.user.rol !== 'admin' && req.user.rol !== 'duena') {
        return res.status(403).json({ 
          error: true, 
          mensaje: 'Solo administradores pueden anular cierres de caja' 
        });
      }

      if (!motivo || motivo.trim().length === 0) {
        return res.status(400).json({ 
          error: true, 
          mensaje: 'Debe proporcionar un motivo para anular el cierre' 
        });
      }

      const resultado = await cajaService.anularCierre(adminId, motivo);
      res.json({ 
        success: true, 
        data: resultado.caja, 
        mensaje: resultado.mensaje 
      });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 400) {
        return res.status(error.statusCode).json({ error: true, mensaje: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/caja/anulaciones
   * Obtiene historial de anulaciones (auditoría)
   */
  async getAnulaciones(req, res, next) {
    try {
      // Solo admin puede ver anulaciones
      if (req.user.rol !== 'admin' && req.user.rol !== 'duena') {
        return res.status(403).json({ 
          error: true, 
          mensaje: 'No tiene permisos para ver el historial de anulaciones' 
        });
      }

      const limit = parseInt(req.query.limit) || 50;
      const anulaciones = await cajaService.getAnulaciones(limit);
      res.json({ success: true, data: anulaciones });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CajaController();
