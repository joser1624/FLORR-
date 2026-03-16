const { query, getClient } = require('../config/database');

class GastosService {
  /**
   * Get all gastos
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM gastos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get gasto by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM gastos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create gasto
   */
  async create(data) {
    const fields = ["descripcion","categoria","monto","fecha"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO gastos (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update gasto
   */
  async update(id, data) {
    const fields = ["descripcion","categoria","monto","fecha"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE gastos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete gasto
   */
  async delete(id) {
    await query('DELETE FROM gastos WHERE id = $1', [id]);
  }
}

module.exports = new GastosService();
