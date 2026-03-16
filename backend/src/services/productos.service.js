const { query } = require('../config/database');

class ProductosService {
  /**
   * Get all products with filtering
   * Requirement 4.9: Support filtering by categoria
   * Requirement 4.10: Support filtering by activo status
   * Requirement 4.11: Use parameterized queries
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM productos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by categoria
    if (filters.categoria) {
      queryText += ` AND categoria = $${paramCount}`;
      params.push(filters.categoria);
      paramCount++;
    }

    // Filter by activo status
    if (filters.activo !== undefined) {
      queryText += ` AND activo = $${paramCount}`;
      params.push(filters.activo);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get product by ID
   * Requirement 4.11: Use parameterized queries
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create product with validation
   * Requirement 4.1: Validate nombre is not empty
   * Requirement 4.2: Validate precio >= 0
   * Requirement 4.3: Validate costo >= 0
   * Requirement 4.4: Validate stock >= 0
   * Requirement 4.5: Validate categoria is in allowed list
   * Requirement 4.11: Use parameterized queries
   */
  async create(data) {
    // Requirement 4.1: Validate nombre is not empty
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre del producto no puede estar vacío');
    }

    // Requirement 4.2: Validate precio >= 0
    if (data.precio < 0) {
      throw new Error('El precio debe ser mayor o igual a cero');
    }

    // Requirement 4.3: Validate costo >= 0
    if (data.costo < 0) {
      throw new Error('El costo debe ser mayor o igual a cero');
    }

    // Requirement 4.4: Validate stock >= 0
    const stock = data.stock !== undefined ? data.stock : 0;
    if (stock < 0) {
      throw new Error('El stock debe ser mayor o igual a cero');
    }

    // Requirement 4.5: Validate categoria is in allowed list
    const allowedCategorias = ['Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros'];
    if (!allowedCategorias.includes(data.categoria)) {
      throw new Error(`La categoría debe ser una de: ${allowedCategorias.join(', ')}`);
    }

    const result = await query(
      `INSERT INTO productos (nombre, descripcion, categoria, precio, costo, stock, activo, imagen_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        data.nombre.trim(),
        data.descripcion || null,
        data.categoria,
        data.precio,
        data.costo,
        stock,
        data.activo !== undefined ? data.activo : true,
        data.imagen_url || null
      ]
    );
    return result.rows[0];
  }

  /**
   * Update product
   * Requirement 4.6: Preserve created_at timestamp
   * Requirement 4.7: Update updated_at timestamp
   * Requirement 4.11: Use parameterized queries
   */
  async update(id, data) {
    // Validate if data contains validation fields
    if (data.nombre !== undefined && (!data.nombre || data.nombre.trim() === '')) {
      throw new Error('El nombre del producto no puede estar vacío');
    }

    if (data.precio !== undefined && data.precio < 0) {
      throw new Error('El precio debe ser mayor o igual a cero');
    }

    if (data.costo !== undefined && data.costo < 0) {
      throw new Error('El costo debe ser mayor o igual a cero');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock debe ser mayor o igual a cero');
    }

    if (data.categoria !== undefined) {
      const allowedCategorias = ['Ramos', 'Arreglos', 'Peluches', 'Cajas sorpresa', 'Globos', 'Otros'];
      if (!allowedCategorias.includes(data.categoria)) {
        throw new Error(`La categoría debe ser una de: ${allowedCategorias.join(', ')}`);
      }
    }

    // Requirement 4.6: Preserve created_at, Requirement 4.7: Update updated_at
    const result = await query(
      `UPDATE productos 
       SET nombre = $1, descripcion = $2, categoria = $3, precio = $4, 
           costo = $5, stock = $6, activo = $7, imagen_url = $8, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [
        data.nombre ? data.nombre.trim() : data.nombre,
        data.descripcion !== undefined ? data.descripcion : null,
        data.categoria,
        data.precio,
        data.costo,
        data.stock,
        data.activo !== undefined ? data.activo : true,
        data.imagen_url !== undefined ? data.imagen_url : null,
        id
      ]
    );
    return result.rows[0];
  }

  /**
   * Delete product (soft delete)
   * Requirement 4.8: Set activo = false instead of removing record
   * Requirement 4.11: Use parameterized queries
   */
  async delete(id) {
    const result = await query(
      'UPDATE productos SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update stock
   */
  async updateStock(id, cantidad) {
    const result = await query(
      'UPDATE productos SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [cantidad, id]
    );
    return result.rows[0];
  }

  /**
   * Deduct stock (for sales)
   */
  async deductStock(id, cantidad) {
    const result = await query(
      'UPDATE productos SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1 RETURNING *',
      [cantidad, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Stock insuficiente');
    }
    
    return result.rows[0];
  }
}

module.exports = new ProductosService();
