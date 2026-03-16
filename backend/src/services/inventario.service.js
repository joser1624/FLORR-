const { query, getClient } = require('../config/database');

class InventarioService {
  /**
   * Get all items
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM inventario WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get item by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM inventario WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create item
   */
  async create(data) {
    const fields = ["nombre","tipo","stock","stock_min","unidad","costo"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO inventario (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update item
   */
  async update(id, data) {
    const fields = ["nombre","tipo","stock","stock_min","unidad","costo"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE inventario SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete item
   */
  async delete(id) {
    await query('DELETE FROM inventario WHERE id = $1', [id]);
  }
}

module.exports = new InventarioService();
