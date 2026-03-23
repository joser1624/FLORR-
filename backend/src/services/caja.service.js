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
   * Close cash register for today with physical count
   * Requirements: 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13
   * New: Arqueo de caja con monto físico contado
   */
  async cierre(trabajadorId, montoCierreF isico = null, observacionesDiferencia = null) {
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

    const cajaActual = cajaResult.rows[0];

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
    const montoApertura = parseFloat(cajaActual.monto_apertura);

    // Calcular saldo esperado
    const saldoEsperado = montoApertura + totalVentas - totalGastos;

    // Calcular diferencia si se proporcionó monto físico
    let diferenciaCierre = 0;
    let montoCierreValidado = null;

    if (montoCierreF isico !== null && montoCierreF isico !== undefined) {
      // Validar que monto_cierre_fisico >= 0
      if (montoCierreF isico < 0) {
        const error = new Error('El monto físico contado debe ser mayor o igual a cero');
        error.statusCode = 400;
        throw error;
      }

      montoCierreValidado = parseFloat(montoCierreF isico);
      diferenciaCierre = montoCierreValidado - saldoEsperado;

      // Si hay diferencia, validar que se proporcionen observaciones
      if (Math.abs(diferenciaCierre) > 0.01) { // Tolerancia de 1 centavo
        if (!observacionesDiferencia || observacionesDiferencia.trim().length < 10) {
          const error = new Error('Debe proporcionar observaciones (mínimo 10 caracteres) cuando hay diferencia en el arqueo');
          error.statusCode = 400;
          throw error;
        }
      }
    }

    // Update caja: set estado to "cerrada" and record trabajador_cierre_id
    const result = await query(
      `UPDATE caja
       SET total_efectivo = $1,
           total_digital = $2,
           total_tarjeta = $3,
           total_ventas = $4,
           total_gastos = $5,
           trabajador_cierre_id = $6,
           monto_cierre_fisico = $7,
           diferencia_cierre = $8,
           observaciones_diferencia = $9,
           estado = 'cerrada',
           updated_at = NOW()
       WHERE fecha = CURRENT_DATE AND estado = 'abierta'
       RETURNING *`,
      [
        totalEfectivo, 
        totalDigital, 
        totalTarjeta, 
        totalVentas, 
        totalGastos, 
        trabajadorId,
        montoCierreValidado,
        diferenciaCierre,
        observacionesDiferencia
      ]
    );

    const caja = result.rows[0];
    
    // Determinar estado del arqueo
    let estadoArqueo = 'cuadrado';
    if (diferenciaCierre > 0.01) estadoArqueo = 'sobrante';
    if (diferenciaCierre < -0.01) estadoArqueo = 'faltante';

    return {
      ...caja,
      monto_apertura: parseFloat(caja.monto_apertura),
      monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
      monto_cierre_fisico: caja.monto_cierre_fisico !== null ? parseFloat(caja.monto_cierre_fisico) : null,
      diferencia_cierre: parseFloat(caja.diferencia_cierre || 0),
      total_efectivo: parseFloat(caja.total_efectivo),
      total_digital: parseFloat(caja.total_digital),
      total_tarjeta: parseFloat(caja.total_tarjeta),
      total_ventas: parseFloat(caja.total_ventas),
      total_gastos: parseFloat(caja.total_gastos),
      saldo_esperado: saldoEsperado,
      estado_arqueo: estadoArqueo
    };
  }

  /**
   * Get today's cash register with arqueo information
   * Requirements: 12.14, 12.15
   * New: Incluye saldo_esperado y estado_arqueo
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
    
    // Obtener ventas del día con sus productos
    const ventasResult = await query(
      `SELECT v.id, v.fecha, v.total, v.metodo_pago, v.trabajador_id,
              json_agg(
                json_build_object(
                  'nombre', p.nombre,
                  'cantidad', vp.cantidad,
                  'precio', vp.precio_unitario
                )
              ) FILTER (WHERE p.id IS NOT NULL) as productos
       FROM ventas v
       LEFT JOIN ventas_productos vp ON v.id = vp.venta_id
       LEFT JOIN productos p ON vp.producto_id = p.id
       WHERE DATE(v.fecha) = CURRENT_DATE
       GROUP BY v.id, v.fecha, v.total, v.metodo_pago, v.trabajador_id
       ORDER BY v.fecha DESC`,
      []
    );
    
    // Obtener total de gastos del día
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE fecha = CURRENT_DATE',
      []
    );

    // Calcular saldo esperado
    const montoApertura = parseFloat(caja.monto_apertura || 0);
    const totalVentas = caja.total_ventas !== null ? parseFloat(caja.total_ventas) : 0;
    const totalGastos = caja.total_gastos !== null ? parseFloat(caja.total_gastos) : 0;
    const saldoEsperado = montoApertura + totalVentas - totalGastos;

    // Determinar estado del arqueo
    const diferenciaCierre = parseFloat(caja.diferencia_cierre || 0);
    let estadoArqueo = 'cuadrado';
    if (diferenciaCierre > 0.01) estadoArqueo = 'sobrante';
    if (diferenciaCierre < -0.01) estadoArqueo = 'faltante';

    return {
      ...caja,
      monto_apertura: montoApertura,
      monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
      monto_cierre_fisico: caja.monto_cierre_fisico !== null ? parseFloat(caja.monto_cierre_fisico) : null,
      diferencia_cierre: diferenciaCierre,
      total_efectivo: caja.total_efectivo !== null ? parseFloat(caja.total_efectivo) : null,
      total_digital: caja.total_digital !== null ? parseFloat(caja.total_digital) : null,
      total_tarjeta: caja.total_tarjeta !== null ? parseFloat(caja.total_tarjeta) : null,
      total_ventas: totalVentas,
      total_gastos: totalGastos,
      saldo_esperado: saldoEsperado,
      estado_arqueo: estadoArqueo,
      ventas: ventasResult.rows.map(v => ({
        id: v.id,
        fecha: v.fecha,
        total: parseFloat(v.total),
        metodo: v.metodo_pago,
        trabajador_id: v.trabajador_id,
        productos: v.productos || []
      })),
      gastos_total: parseFloat(gastosResult.rows[0].total)
    };
  }

  /**
   * Get cash register history with pagination and arqueo status
   * Requirements: 12.16
   * New: Incluye estado_arqueo en cada registro
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

    const rows = result.rows.map(caja => {
      const montoApertura = parseFloat(caja.monto_apertura || 0);
      const totalVentas = caja.total_ventas !== null ? parseFloat(caja.total_ventas) : 0;
      const totalGastos = caja.total_gastos !== null ? parseFloat(caja.total_gastos) : 0;
      const saldoEsperado = montoApertura + totalVentas - totalGastos;
      
      const diferenciaCierre = parseFloat(caja.diferencia_cierre || 0);
      let estadoArqueo = 'cuadrado';
      if (diferenciaCierre > 0.01) estadoArqueo = 'sobrante';
      if (diferenciaCierre < -0.01) estadoArqueo = 'faltante';

      return {
        ...caja,
        monto_apertura: montoApertura,
        monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
        monto_cierre_fisico: caja.monto_cierre_fisico !== null ? parseFloat(caja.monto_cierre_fisico) : null,
        diferencia_cierre: diferenciaCierre,
        total_efectivo: caja.total_efectivo !== null ? parseFloat(caja.total_efectivo) : null,
        total_digital: caja.total_digital !== null ? parseFloat(caja.total_digital) : null,
        total_tarjeta: caja.total_tarjeta !== null ? parseFloat(caja.total_tarjeta) : null,
        total_ventas: totalVentas,
        total_gastos: totalGastos,
        saldo_esperado: saldoEsperado,
        estado_arqueo: estadoArqueo
      };
    });

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

  async closeCaja(trabajadorId, montoCierreF isico = null, observacionesDiferencia = null) {
    return this.cierre(trabajadorId, montoCierreF isico, observacionesDiferencia);
  }

  async getHistory(limit = 50) {
    const result = await this.getHistorial(1, limit);
    return result.data;
  }
}

module.exports = new CajaService();
