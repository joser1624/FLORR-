const { query, getClient } = require('../config/database');

class TrabajadoresService {
  /**
   * Get all trabajadores
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM usuarios WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get trabajador by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create trabajador
   */
  async create(data) {
    const fields = ["nombre","email","password","telefono","cargo","rol","fecha_ingreso"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO usuarios (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update trabajador
   */
  async update(id, data) {
    const fields = ["nombre","email","password","telefono","cargo","rol","fecha_ingreso"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE usuarios SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete trabajador
   */
  async delete(id) {
    await query('DELETE FROM usuarios WHERE id = $1', [id]);
  }
}

module.exports = new TrabajadoresService();
