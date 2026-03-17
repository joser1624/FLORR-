const { query } = require('../config/database');

class ClientesService {
  /**
   * Get all clientes with pagination support
   * Requirement 8.5: Support pagination
   * Requirement 8.6: Use parameterized queries
   */
  async getAll(filters = {}) {
    // Pagination support
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) as total FROM clientes');
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const result = await query(
      'SELECT * FROM clientes ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return {
      clientes: result.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Get cliente by ID
   * Requirement 8.6: Use parameterized queries
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get cliente by telefono
   * Requirement 8.4: Query by telefono
   * Requirement 8.6: Use parameterized queries
   */
  async getByTelefono(telefono) {
    const result = await query(
      'SELECT * FROM clientes WHERE telefono = $1',
      [telefono]
    );
    return result.rows[0];
  }

  /**
   * Create cliente with validation
   * Requirement 8.1: Validate nombre is not empty
   * Requirement 8.2: Validate telefono is not empty
   * Requirement 8.6: Use parameterized queries
   */
  async create(data) {
    // Requirement 8.1: Validate nombre is not empty
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre del cliente no puede estar vacío');
    }

    // Requirement 8.2: Validate telefono is not empty
    if (!data.telefono || data.telefono.trim() === '') {
      throw new Error('El teléfono del cliente no puede estar vacío');
    }

    const result = await query(
      `INSERT INTO clientes (nombre, telefono, direccion, email) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        data.nombre.trim(),
        data.telefono.trim(),
        data.direccion || null,
        data.email || null
      ]
    );
    return result.rows[0];
  }

  /**
   * Update cliente
   * Requirement 8.3: Update updated_at timestamp
   * Requirement 8.6: Use parameterized queries
   */
  async update(id, data) {
    // Validate if data contains validation fields
    if (data.nombre !== undefined && (!data.nombre || data.nombre.trim() === '')) {
      throw new Error('El nombre del cliente no puede estar vacío');
    }

    if (data.telefono !== undefined && (!data.telefono || data.telefono.trim() === '')) {
      throw new Error('El teléfono del cliente no puede estar vacío');
    }

    // Get existing cliente to preserve fields not being updated
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    // Requirement 8.3: Update updated_at timestamp (handled by trigger)
    const result = await query(
      `UPDATE clientes 
       SET nombre = $1, telefono = $2, direccion = $3, email = $4, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [
        data.nombre !== undefined ? data.nombre.trim() : existing.nombre,
        data.telefono !== undefined ? data.telefono.trim() : existing.telefono,
        data.direccion !== undefined ? data.direccion : existing.direccion,
        data.email !== undefined ? data.email : existing.email,
        id
      ]
    );
    return result.rows[0];
  }

  /**
   * Delete cliente
   * Requirement 8.6: Use parameterized queries
   */
  async delete(id) {
    await query('DELETE FROM clientes WHERE id = $1', [id]);
  }
}

module.exports = new ClientesService();
