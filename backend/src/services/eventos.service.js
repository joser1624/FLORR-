const { query, getClient } = require('../config/database');

class EventosService {
  /**
   * Get all eventos
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM eventos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get evento by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM eventos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create evento
   */
  async create(data) {
    const fields = ["nombre","descripcion","emoji","fecha","color","activo"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO eventos (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update evento
   */
  async update(id, data) {
    const fields = ["nombre","descripcion","emoji","fecha","color","activo"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE eventos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete evento
   */
  async delete(id) {
    await query('DELETE FROM eventos WHERE id = $1', [id]);
  }
}

module.exports = new EventosService();
