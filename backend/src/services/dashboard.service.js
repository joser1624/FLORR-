const { query } = require('../config/database');

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Ventas del día
    const ventasDiaResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cantidad 
       FROM ventas 
       WHERE DATE(fecha) = $1`,
      [today]
    );

    // Ventas del mes
    const ventasMesResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cantidad 
       FROM ventas 
       WHERE DATE(fecha) >= $1`,
      [firstDayOfMonth]
    );

    // Gastos del mes
    const gastosMesResult = await query(
      `SELECT COALESCE(SUM(monto), 0) as total 
       FROM gastos 
       WHERE fecha >= $1`,
      [firstDayOfMonth]
    );

    // Ganancia del mes
    const ganancia_mes = parseFloat(ventasMesResult.rows[0].total) - parseFloat(gastosMesResult.rows[0].total);
    const margen_mes = ventasMesResult.rows[0].total > 0 
      ? (ganancia_mes / parseFloat(ventasMesResult.rows[0].total)) * 100 
      : 0;

    // Pedidos pendientes
    const pedidosPendientesResult = await query(
      `SELECT COUNT(*) as total 
       FROM pedidos 
       WHERE estado IN ('pendiente', 'en preparación')`
    );

    // Stock bajo
    const stockBajoResult = await query(
      `SELECT id, nombre, stock, stock_min, tipo 
       FROM inventario 
       WHERE stock <= stock_min 
       ORDER BY stock ASC 
       LIMIT 10`
    );

    // Ventas de la semana (últimos 7 días)
    const ventasSemanaResult = await query(
      `SELECT DATE(fecha) as fecha, COALESCE(SUM(total), 0) as total 
       FROM ventas 
       WHERE fecha >= CURRENT_DATE - INTERVAL '7 days' 
       GROUP BY DATE(fecha) 
       ORDER BY DATE(fecha) ASC`
    );

    // Top 5 productos más vendidos del mes
    const topProductosResult = await query(
      `SELECT p.nombre, SUM(vp.cantidad) as cantidad 
       FROM ventas_productos vp 
       JOIN productos p ON vp.producto_id = p.id 
       JOIN ventas v ON vp.venta_id = v.id 
       WHERE DATE(v.fecha) >= $1 
       GROUP BY p.id, p.nombre 
       ORDER BY cantidad DESC 
       LIMIT 5`,
      [firstDayOfMonth]
    );

    // Pedidos recientes
    const pedidosRecientesResult = await query(
      `SELECT p.*, c.nombre as cliente_nombre 
       FROM pedidos p 
       LEFT JOIN clientes c ON p.cliente_id = c.id 
       ORDER BY p.created_at DESC 
       LIMIT 5`
    );

    // Ventas por trabajador del mes
    const ventasTrabajadoresResult = await query(
      `SELECT u.nombre, COALESCE(SUM(v.total), 0) as total 
       FROM usuarios u 
       LEFT JOIN ventas v ON u.id = v.trabajador_id AND DATE(v.fecha) >= $1 
       WHERE u.activo = true AND u.rol IN ('admin', 'empleado') 
       GROUP BY u.id, u.nombre 
       ORDER BY total DESC`,
      [firstDayOfMonth]
    );

    return {
      ventas_dia: parseFloat(ventasDiaResult.rows[0].total),
      ventas_mes: parseFloat(ventasMesResult.rows[0].total),
      ganancia_mes: ganancia_mes,
      margen_mes: parseFloat(margen_mes.toFixed(2)),
      pedidos_pendientes: parseInt(pedidosPendientesResult.rows[0].total),
      pedidos_hoy: parseInt(ventasDiaResult.rows[0].cantidad),
      pedidos_mes: parseInt(ventasMesResult.rows[0].cantidad),
      stock_bajo: stockBajoResult.rows.map(item => ({
        id: item.id,
        nombre: item.nombre,
        stock_actual: item.stock,
        stock_min: item.stock_min,
        tipo: item.tipo
      })),
      ventas_semana: ventasSemanaResult.rows.map(v => ({
        fecha: v.fecha,
        total: parseFloat(v.total)
      })),
      top_productos: topProductosResult.rows.map(p => ({
        nombre: p.nombre,
        cantidad: parseInt(p.cantidad)
      })),
      pedidos_recientes: pedidosRecientesResult.rows,
      ventas_trabajadores: ventasTrabajadoresResult.rows.map(t => ({
        nombre: t.nombre,
        total: parseFloat(t.total)
      }))
    };
  }
}

module.exports = new DashboardService();
