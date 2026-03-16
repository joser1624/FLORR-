const { query, getClient } = require('../config/database');

class ArreglosService {
  /**
   * Get all arreglos
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM arreglos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get arreglo by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM arreglos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create arreglo
   */
  async create(data) {
    const fields = ["nombre","margen","costo_total","precio_venta"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO arreglos (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update arreglo
   */
  async update(id, data) {
    const fields = ["nombre","margen","costo_total","precio_venta"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE arreglos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete arreglo
   */
  async delete(id) {
    await query('DELETE FROM arreglos WHERE id = $1', [id]);
  }
}

module.exports = new ArreglosService();
