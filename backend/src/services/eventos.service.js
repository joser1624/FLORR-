const { query } = require('../config/database');

const ALLOWED_COLORS = ['rosa', 'dorado', 'rojo', 'morado'];

class EventosService {
  /**
   * Get all eventos with optional filtering
   * Requirements: 15.4, 15.5, 15.6, 15.7
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM eventos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Requirement 15.4: Filter by activo
    if (filters.activo !== undefined && filters.activo !== null) {
      queryText += ` AND activo = $${paramCount}`;
      params.push(filters.activo === 'true' || filters.activo === true);
      paramCount++;
    }

    // Requirement 15.5: Filter by fecha
    if (filters.fecha) {
      queryText += ` AND fecha = $${paramCount}`;
      params.push(filters.fecha);
      paramCount++;
    }

    // Requirement 15.6: Order by fecha ascending
    queryText += ' ORDER BY fecha ASC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get evento by ID
   * Requirement 15.7
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM eventos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create evento with validation
   * Requirements: 15.1, 15.2, 15.7
   */
  async create(data) {
    // Requirement 15.1: Validate nombre is not empty
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }

    // Requirement 15.2: Validate color is in allowed list
    if (!data.color || !ALLOWED_COLORS.includes(data.color)) {
      throw new Error(`El color debe ser uno de: ${ALLOWED_COLORS.join(', ')}`);
    }

    // Convertir metadata a JSON si es necesario
    let metadataValue = null;
    if (data.metadata) {
      metadataValue = typeof data.metadata === 'string' 
        ? data.metadata 
        : JSON.stringify(data.metadata);
    }

    const result = await query(
      `INSERT INTO eventos (nombre, descripcion, emoji, fecha, color, activo, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING *`,
      [
        data.nombre.trim(),
        data.descripcion || null,
        data.emoji || null,
        data.fecha || null,
        data.color,
        data.activo !== undefined ? data.activo : true,
        metadataValue
      ]
    );
    return result.rows[0];
  }

  /**
   * Update evento
   * Requirements: 15.3, 15.7
   */
  async update(id, data) {
    if (data.nombre !== undefined && data.nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }

    if (data.color !== undefined && !ALLOWED_COLORS.includes(data.color)) {
      throw new Error(`El color debe ser uno de: ${ALLOWED_COLORS.join(', ')}`);
    }

    // Convertir metadata a JSON si es necesario
    let metadataValue = null;
    if (data.metadata !== undefined) {
      if (data.metadata === null) {
        metadataValue = null;
      } else {
        metadataValue = typeof data.metadata === 'string' 
          ? data.metadata 
          : JSON.stringify(data.metadata);
      }
    }

    const result = await query(
      `UPDATE eventos
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           emoji = COALESCE($3, emoji),
           fecha = COALESCE($4, fecha),
           color = COALESCE($5, color),
           activo = COALESCE($6, activo),
           metadata = COALESCE($7::jsonb, metadata),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        data.nombre !== undefined ? data.nombre.trim() : null,
        data.descripcion !== undefined ? data.descripcion : null,
        data.emoji !== undefined ? data.emoji : null,
        data.fecha !== undefined ? data.fecha : null,
        data.color !== undefined ? data.color : null,
        data.activo !== undefined ? data.activo : null,
        metadataValue,
        id
      ]
    );
    return result.rows[0];
  }

  /**
   * Delete evento
   * Requirement 15.7
   */
  async delete(id) {
    await query('DELETE FROM eventos WHERE id = $1', [id]);
  }
}

module.exports = new EventosService();
