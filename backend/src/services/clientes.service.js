const { query, getClient } = require('../config/database');

class ClientesService {
  /**
   * Get all clientes
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get cliente by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create cliente
   */
  async create(data) {
    const fields = ["nombre","telefono","direccion","email"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO clientes (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update cliente
   */
  async update(id, data) {
    const fields = ["nombre","telefono","direccion","email"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE clientes SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete cliente
   */
  async delete(id) {
    await query('DELETE FROM clientes WHERE id = $1', [id]);
  }
}

module.exports = new ClientesService();
