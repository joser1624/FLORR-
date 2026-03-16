const { query, getClient } = require('../config/database');

class PedidosService {
  /**
   * Get all pedidos
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM pedidos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get pedido by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM pedidos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create pedido
   */
  async create(data) {
    const fields = ["cliente_id","cliente_nombre","cliente_telefono","direccion","fecha_entrega","descripcion","total","metodo_pago","estado","trabajador_id"];
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO pedidos (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update pedido
   */
  async update(id, data) {
    const fields = ["cliente_id","cliente_nombre","cliente_telefono","direccion","fecha_entrega","descripcion","total","metodo_pago","estado","trabajador_id"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE pedidos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete pedido
   */
  async delete(id) {
    await query('DELETE FROM pedidos WHERE id = $1', [id]);
  }
}

module.exports = new PedidosService();
