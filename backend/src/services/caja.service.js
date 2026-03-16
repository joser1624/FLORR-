const { query, getClient } = require('../config/database');

class CajaService {
  /**
   * Get today's cash register
   */
  async getToday() {
    const today = new Date().toISOString().split('T')[0];

    // Get caja record
    const cajaResult = await query(
      'SELECT * FROM caja WHERE fecha = $1',
      [today]
    );

    if (cajaResult.rows.length === 0) {
      return null;
    }

    const caja = cajaResult.rows[0];

    // Get today's sales
    const ventasResult = await query(
      `SELECT v.*, 
              json_agg(json_build_object(
                'nombre', p.nombre,
                'cantidad', vp.cantidad,
                'precio', vp.precio_unitario
              )) as productos
       FROM ventas v
       LEFT JOIN ventas_productos vp ON v.id = vp.venta_id
       LEFT JOIN productos p ON vp.producto_id = p.id
       WHERE DATE(v.fecha) = $1
       GROUP BY v.id
       ORDER BY v.fecha DESC`,
      [today]
    );

    // Get today's expenses
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE fecha = $1',
      [today]
    );

    return {
      ...caja,
      ventas: ventasResult.rows,
      gastos_total: parseFloat(gastosResult.rows[0].total)
    };
  }

  /**
   * Open cash register
   */
  async openCaja(trabajadorId, montoApertura) {
    const today = new Date().toISOString().split('T')[0];

    // Check if caja is already open
    const existing = await query(
      'SELECT * FROM caja WHERE fecha = $1',
      [today]
    );

    if (existing.rows.length > 0) {
      throw new Error('La caja ya está abierta para hoy');
    }

    // Create new caja record
    const result = await query(
      `INSERT INTO caja (fecha, monto_apertura, trabajador_apertura_id, estado) 
       VALUES ($1, $2, $3, 'abierta') 
       RETURNING *`,
      [today, montoApertura, trabajadorId]
    );

    return result.rows[0];
  }

  /**
   * Close cash register
   */
  async closeCaja(trabajadorId, montoCierre) {
    const today = new Date().toISOString().split('T')[0];

    // Get today's caja
    const cajaResult = await query(
      'SELECT * FROM caja WHERE fecha = $1',
      [today]
    );

    if (cajaResult.rows.length === 0) {
      throw new Error('No hay caja abierta para hoy');
    }

    const caja = cajaResult.rows[0];

    if (caja.estado === 'cerrada') {
      throw new Error('La caja ya está cerrada');
    }

    // Calculate totals by payment method
    const totalsResult = await query(
      `SELECT 
         COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END), 0) as efectivo,
         COALESCE(SUM(CASE WHEN metodo_pago IN ('Yape', 'Plin') THEN total ELSE 0 END), 0) as digital,
         COALESCE(SUM(CASE WHEN metodo_pago IN ('Tarjeta', 'Transferencia bancaria') THEN total ELSE 0 END), 0) as tarjeta,
         COALESCE(SUM(total), 0) as total_ventas
       FROM ventas 
       WHERE DATE(fecha) = $1`,
      [today]
    );

    const totals = totalsResult.rows[0];

    // Get total expenses
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE fecha = $1',
      [today]
    );

    // Update caja
    const result = await query(
      `UPDATE caja 
       SET monto_cierre = $1,
           total_efectivo = $2,
           total_digital = $3,
           total_tarjeta = $4,
           total_ventas = $5,
           total_gastos = $6,
           trabajador_cierre_id = $7,
           estado = 'cerrada'
       WHERE fecha = $8
       RETURNING *`,
      [
        montoCierre,
        parseFloat(totals.efectivo),
        parseFloat(totals.digital),
        parseFloat(totals.tarjeta),
        parseFloat(totals.total_ventas),
        parseFloat(gastosResult.rows[0].total),
        trabajadorId,
        today
      ]
    );

    return result.rows[0];
  }

  /**
   * Get cash register history
   */
  async getHistory(limit = 30) {
    const result = await query(
      `SELECT c.*, 
              u1.nombre as trabajador_apertura,
              u2.nombre as trabajador_cierre
       FROM caja c
       LEFT JOIN usuarios u1 ON c.trabajador_apertura_id = u1.id
       LEFT JOIN usuarios u2 ON c.trabajador_cierre_id = u2.id
       ORDER BY c.fecha DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

module.exports = new CajaService();
