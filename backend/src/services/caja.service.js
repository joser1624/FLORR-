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
  async cierre(trabajadorId, montoCierre = null) {
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
    const montoApertura = parseFloat(cajaActual.monto_apertura);

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

    // Calculate total expenses for today (solo efectivo para el cuadre)
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) AS total_gastos FROM gastos WHERE fecha = CURRENT_DATE',
      []
    );

    const totalEfectivo = parseFloat(totals.total_efectivo);
    const totalDigital = parseFloat(totals.total_digital);
    const totalTarjeta = parseFloat(totals.total_tarjeta);
    const totalVentas = parseFloat(totals.total_ventas);
    const totalGastos = parseFloat(gastosResult.rows[0].total_gastos);

    // Calcular efectivo esperado (monto apertura + ventas efectivo - gastos)
    const efectivoEsperado = montoApertura + totalEfectivo - totalGastos;

    // Calcular diferencia y estado de cuadre
    let diferencia = 0;
    let estadoCuadre = 'sin_cuadre';
    let mensaje = 'Caja cerrada sin cuadre de efectivo';

    if (montoCierre !== null && montoCierre !== undefined) {
      const montoCierreNum = parseFloat(montoCierre);
      diferencia = montoCierreNum - efectivoEsperado;
      
      if (diferencia === 0) {
        estadoCuadre = 'cuadrado';
        mensaje = 'Caja cuadrada correctamente';
      } else if (diferencia < 0) {
        estadoCuadre = 'faltante';
        mensaje = `Faltante de S/ ${Math.abs(diferencia).toFixed(2)}`;
      } else {
        estadoCuadre = 'sobrante';
        mensaje = `Sobrante de S/ ${diferencia.toFixed(2)}`;
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
           monto_cierre = $7,
           estado = 'cerrada',
           updated_at = NOW()
       WHERE fecha = CURRENT_DATE AND estado = 'abierta'
       RETURNING *`,
      [totalEfectivo, totalDigital, totalTarjeta, totalVentas, totalGastos, trabajadorId, montoCierre]
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
      total_gastos: parseFloat(caja.total_gastos),
      efectivo_esperado: efectivoEsperado,
      diferencia: diferencia,
      estado_cuadre: estadoCuadre,
      mensaje: mensaje
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
    
    // Obtener lista de gastos del día
    const gastosListaResult = await query(
      `SELECT id, descripcion, categoria, monto, fecha, created_at
       FROM gastos
       WHERE fecha = CURRENT_DATE
       ORDER BY created_at DESC`,
      []
    );

    return {
      ...caja,
      monto_apertura: parseFloat(caja.monto_apertura),
      monto_cierre: caja.monto_cierre !== null ? parseFloat(caja.monto_cierre) : null,
      total_efectivo: caja.total_efectivo !== null ? parseFloat(caja.total_efectivo) : null,
      total_digital: caja.total_digital !== null ? parseFloat(caja.total_digital) : null,
      total_tarjeta: caja.total_tarjeta !== null ? parseFloat(caja.total_tarjeta) : null,
      total_ventas: caja.total_ventas !== null ? parseFloat(caja.total_ventas) : null,
      total_gastos: caja.total_gastos !== null ? parseFloat(caja.total_gastos) : null,
      ventas: ventasResult.rows.map(v => ({
        id: v.id,
        fecha: v.fecha,
        total: parseFloat(v.total),
        metodo: v.metodo_pago,
        metodo_pago: v.metodo_pago,
        trabajador_id: v.trabajador_id,
        productos: v.productos || []
      })),
      gastos: gastosListaResult.rows.map(g => ({
        id: g.id,
        descripcion: g.descripcion,
        categoria: g.categoria,
        monto: parseFloat(g.monto),
        fecha: g.fecha,
        created_at: g.created_at
      })),
      gastos_total: parseFloat(gastosResult.rows[0].total)
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

  /**
   * Generate cash register intermediate cut (quiebre de caja)
   * Returns current totals without closing the box
   */
  async generarQuiebre(trabajadorId, montoFisico = null, observaciones = null) {
    // Verificar que hay caja abierta
    const cajaResult = await query(
      "SELECT * FROM caja WHERE fecha = CURRENT_DATE AND estado = 'abierta'",
      []
    );

    if (cajaResult.rows.length === 0) {
      const error = new Error('No hay caja abierta para generar quiebre');
      error.statusCode = 404;
      throw error;
    }

    const cajaActual = cajaResult.rows[0];
    const montoApertura = parseFloat(cajaActual.monto_apertura);

    // Calcular totales actuales por método de pago
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

    // Calcular gastos del día
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) AS total_gastos FROM gastos WHERE fecha = CURRENT_DATE',
      []
    );

    const totalEfectivo = parseFloat(totals.total_efectivo);
    const totalDigital = parseFloat(totals.total_digital);
    const totalTarjeta = parseFloat(totals.total_tarjeta);
    const totalVentas = parseFloat(totals.total_ventas);
    const totalGastos = parseFloat(gastosResult.rows[0].total_gastos);

    // Calcular efectivo esperado (monto apertura + ventas efectivo - gastos)
    const efectivoEsperado = montoApertura + totalEfectivo - totalGastos;

    // Calcular diferencia
    let diferencia = 0;
    if (montoFisico !== null && montoFisico !== undefined) {
      diferencia = parseFloat(montoFisico) - efectivoEsperado;
    }

    // Guardar quiebre en la base de datos
    const quiebreResult = await query(
      `INSERT INTO caja_quiebre 
        (caja_id, trabajador_id, monto_esperado, monto_fisico, diferencia, 
         total_efectivo_hasta_ahora, total_ventas_hasta_ahora, total_gastos_hasta_ahora, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [cajaActual.id, trabajadorId, efectivoEsperado, montoFisico, diferencia,
       totalEfectivo, totalVentas, totalGastos, observaciones]
    );

    return {
      quiebre: {
        ...quiebreResult.rows[0],
        monto_esperado: parseFloat(quiebreResult.rows[0].monto_esperado),
        monto_fisico: quiebreResult.rows[0].monto_fisico !== null ? parseFloat(quiebreResult.rows[0].monto_fisico) : null,
        diferencia: parseFloat(quiebreResult.rows[0].diferencia),
        total_efectivo_hasta_ahora: parseFloat(quiebreResult.rows[0].total_efectivo_hasta_ahora),
        total_ventas_hasta_ahora: parseFloat(quiebreResult.rows[0].total_ventas_hasta_ahora),
        total_gastos_hasta_ahora: parseFloat(quiebreResult.rows[0].total_gastos_hasta_ahora),
      },
      resumen: {
        monto_apertura: montoApertura,
        total_efectivo: totalEfectivo,
        total_digital: totalDigital,
        total_tarjeta: totalTarjeta,
        total_ventas: totalVentas,
        total_gastos: totalGastos,
        efectivo_esperado: efectivoEsperado,
        monto_fisico: montoFisico !== null ? parseFloat(montoFisico) : null,
        diferencia: diferencia,
        mensaje: montoFisico !== null 
          ? (diferencia === 0 ? '✅ Cuadrado' : (diferencia < 0 ? `⚠️ Faltante: S/ ${Math.abs(diferencia).toFixed(2)}` : `⚠️ Sobrante: S/ ${diferencia.toFixed(2)}`))
          : '📊 Sin conteo físico'
      }
    };
  }

  /**
   * Get quiebres history for today
   */
  async getQuiebresHoy() {
    const result = await query(
      `SELECT q.*, u.nombre AS trabajador_nombre
       FROM caja_quiebre q
       LEFT JOIN usuarios u ON q.trabajador_id = u.id
       WHERE DATE(q.created_at) = CURRENT_DATE
       ORDER BY q.created_at DESC`,
      []
    );

    return result.rows.map(q => ({
      ...q,
      monto_esperado: parseFloat(q.monto_esperado),
      monto_fisico: q.monto_fisico !== null ? parseFloat(q.monto_fisico) : null,
      diferencia: parseFloat(q.diferencia),
      total_efectivo_hasta_ahora: parseFloat(q.total_efectivo_hasta_ahora),
      total_ventas_hasta_ahora: parseFloat(q.total_ventas_hasta_ahora),
      total_gastos_hasta_ahora: parseFloat(q.total_gastos_hasta_ahora),
    }));
  }
}

module.exports = new CajaService();
