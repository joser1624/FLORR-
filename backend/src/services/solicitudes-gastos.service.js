const { query } = require('../config/database');

class SolicitudesGastosService {
  /**
   * Crear nueva solicitud de gasto (empleado)
   */
  async crear(trabajadorId, data) {
    const { monto, categoria, descripcion, empresa, numero_comprobante } = data;

    // Validar que hay caja abierta
    const cajaResult = await query(
      "SELECT id FROM caja WHERE fecha = CURRENT_DATE AND estado = 'abierta'",
      []
    );

    if (cajaResult.rows.length === 0) {
      const error = new Error('No hay caja abierta. Debes abrir la caja para crear solicitudes de gastos.');
      error.statusCode = 400;
      throw error;
    }

    const cajaId = cajaResult.rows[0].id;

    // Crear solicitud
    const result = await query(
      `INSERT INTO solicitudes_gastos 
        (trabajador_id, caja_id, monto, categoria, descripcion, empresa, numero_comprobante, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
       RETURNING *`,
      [trabajadorId, cajaId, monto, categoria, descripcion, empresa, numero_comprobante]
    );

    const solicitud = result.rows[0];
    return {
      ...solicitud,
      monto: parseFloat(solicitud.monto)
    };
  }

  /**
   * Listar solicitudes
   * - Empleado: solo sus propias solicitudes
   * - Admin/Dueña: todas las solicitudes
   */
  async listar(usuarioId, usuarioRol, filtros = {}) {
    const { estado, fecha_desde, fecha_hasta } = filtros;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    // Si es empleado, solo ver sus solicitudes
    if (usuarioRol === 'empleado') {
      whereConditions.push(`s.trabajador_id = $${paramCount}`);
      params.push(usuarioId);
      paramCount++;
    }

    // Filtro por estado
    if (estado) {
      whereConditions.push(`s.estado = $${paramCount}`);
      params.push(estado);
      paramCount++;
    }

    // Filtro por fecha
    if (fecha_desde) {
      whereConditions.push(`DATE(s.fecha_solicitud) >= $${paramCount}`);
      params.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      whereConditions.push(`DATE(s.fecha_solicitud) <= $${paramCount}`);
      params.push(fecha_hasta);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const result = await query(
      `SELECT s.*,
              u1.nombre AS trabajador_nombre,
              u2.nombre AS aprobado_por_nombre,
              c.fecha AS caja_fecha
       FROM solicitudes_gastos s
       LEFT JOIN usuarios u1 ON s.trabajador_id = u1.id
       LEFT JOIN usuarios u2 ON s.aprobado_por_id = u2.id
       LEFT JOIN caja c ON s.caja_id = c.id
       ${whereClause}
       ORDER BY s.fecha_solicitud DESC`,
      params
    );

    return result.rows.map(s => ({
      ...s,
      monto: parseFloat(s.monto)
    }));
  }

  /**
   * Obtener solicitud por ID
   */
  async obtenerPorId(id, usuarioId, usuarioRol) {
    const result = await query(
      `SELECT s.*,
              u1.nombre AS trabajador_nombre,
              u2.nombre AS aprobado_por_nombre,
              c.fecha AS caja_fecha
       FROM solicitudes_gastos s
       LEFT JOIN usuarios u1 ON s.trabajador_id = u1.id
       LEFT JOIN usuarios u2 ON s.aprobado_por_id = u2.id
       LEFT JOIN caja c ON s.caja_id = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const solicitud = result.rows[0];

    // Si es empleado, solo puede ver sus propias solicitudes
    if (usuarioRol === 'empleado' && solicitud.trabajador_id !== usuarioId) {
      const error = new Error('No tienes permiso para ver esta solicitud');
      error.statusCode = 403;
      throw error;
    }

    return {
      ...solicitud,
      monto: parseFloat(solicitud.monto)
    };
  }

  /**
   * Aprobar solicitud (admin/dueña)
   */
  async aprobar(id, adminId) {
    // Verificar que la solicitud existe y está pendiente
    const solicitudResult = await query(
      'SELECT * FROM solicitudes_gastos WHERE id = $1',
      [id]
    );

    if (solicitudResult.rows.length === 0) {
      const error = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const solicitud = solicitudResult.rows[0];

    if (solicitud.estado !== 'pendiente') {
      const error = new Error(`Esta solicitud ya fue ${solicitud.estado}`);
      error.statusCode = 400;
      throw error;
    }

    // Actualizar solicitud a aprobada
    const updateResult = await query(
      `UPDATE solicitudes_gastos
       SET estado = 'aprobada',
           fecha_aprobacion = NOW(),
           aprobado_por_id = $1
       WHERE id = $2
       RETURNING *`,
      [adminId, id]
    );

    console.log('✅ Solicitud aprobada, creando gasto...');
    console.log('Datos del gasto:', {
      descripcion: `${solicitud.descripcion} (${solicitud.empresa} - ${solicitud.numero_comprobante})`,
      categoria: solicitud.categoria,
      monto: solicitud.monto
    });

    // Crear gasto real en la tabla gastos
    const gastoResult = await query(
      `INSERT INTO gastos (descripcion, categoria, monto, fecha)
       VALUES ($1, $2, $3, CURRENT_DATE)
       RETURNING *`,
      [
        `${solicitud.descripcion} (${solicitud.empresa} - ${solicitud.numero_comprobante})`,
        solicitud.categoria,
        solicitud.monto
      ]
    );

    console.log('✅ Gasto creado:', gastoResult.rows[0]);

    return {
      ...updateResult.rows[0],
      monto: parseFloat(updateResult.rows[0].monto)
    };
  }

  /**
   * Rechazar solicitud (admin/dueña)
   */
  async rechazar(id, adminId, comentario) {
    // Verificar que la solicitud existe y está pendiente
    const solicitudResult = await query(
      'SELECT * FROM solicitudes_gastos WHERE id = $1',
      [id]
    );

    if (solicitudResult.rows.length === 0) {
      const error = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const solicitud = solicitudResult.rows[0];

    if (solicitud.estado !== 'pendiente') {
      const error = new Error(`Esta solicitud ya fue ${solicitud.estado}`);
      error.statusCode = 400;
      throw error;
    }

    // Actualizar solicitud a rechazada
    const result = await query(
      `UPDATE solicitudes_gastos
       SET estado = 'rechazada',
           fecha_aprobacion = NOW(),
           aprobado_por_id = $1,
           comentario_rechazo = $2
       WHERE id = $3
       RETURNING *`,
      [adminId, comentario, id]
    );

    return {
      ...result.rows[0],
      monto: parseFloat(result.rows[0].monto)
    };
  }

  /**
   * Contar solicitudes pendientes (para dashboard admin)
   */
  async contarPendientes() {
    const result = await query(
      "SELECT COUNT(*) as count FROM solicitudes_gastos WHERE estado = 'pendiente'",
      []
    );

    return parseInt(result.rows[0].count);
  }
}

module.exports = new SolicitudesGastosService();
