const { query, getClient } = require('../config/database');

class VentasService {
  /**
   * Get all ventas
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM ventas WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get venta by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM ventas WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create venta
   */
  async create(data) {
    const fields = ["fecha","total","metodo_pago","trabajador_id","cliente_id"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO ventas (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update venta
   */
  async update(id, data) {
    const fields = ["fecha","total","metodo_pago","trabajador_id","cliente_id"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE ventas SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete venta
   */
  async delete(id) {
    await query('DELETE FROM ventas WHERE id = $1', [id]);
  }
}

module.exports = new VentasService();
