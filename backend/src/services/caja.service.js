const { query } = require('../config/database');

class CajaService {
  /**
   * Open cash register for today
   * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async apertura(trabajadorId, montoApertura) {
    // Validate monto_apertura >= 0
    if (montoApertura === undefined || montoApertura === null || montoApertura < 0) {
      const error = new Error('El monto de apertura debe ser mayor o igual a cero');
      error.statusCode = 400;
      throw error;
    }

    // Check if a register is already open for today
    const existing = await query(
      "SELECT id FROM caja WHERE fecha = CURRENT_DATE AND estado = 'abierta'",
      []
    );

    if (existing.rows.length > 0) {
      const error = new Error('Ya existe una caja abierta para hoy');
      error.statusCode = 400;
      throw error;
    }

    // Create new caja record with estado "abierta"
    const result = await query(
      `INSERT INTO caja (fecha, monto_apertura, trabajador_apertura_id, estado)
       VALUES (CURRENT_DATE, $1, $2, 'abierta')
       RETURNING *`,
      [montoApertura, trabajadorId]
    );

    const caja = result.rows[0];
    return {
      ...caja,
      monto_apertura: parseFloat(caja.monto_apertura)
    };
  }

  /**
   * Close cash register for today
   * Requirements: 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13
   */
  async cierre(trabajadorId) {
    // Validate that a register is open for today
    const cajaResult = await query(
      "SELECT * FROM caja WHERE fecha = CURRENT_DATE AND estado = 'abierta'",
      []
    );

    if (cajaResult.rows.length === 0) {
      const error = new Error('No hay caja abierta para hoy');
      error.statusCode = 404;
      throw error;
    }

    // Calculate totals by payment method from today's sales
    const totalsResult = await query(
      `SELECT
         COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
         COALESCE(SUM(CASE WHEN metodo_pago IN ('Yape', 'Plin') THEN total ELSE 0 END), 0) AS total_digital,
         COALESCE(SUM(CASE WHEN metodo_pago IN ('Tarjeta', 'Transferencia bancaria') THEN total ELSE 0 END), 0) AS total_tarjeta,
         COALESCE(SUM(total), 0) AS total_ventas
       FROM ventas
       WHERE DATE(fecha) = CURRENT_DATE`,
      []
    );

    const totals = totalsResult.rows[0];

    // Calculate total expenses for today
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) AS total_gastos FROM gastos WHERE fecha = CURRENT_DATE',
      []
    );

    const totalEfectivo = parseFloat(totals.total_efectivo);
    const totalDigital = parseFloat(totals.total_digital);
    const totalTarjeta = parseFloat(totals.total_tarjeta);
    const totalVentas = parseFloat(totals.total_ventas);
    const totalGastos = parseFloat(gastosResult.rows[0].total_gastos);

    // Update caja: set estado to "cerrada" and record trabajador_cierre_id
    const result = await query(
      `UPDATE caja
       SET total_efectivo = $1,
           total_digital = $2,
           total_tarjeta = $3,
           total_ventas = $4,
           total_gastos = $5,
           trabajador_cierre_id = $6,
           estado = 'cerrada',
           updated_at = NOW()
       WHERE fecha = CURRENT_DATE AND estado = 'abierta'
       RETURNING *`,
      [totalEfectivo, totalDigital, totalTarjeta, totalVentas, totalGastos, trabajadorId]
    );

    const caja = result.rows[0];
    return {
      ...caja,
      monto_apertura: parseFloat(caja.monto_apertura),
      monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
      total_efectivo: parseFloat(caja.total_efectivo),
      total_digital: parseFloat(caja.total_digital),
      total_tarjeta: parseFloat(caja.total_tarjeta),
      total_ventas: parseFloat(caja.total_ventas),
      total_gastos: parseFloat(caja.total_gastos)
    };
  }

  /**
   * Get today's cash register
   * Requirements: 12.14, 12.15
   */
  async getHoy() {
    const result = await query(
      `SELECT c.*,
              u1.nombre AS trabajador_apertura_nombre,
              u2.nombre AS trabajador_cierre_nombre
       FROM caja c
       LEFT JOIN usuarios u1 ON c.trabajador_apertura_id = u1.id
       LEFT JOIN usuarios u2 ON c.trabajador_cierre_id = u2.id
       WHERE c.fecha = CURRENT_DATE`,
      []
    );

    if (result.rows.length === 0) {
      const error = new Error('No hay caja abierta');
      error.statusCode = 404;
      throw error;
    }

    const caja = result.rows[0];
    return {
      ...caja,
      monto_apertura: parseFloat(caja.monto_apertura),
      monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
      total_efectivo: caja.total_efectivo !== null ? parseFloat(caja.total_efectivo) : null,
      total_digital: caja.total_digital !== null ? parseFloat(caja.total_digital) : null,
      total_tarjeta: caja.total_tarjeta !== null ? parseFloat(caja.total_tarjeta) : null,
      total_ventas: caja.total_ventas !== null ? parseFloat(caja.total_ventas) : null,
      total_gastos: caja.total_gastos !== null ? parseFloat(caja.total_gastos) : null
    };
  }

  /**
   * Get cash register history with pagination
   * Requirements: 12.16
   */
  async getHistorial(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) FROM caja', []);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT c.*,
              u1.nombre AS trabajador_apertura_nombre,
              u2.nombre AS trabajador_cierre_nombre
       FROM caja c
       LEFT JOIN usuarios u1 ON c.trabajador_apertura_id = u1.id
       LEFT JOIN usuarios u2 ON c.trabajador_cierre_id = u2.id
       ORDER BY c.fecha DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const rows = result.rows.map(caja => ({
      ...caja,
      monto_apertura: parseFloat(caja.monto_apertura),
      monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
      total_efectivo: caja.total_efectivo !== null ? parseFloat(caja.total_efectivo) : null,
      total_digital: caja.total_digital !== null ? parseFloat(caja.total_digital) : null,
      total_tarjeta: caja.total_tarjeta !== null ? parseFloat(caja.total_tarjeta) : null,
      total_ventas: caja.total_ventas !== null ? parseFloat(caja.total_ventas) : null,
      total_gastos: caja.total_gastos !== null ? parseFloat(caja.total_gastos) : null
    }));

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Backward-compatible aliases used by the controller
  async getToday() {
    try {
      return await this.getHoy();
    } catch (err) {
      if (err.statusCode === 404) return null;
      throw err;
    }
  }

  async openCaja(trabajadorId, montoApertura) {
    return this.apertura(trabajadorId, montoApertura);
  }

  async closeCaja(trabajadorId) {
    return this.cierre(trabajadorId);
  }

  async getHistory(limit = 50) {
    const result = await this.getHistorial(1, limit);
    return result.data;
  }
}

module.exports = new CajaService();
