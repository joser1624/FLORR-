const { query } = require('../config/database');

const ALLOWED_TIPOS = ['porcentaje', '2x1', 'precio_fijo', 'regalo'];

class PromocionesService {
  /**
   * Get all promociones with optional filtering
   * Requirements: 14.6, 14.7, 14.8
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM promociones WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.activa !== undefined && filters.activa !== null) {
      queryText += ` AND activa = $${paramCount}`;
      params.push(filters.activa === 'true' || filters.activa === true);
      paramCount++;
    }

    if (filters.fecha_desde) {
      queryText += ` AND fecha_desde >= $${paramCount}`;
      params.push(filters.fecha_desde);
      paramCount++;
    }

    if (filters.fecha_hasta) {
      queryText += ` AND fecha_hasta <= $${paramCount}`;
      params.push(filters.fecha_hasta);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get promocion by ID
   * Requirement 14.8
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM promociones WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create promocion with validation
   * Requirements: 14.1, 14.2, 14.3, 14.4, 14.8
   */
  async create(data) {
    const errors = [];

    if (!data.titulo || data.titulo.trim() === '') {
      errors.push('El título no puede estar vacío');
    }

    if (!data.tipo || !ALLOWED_TIPOS.includes(data.tipo)) {
      errors.push(`El tipo debe ser uno de: ${ALLOWED_TIPOS.join(', ')}`);
    }

    if (data.descuento === undefined || data.descuento === null || data.descuento < 0 || data.descuento > 100) {
      errors.push('El descuento debe estar entre 0 y 100');
    }

    if (data.fecha_desde && data.fecha_hasta) {
      if (new Date(data.fecha_desde) > new Date(data.fecha_hasta)) {
        errors.push('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      }
    }

    if (errors.length > 0) {
      const error = new Error('Errores de validación');
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    const result = await query(
      `INSERT INTO promociones (titulo, descripcion, descuento, tipo, fecha_desde, fecha_hasta, activa)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.titulo.trim(),
        data.descripcion || null,
        data.descuento,
        data.tipo,
        data.fecha_desde || null,
        data.fecha_hasta || null,
        data.activa !== undefined ? data.activa : true
      ]
    );
    return result.rows[0];
  }

  /**
   * Update promocion
   * Requirements: 14.5, 14.8
   */
  async update(id, data) {
    const errors = [];

    if (data.titulo !== undefined && data.titulo.trim() === '') {
      errors.push('El título no puede estar vacío');
    }

    if (data.tipo !== undefined && !ALLOWED_TIPOS.includes(data.tipo)) {
      errors.push(`El tipo debe ser uno de: ${ALLOWED_TIPOS.join(', ')}`);
    }

    if (data.descuento !== undefined && (data.descuento < 0 || data.descuento > 100)) {
      errors.push('El descuento debe estar entre 0 y 100');
    }

    if (data.fecha_desde && data.fecha_hasta) {
      if (new Date(data.fecha_desde) > new Date(data.fecha_hasta)) {
        errors.push('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      }
    }

    if (errors.length > 0) {
      const error = new Error('Errores de validación');
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    const result = await query(
      `UPDATE promociones
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           descuento = COALESCE($3, descuento),
           tipo = COALESCE($4, tipo),
           fecha_desde = COALESCE($5, fecha_desde),
           fecha_hasta = COALESCE($6, fecha_hasta),
           activa = COALESCE($7, activa),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        data.titulo !== undefined ? data.titulo.trim() : null,
        data.descripcion !== undefined ? data.descripcion : null,
        data.descuento !== undefined ? data.descuento : null,
        data.tipo !== undefined ? data.tipo : null,
        data.fecha_desde !== undefined ? data.fecha_desde : null,
        data.fecha_hasta !== undefined ? data.fecha_hasta : null,
        data.activa !== undefined ? data.activa : null,
        id
      ]
    );
    return result.rows[0];
  }

  /**
   * Delete promocion
   * Requirement 14.8
   */
  async delete(id) {
    await query('DELETE FROM promociones WHERE id = $1', [id]);
  }
}

module.exports = new PromocionesService();
