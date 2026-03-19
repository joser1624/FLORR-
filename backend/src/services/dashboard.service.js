const { query } = require('../config/database');

class DashboardService {
  /**
   * Get dashboard statistics
   * All queries run in parallel via Promise.all for performance (Req 3.11, 21.2)
   */
  async getDashboardStats() {
    // Run all queries in parallel for performance
    const [
      ventasDiaResult,
      ventasMesResult,
      gastosMesResult,
      pedidosPendientesResult,
      pedidosHoyResult,
      pedidosMesResult,
      stockBajoResult,
      ventasSemanaResult,
      topProductosResult,
      ventasTrabajadoresResult,
      bottomProductosResult,
      pedidosRecientesResult,
    ] = await Promise.all([
      // Req 3.1: Total sales for current day
      query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE DATE(fecha) = CURRENT_DATE`
      ),

      // Req 3.2: Total sales for current month
      query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)`
      ),

      // Req 3.3: Total expenses for current month (used to calculate ganancia_mes)
      query(
        `SELECT COALESCE(SUM(monto), 0) AS total
         FROM gastos
         WHERE DATE_TRUNC('month', fecha::timestamp) = DATE_TRUNC('month', CURRENT_DATE)`
      ),

      // Req 3.5: Count pending orders (estado pendiente or en preparación)
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE estado IN ('pendiente', 'en preparación')`
      ),

      // Req 3.6: Count orders for current day
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE DATE(fecha_pedido) = CURRENT_DATE`
      ),

      // Count orders for current month
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE DATE_TRUNC('month', fecha_pedido) = DATE_TRUNC('month', CURRENT_DATE)`
      ),

      // Req 3.7: Items where stock <= stock_min, ordered by stock ASC
      query(
        `SELECT id, nombre, stock, stock_min, tipo
         FROM inventario
         WHERE stock <= stock_min
         ORDER BY stock ASC`
      ),

      // Req 3.8: Sales totals for last 7 days grouped by date (today included)
      query(
        `SELECT DATE(fecha) AS fecha, COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE DATE(fecha) >= CURRENT_DATE - INTERVAL '6 days'
         GROUP BY DATE(fecha)
         ORDER BY DATE(fecha) ASC`
      ),

      // Req 3.9: Top 5 products by sales quantity for current month
      query(
        `SELECT p.id, p.nombre, SUM(vp.cantidad) AS cantidad
         FROM ventas_productos vp
         JOIN productos p ON vp.producto_id = p.id
         JOIN ventas v ON vp.venta_id = v.id
         WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY p.id, p.nombre
         ORDER BY cantidad DESC
         LIMIT 5`
      ),

      // Req 3.10: Sales totals by worker for current month
      query(
        `SELECT u.nombre, COALESCE(SUM(v.total), 0) AS total
         FROM usuarios u
         LEFT JOIN ventas v ON u.id = v.trabajador_id
           AND DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', CURRENT_DATE)
         WHERE u.activo = true AND u.rol IN ('admin', 'empleado')
         GROUP BY u.id, u.nombre
         ORDER BY total DESC`
      ),

      // Bottom 5 products by sales quantity for current month (least sold)
      query(
        `SELECT p.id, p.nombre, SUM(vp.cantidad) AS cantidad
         FROM ventas_productos vp
         JOIN productos p ON vp.producto_id = p.id
         JOIN ventas v ON vp.venta_id = v.id
         WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY p.id, p.nombre
         ORDER BY cantidad ASC
         LIMIT 5`
      ),

      // Pedidos recientes: últimos 10 pedidos ordenados por fecha
      query(
        `SELECT id, cliente, telefono, fecha_entrega, total, estado, fecha_pedido
         FROM pedidos
         ORDER BY fecha_pedido DESC
         LIMIT 10`
      ),
    ]);

    // Req 3.3: ganancia_mes = ventas_mes - gastos_mes
    const ventas_mes = parseFloat(ventasMesResult.rows[0].total);
    const gastos_mes = parseFloat(gastosMesResult.rows[0].total);
    const ganancia_mes = ventas_mes - gastos_mes;

    // Req 3.4: margen_mes = (ganancia_mes / ventas_mes * 100) when ventas_mes > 0, else 0
    const margen_mes = ventas_mes > 0
      ? parseFloat(((ganancia_mes / ventas_mes) * 100).toFixed(2))
      : 0;

    return {
      ventas_dia: parseFloat(ventasDiaResult.rows[0].total),
      ventas_mes,
      ganancia_mes: parseFloat(ganancia_mes.toFixed(2)),
      margen_mes,
      pedidos_pendientes: parseInt(pedidosPendientesResult.rows[0].total, 10),
      pedidos_hoy: parseInt(pedidosHoyResult.rows[0].total, 10),
      pedidos_mes: parseInt(pedidosMesResult.rows[0].total, 10),
      stock_bajo: stockBajoResult.rows.map(item => ({
        id: item.id,
        nombre: item.nombre,
        stock_actual: parseInt(item.stock, 10),
        stock_min: parseInt(item.stock_min, 10),
        tipo: item.tipo,
      })),
      ventas_semana: ventasSemanaResult.rows.map(v => ({
        fecha: v.fecha,
        total: parseFloat(v.total),
      })),
      top_productos: topProductosResult.rows.map(p => ({
        nombre: p.nombre,
        cantidad: parseInt(p.cantidad, 10),
      })),
      bottom_productos: bottomProductosResult.rows.map(p => ({
        nombre: p.nombre,
        cantidad: parseInt(p.cantidad, 10),
      })),
      ventas_trabajadores: ventasTrabajadoresResult.rows.map(t => ({
        nombre: t.nombre,
        total: parseFloat(t.total),
      })),
      pedidos_recientes: pedidosRecientesResult.rows.map(p => ({
        id: p.id,
        cliente: p.cliente,
        telefono: p.telefono,
        fecha_entrega: p.fecha_entrega,
        total: parseFloat(p.total),
        estado: p.estado,
        fecha_pedido: p.fecha_pedido,
      })),
    };
  }
  /**
   * Get sales totals grouped by date for the last N days
   */
  async getVentasPeriodo(dias = 7) {
    const result = await query(
      `SELECT DATE(fecha) AS fecha, COALESCE(SUM(total), 0) AS total
       FROM ventas
       WHERE DATE(fecha) >= CURRENT_DATE - INTERVAL '${parseInt(dias) - 1} days'
       GROUP BY DATE(fecha)
       ORDER BY DATE(fecha) ASC`
    );
    return result.rows.map(v => ({
      fecha: v.fecha,
      total: parseFloat(v.total),
    }));
  }
}

module.exports = new DashboardService();
