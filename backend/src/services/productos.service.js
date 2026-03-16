const { query } = require('../config/database');

class ProductosService {
  /**
   * Get all products
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM productos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.categoria) {
      queryText += ` AND categoria = $${paramCount}`;
      params.push(filters.categoria);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      queryText += ` AND activo = $${paramCount}`;
      params.push(filters.activo);
      paramCount++;
    }

    if (filters.stock_bajo) {
      queryText += ` AND stock <= 3`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get product by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create product
   */
  async create(data) {
    const result = await query(
      `INSERT INTO productos (nombre, descripcion, categoria, precio, costo, stock, activo, imagen_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        data.nombre,
        data.descripcion || null,
        data.categoria,
        data.precio,
        data.costo,
        data.stock || 0,
        data.activo !== undefined ? data.activo : true,
        data.imagen_url || null
      ]
    );
    return result.rows[0];
  }

  /**
   * Update product
   */
  async update(id, data) {
    const result = await query(
      `UPDATE productos 
       SET nombre = $1, descripcion = $2, categoria = $3, precio = $4, 
           costo = $5, stock = $6, activo = $7, imagen_url = $8 
       WHERE id = $9 
       RETURNING *`,
      [
        data.nombre,
        data.descripcion || null,
        data.categoria,
        data.precio,
        data.costo,
        data.stock,
        data.activo !== undefined ? data.activo : true,
        data.imagen_url || null,
        id
      ]
    );
    return result.rows[0];
  }

  /**
   * Delete product
   */
  async delete(id) {
    await query('DELETE FROM productos WHERE id = $1', [id]);
  }

  /**
   * Update stock
   */
  async updateStock(id, cantidad) {
    const result = await query(
      'UPDATE productos SET stock = stock + $1 WHERE id = $2 RETURNING *',
      [cantidad, id]
    );
    return result.rows[0];
  }

  /**
   * Deduct stock (for sales)
   */
  async deductStock(id, cantidad) {
    const result = await query(
      'UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *',
      [cantidad, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Stock insuficiente');
    }
    
    return result.rows[0];
  }
}

module.exports = new ProductosService();
