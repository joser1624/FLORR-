const { query, getClient } = require('../config/database');

class PromocionesService {
  /**
   * Get all promociones
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM promociones WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get promocion by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM promociones WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create promocion
   */
  async create(data) {
    const fields = ["titulo","descripcion","descuento","tipo","fecha_desde","fecha_hasta","activa"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO promociones (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update promocion
   */
  async update(id, data) {
    const fields = ["titulo","descripcion","descuento","tipo","fecha_desde","fecha_hasta","activa"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE promociones SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete promocion
   */
  async delete(id) {
    await query('DELETE FROM promociones WHERE id = $1', [id]);
  }
}

module.exports = new PromocionesService();
