const { query } = require('../config/database');

class ReportesService {
  /**
   * Get monthly report for the specified month (YYYY-MM)
   * Requirements: 11.1-11.9, 21.3
   */
  async getMonthlyReport(mes) {
    // Requirement 11.1: Validate mes parameter format
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      const error = new Error('El parámetro mes debe estar en formato YYYY-MM');
      error.statusCode = 400;
      throw error;
    }

    // Run all queries in parallel for performance (< 3 seconds requirement)
    const [
      ventasResult,
      gastosResult,
      pedidosResult,
      ventasDiasResult,
      metodosPagoResult,
      topProductosResult,
      ventasTrabajadoresResult,
    ] = await Promise.all([
      // Requirement 11.2: Total sales for specified month
      query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE TO_CHAR(fecha, 'YYYY-MM') = $1`,
        [mes]
      ),
      // Requirement 11.3: Total expenses for specified month
      query(
        `SELECT COALESCE(SUM(monto), 0) AS total
         FROM gastos
         WHERE TO_CHAR(fecha, 'YYYY-MM') = $1`,
        [mes]
      ),
      // Requirement 11.4: Total orders for specified month
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE TO_CHAR(fecha_pedido, 'YYYY-MM') = $1`,
        [mes]
      ),
      // Requirement 11.5: Daily sales totals grouped by date
      query(
        `SELECT DATE(fecha) AS fecha, COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE TO_CHAR(fecha, 'YYYY-MM') = $1
         GROUP BY DATE(fecha)
         ORDER BY DATE(fecha) ASC`,
        [mes]
      ),
      // Requirement 11.6: Sales totals grouped by metodo_pago
      query(
        `SELECT metodo_pago AS metodo, COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE TO_CHAR(fecha, 'YYYY-MM') = $1
         GROUP BY metodo_pago
         ORDER BY total DESC`,
        [mes]
      ),
      // Requirement 11.7: Top 10 products by sales quantity
      query(
        `SELECT p.id, p.nombre,
                SUM(vp.cantidad) AS cantidad,
                COALESCE(SUM(vp.subtotal), 0) AS total
         FROM ventas_productos vp
         JOIN productos p ON vp.producto_id = p.id
         JOIN ventas v ON vp.venta_id = v.id
         WHERE TO_CHAR(v.fecha, 'YYYY-MM') = $1
         GROUP BY p.id, p.nombre
         ORDER BY cantidad DESC
         LIMIT 10`,
        [mes]
      ),
      // Requirement 11.8: Sales totals by worker
      query(
        `SELECT u.id AS trabajador_id, u.nombre,
                COALESCE(SUM(v.total), 0) AS total
         FROM usuarios u
         JOIN ventas v ON u.id = v.trabajador_id
         WHERE TO_CHAR(v.fecha, 'YYYY-MM') = $1
         GROUP BY u.id, u.nombre
         ORDER BY total DESC`,
        [mes]
      ),
    ]);

    const ventas_total = parseFloat(ventasResult.rows[0].total);
    const gastos_total = parseFloat(gastosResult.rows[0].total);
    const ganancia = ventas_total - gastos_total;
    const margen = ventas_total > 0 ? (ganancia / ventas_total) * 100 : 0;

    return {
      mes,
      ventas_total,
      gastos_total,
      ganancia,
      margen: parseFloat(margen.toFixed(2)),
      total_pedidos: parseInt(pedidosResult.rows[0].total),
      ventas_dias: ventasDiasResult.rows.map(r => ({
        fecha: r.fecha,
        total: parseFloat(r.total),
      })),
      metodos_pago: metodosPagoResult.rows.map(r => ({
        metodo: r.metodo,
        total: parseFloat(r.total),
      })),
      top_productos: topProductosResult.rows.map(r => ({
        id: r.id,
        nombre: r.nombre,
        cantidad: parseInt(r.cantidad),
        total: parseFloat(r.total),
      })),
      ventas_trabajadores: ventasTrabajadoresResult.rows.map(r => ({
        trabajador_id: r.trabajador_id,
        nombre: r.nombre,
        total: parseFloat(r.total),
      })),
    };
  }
}

module.exports = new ReportesService();
