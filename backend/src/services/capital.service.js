const { query } = require('../config/database');

class CapitalService {
  /**
   * Get current capital with breakdown
   */
  async getCapitalActual() {
    // 1. Capital inicial
    const capitalInicialResult = await query(
      "SELECT valor FROM configuracion WHERE clave = 'capital_inicial'",
      []
    );
    const capitalInicial = parseFloat(capitalInicialResult.rows[0]?.valor || 0);

    // 2. Total ingresos (ventas de cajas cerradas)
    const ingresosResult = await query(
      "SELECT COALESCE(SUM(total_ventas), 0) as total FROM caja WHERE estado = 'cerrada'",
      []
    );
    const ingresos = parseFloat(ingresosResult.rows[0].total);

    // 3. Total gastos
    const gastosResult = await query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos',
      []
    );
    const gastos = parseFloat(gastosResult.rows[0].total);

    // 4. Total aportes
    const aportesResult = await query(
      "SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_capital WHERE tipo = 'aporte'",
      []
    );
    const aportes = parseFloat(aportesResult.rows[0].total);

    // 5. Total retiros
    const retirosResult = await query(
      "SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_capital WHERE tipo = 'retiro'",
      []
    );
    const retiros = parseFloat(retirosResult.rows[0].total);

    // Calcular capital actual
    const capitalActual = capitalInicial + ingresos - gastos + aportes - retiros;

    return {
      capital_actual: capitalActual,
      desglose: {
        capital_inicial: capitalInicial,
        ingresos: ingresos,
        gastos: gastos,
        aportes: aportes,
        retiros: retiros
      }
    };
  }

  /**
   * Register a new aporte (contribution)
   */
  async registrarAporte(trabajadorId, monto, descripcion, fecha = null) {
    if (!monto || monto <= 0) {
      const error = new Error('El monto debe ser mayor a cero');
      error.statusCode = 400;
      throw error;
    }

    if (!descripcion || descripcion.trim() === '') {
      const error = new Error('La descripción es requerida');
      error.statusCode = 400;
      throw error;
    }

    const fechaRegistro = fecha || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO movimientos_capital (tipo, monto, descripcion, fecha, trabajador_id)
       VALUES ('aporte', $1, $2, $3, $4)
       RETURNING *`,
      [monto, descripcion.trim(), fechaRegistro, trabajadorId]
    );

    const movimiento = result.rows[0];
    return {
      ...movimiento,
      monto: parseFloat(movimiento.monto)
    };
  }

  /**
   * Register a new retiro (withdrawal)
   */
  async registrarRetiro(trabajadorId, monto, descripcion, fecha = null) {
    if (!monto || monto <= 0) {
      const error = new Error('El monto debe ser mayor a cero');
      error.statusCode = 400;
      throw error;
    }

    if (!descripcion || descripcion.trim() === '') {
      const error = new Error('La descripción es requerida');
      error.statusCode = 400;
      throw error;
    }

    const fechaRegistro = fecha || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO movimientos_capital (tipo, monto, descripcion, fecha, trabajador_id)
       VALUES ('retiro', $1, $2, $3, $4)
       RETURNING *`,
      [monto, descripcion.trim(), fechaRegistro, trabajadorId]
    );

    const movimiento = result.rows[0];
    return {
      ...movimiento,
      monto: parseFloat(movimiento.monto)
    };
  }

  /**
   * Get capital movements history with pagination
   */
  async getMovimientos(page = 1, limit = 50, tipo = null) {
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [limit, offset];
    
    if (tipo && ['aporte', 'retiro'].includes(tipo)) {
      whereClause = 'WHERE mc.tipo = $3';
      params.push(tipo);
    }

    const countQuery = tipo 
      ? 'SELECT COUNT(*) FROM movimientos_capital WHERE tipo = $1'
      : 'SELECT COUNT(*) FROM movimientos_capital';
    
    const countParams = tipo ? [tipo] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT mc.*, u.nombre as trabajador_nombre
       FROM movimientos_capital mc
       LEFT JOIN usuarios u ON mc.trabajador_id = u.id
       ${whereClause}
       ORDER BY mc.fecha DESC, mc.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const rows = result.rows.map(mov => ({
      ...mov,
      monto: parseFloat(mov.monto)
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

  /**
   * Get capital inicial value
   */
  async getCapitalInicial() {
    const result = await query(
      "SELECT valor FROM configuracion WHERE clave = 'capital_inicial'",
      []
    );

    if (result.rows.length === 0) {
      return 0;
    }

    return parseFloat(result.rows[0].valor);
  }
}

module.exports = new CapitalService();
