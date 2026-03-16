const { query } = require('../config/database');

class ReportesService {
  /**
   * Get monthly reports
   */
  async getMonthlyReport(mes) {
    // Parse month (format: YYYY-MM)
    const [year, month] = mes.split('-');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

    // Total ventas del mes
    const ventasResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cantidad 
       FROM ventas 
       WHERE DATE(fecha) >= $1 AND DATE(fecha) <= $2`,
      [firstDay, lastDay]
    );

    // Total gastos del mes
    const gastosResult = await query(
      `SELECT COALESCE(SUM(monto), 0) as total 
       FROM gastos 
       WHERE fecha >= $1 AND fecha <= $2`,
      [firstDay, lastDay]
    );

    // Ventas por día
    const ventasDiasResult = await query(
      `SELECT DATE(fecha) as dia, COALESCE(SUM(total), 0) as total 
       FROM ventas 
       WHERE DATE(fecha) >= $1 AND DATE(fecha) <= $2 
       GROUP BY DATE(fecha) 
       ORDER BY DATE(fecha) ASC`,
      [firstDay, lastDay]
    );

    // Ventas por método de pago
    const metodosPagoResult = await query(
      `SELECT metodo_pago as metodo, COALESCE(SUM(total), 0) as total 
       FROM ventas 
       WHERE DATE(fecha) >= $1 AND DATE(fecha) <= $2 
       GROUP BY metodo_pago 
       ORDER BY total DESC`,
      [firstDay, lastDay]
    );

    // Top 5 productos más vendidos
    const topProductosResult = await query(
      `SELECT p.nombre, SUM(vp.cantidad) as cantidad, COALESCE(SUM(vp.subtotal), 0) as total 
       FROM ventas_productos vp 
       JOIN productos p ON vp.producto_id = p.id 
       JOIN ventas v ON vp.venta_id = v.id 
       WHERE DATE(v.fecha) >= $1 AND DATE(v.fecha) <= $2 
       GROUP BY p.id, p.nombre 
       ORDER BY cantidad DESC 
       LIMIT 5`,
      [firstDay, lastDay]
    );

    // Ventas por trabajador
    const ventasTrabajadoresResult = await query(
      `SELECT u.nombre, COALESCE(SUM(v.total), 0) as total, COUNT(v.id) as cantidad_ventas 
       FROM usuarios u 
       LEFT JOIN ventas v ON u.id = v.trabajador_id 
         AND DATE(v.fecha) >= $1 AND DATE(v.fecha) <= $2 
       WHERE u.activo = true AND u.rol IN ('admin', 'empleado') 
       GROUP BY u.id, u.nombre 
       HAVING COUNT(v.id) > 0 
       ORDER BY total DESC`,
      [firstDay, lastDay]
    );

    // Total pedidos del mes
    const pedidosResult = await query(
      `SELECT COUNT(*) as total 
       FROM pedidos 
       WHERE DATE(fecha_pedido) >= $1 AND DATE(fecha_pedido) <= $2`,
      [firstDay, lastDay]
    );

    return {
      ventas_total: parseFloat(ventasResult.rows[0].total),
      gastos_total: parseFloat(gastosResult.rows[0].total),
      ganancia_neta: parseFloat(ventasResult.rows[0].total) - parseFloat(gastosResult.rows[0].total),
      total_pedidos: parseInt(pedidosResult.rows[0].total),
      cantidad_ventas: parseInt(ventasResult.rows[0].cantidad),
      ventas_dias: ventasDiasResult.rows.map(v => ({
        dia: v.dia,
        total: parseFloat(v.total)
      })),
      metodos_pago: metodosPagoResult.rows.map(m => ({
        metodo: m.metodo,
        total: parseFloat(m.total)
      })),
      top_productos: topProductosResult.rows.map(p => ({
        nombre: p.nombre,
        cantidad: parseInt(p.cantidad),
        total: parseFloat(p.total)
      })),
      ventas_trabajadores: ventasTrabajadoresResult.rows.map(t => ({
        nombre: t.nombre,
        total: parseFloat(t.total),
        cantidad_ventas: parseInt(t.cantidad_ventas)
      }))
    };
  }
}

module.exports = new ReportesService();
