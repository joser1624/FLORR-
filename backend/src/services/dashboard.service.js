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
      // NUEVAS QUERIES
      cajaHoyResult,
      ventasDiaAnteriorResult,
      ventasMesAnteriorResult,
      pedidosUrgentesResult,
      pedidosParaHoyResult,
      pedidosSinPagoResult,
      metodosPagoResult,
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

      // Bottom 5 products: los menos vendidos del mes actual
      // Incluye productos activos aunque no tengan ventas este mes (cantidad = 0)
      query(
        `SELECT p.id, p.nombre,
                COALESCE(SUM(CASE
                  WHEN DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', CURRENT_DATE)
                  THEN vp.cantidad ELSE 0 END), 0) AS cantidad
         FROM productos p
         LEFT JOIN ventas_productos vp ON vp.producto_id = p.id
         LEFT JOIN ventas v ON vp.venta_id = v.id
         WHERE p.activo = true
         GROUP BY p.id, p.nombre
         ORDER BY cantidad ASC, p.nombre ASC
         LIMIT 5`
      ),

      // Pedidos recientes: últimos 5 pedidos ordenados por fecha (reducido de 10 a 5)
      query(
        `SELECT id, cliente_nombre AS cliente, cliente_telefono AS telefono,
                fecha_entrega, total, estado, fecha_pedido
         FROM pedidos
         ORDER BY fecha_pedido DESC
         LIMIT 5`
      ),

      // NUEVAS QUERIES PARA MEJORAS DEL DASHBOARD

      // Estado de caja del día
      query(
        `SELECT id, fecha, estado, monto_apertura, 
                trabajador_apertura_id, hora_apertura, hora_cierre,
                total_ventas, total_gastos,
                monto_cierre_fisico, diferencia_cierre, estado_arqueo
         FROM caja
         WHERE fecha = CURRENT_DATE`
      ).catch(() => ({ rows: [] })), // Si no hay caja, retornar array vacío

      // Ventas del día anterior (para comparativa)
      query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE DATE(fecha) = CURRENT_DATE - 1`
      ),

      // Ventas del mes anterior (para comparativa)
      query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`
      ),

      // Pedidos atrasados (fecha_entrega < hoy y estado no completado)
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE fecha_entrega < CURRENT_DATE
         AND estado NOT IN ('completado', 'cancelado')`
      ),

      // Pedidos para hoy (fecha_entrega = hoy)
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE DATE(fecha_entrega) = CURRENT_DATE
         AND estado NOT IN ('completado', 'cancelado')`
      ),

      // Pedidos sin pago (anticipo = 0 o null)
      query(
        `SELECT COUNT(*) AS total
         FROM pedidos
         WHERE (anticipo = 0 OR anticipo IS NULL)
         AND estado NOT IN ('completado', 'cancelado')`
      ),

      // Distribución de métodos de pago del día
      query(
        `SELECT metodo_pago, COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE DATE(fecha) = CURRENT_DATE
         GROUP BY metodo_pago
         ORDER BY total DESC`
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

    // Calcular comparativas
    const ventas_dia = parseFloat(ventasDiaResult.rows[0].total);
    const ventas_dia_anterior = parseFloat(ventasDiaAnteriorResult.rows[0].total);
    const ventas_mes_anterior = parseFloat(ventasMesAnteriorResult.rows[0].total);

    const comparativa_dia = ventas_dia_anterior > 0
      ? parseFloat((((ventas_dia - ventas_dia_anterior) / ventas_dia_anterior) * 100).toFixed(1))
      : 0;

    const comparativa_mes = ventas_mes_anterior > 0
      ? parseFloat((((ventas_mes - ventas_mes_anterior) / ventas_mes_anterior) * 100).toFixed(1))
      : 0;

    // Procesar estado de caja
    const cajaHoy = cajaHoyResult.rows.length > 0 ? {
      id: cajaHoyResult.rows[0].id,
      fecha: cajaHoyResult.rows[0].fecha,
      estado: cajaHoyResult.rows[0].estado,
      monto_apertura: parseFloat(cajaHoyResult.rows[0].monto_apertura || 0),
      hora_apertura: cajaHoyResult.rows[0].hora_apertura,
      hora_cierre: cajaHoyResult.rows[0].hora_cierre,
      total_ventas: parseFloat(cajaHoyResult.rows[0].total_ventas || 0),
      total_gastos: parseFloat(cajaHoyResult.rows[0].total_gastos || 0),
      monto_cierre_fisico: cajaHoyResult.rows[0].monto_cierre_fisico ? parseFloat(cajaHoyResult.rows[0].monto_cierre_fisico) : null,
      diferencia_cierre: cajaHoyResult.rows[0].diferencia_cierre ? parseFloat(cajaHoyResult.rows[0].diferencia_cierre) : null,
      estado_arqueo: cajaHoyResult.rows[0].estado_arqueo,
    } : null;

    return {
      ventas_dia,
      ventas_dia_anterior,
      comparativa_dia,
      ventas_mes,
      ventas_mes_anterior,
      comparativa_mes,
      ganancia_mes: parseFloat(ganancia_mes.toFixed(2)),
      margen_mes,
      pedidos_pendientes: parseInt(pedidosPendientesResult.rows[0].total, 10),
      pedidos_hoy: parseInt(pedidosHoyResult.rows[0].total, 10),
      pedidos_mes: parseInt(pedidosMesResult.rows[0].total, 10),
      // Nuevos datos de alertas de pedidos
      pedidos_atrasados: parseInt(pedidosUrgentesResult.rows[0].total, 10),
      pedidos_para_hoy: parseInt(pedidosParaHoyResult.rows[0].total, 10),
      pedidos_sin_pago: parseInt(pedidosSinPagoResult.rows[0].total, 10),
      // Estado de caja
      caja_hoy: cajaHoy,
      // Métodos de pago
      metodos_pago: metodosPagoResult.rows.map(m => ({
        metodo: m.metodo_pago,
        cantidad: parseInt(m.cantidad, 10),
        total: parseFloat(m.total),
      })),
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
