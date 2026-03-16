const { query, getClient } = require('../config/database');

class InventarioService {
  /**
   * Get all inventory items with optional filtering
   * @param {Object} filters - Optional filters (tipo, stock_bajo)
   * @returns {Promise<Array>} Array of inventory items
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM inventario WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by tipo (flores, materiales, accesorios)
    if (filters.tipo) {
      queryText += ` AND tipo = $${paramCount}`;
      params.push(filters.tipo);
      paramCount++;
    }

    // Filter by stock_bajo (stock <= stock_min)
    if (filters.stock_bajo === true || filters.stock_bajo === 'true') {
      queryText += ' AND stock <= stock_min';
    }

    // Order low stock items by stock ascending, otherwise by created_at DESC
    if (filters.stock_bajo === true || filters.stock_bajo === 'true') {
      queryText += ' ORDER BY stock ASC';
    } else {
      queryText += ' ORDER BY created_at DESC';
    }

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get inventory item by ID
   * @param {number} id - Inventory item ID
   * @returns {Promise<Object|undefined>} Inventory item or undefined
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM inventario WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create new inventory item with validation
   * @param {Object} data - Inventory item data
   * @returns {Promise<Object>} Created inventory item
   * @throws {Error} Validation errors
   */
  async create(data) {
    // Validation: nombre not empty
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre es requerido');
    }

    // Validation: tipo in allowed list
    const allowedTipos = ['flores', 'materiales', 'accesorios'];
    if (!data.tipo || !allowedTipos.includes(data.tipo)) {
      throw new Error('El tipo debe ser: flores, materiales o accesorios');
    }

    // Validation: stock >= 0
    if (data.stock === undefined || data.stock === null || data.stock < 0) {
      throw new Error('El stock debe ser mayor o igual a 0');
    }

    // Validation: costo >= 0
    if (data.costo === undefined || data.costo === null || data.costo < 0) {
      throw new Error('El costo debe ser mayor o igual a 0');
    }

    // Use parameterized query
    const result = await query(
      `INSERT INTO inventario (nombre, tipo, stock, stock_min, unidad, costo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        data.nombre,
        data.tipo,
        data.stock,
        data.stock_min || 5, // Default stock_min
        data.unidad || 'unidad', // Default unidad
        data.costo
      ]
    );
    return result.rows[0];
  }

  /**
   * Update inventory item with validation
   * @param {number} id - Inventory item ID
   * @param {Object} data - Updated inventory item data
   * @returns {Promise<Object|undefined>} Updated inventory item or undefined
   * @throws {Error} Validation errors
   */
  async update(id, data) {
    // Validation: nombre not empty (if provided)
    if (data.nombre !== undefined && data.nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }

    // Validation: tipo in allowed list (if provided)
    if (data.tipo !== undefined) {
      const allowedTipos = ['flores', 'materiales', 'accesorios'];
      if (!allowedTipos.includes(data.tipo)) {
        throw new Error('El tipo debe ser: flores, materiales o accesorios');
      }
    }

    // Validation: stock >= 0 (if provided)
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock debe ser mayor o igual a 0');
    }

    // Validation: costo >= 0 (if provided)
    if (data.costo !== undefined && data.costo < 0) {
      throw new Error('El costo debe ser mayor o igual a 0');
    }

    // Build dynamic update query with only provided fields
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nombre !== undefined) {
      fields.push(`nombre = $${paramCount}`);
      values.push(data.nombre);
      paramCount++;
    }
    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramCount}`);
      values.push(data.tipo);
      paramCount++;
    }
    if (data.stock !== undefined) {
      fields.push(`stock = $${paramCount}`);
      values.push(data.stock);
      paramCount++;
    }
    if (data.stock_min !== undefined) {
      fields.push(`stock_min = $${paramCount}`);
      values.push(data.stock_min);
      paramCount++;
    }
    if (data.unidad !== undefined) {
      fields.push(`unidad = $${paramCount}`);
      values.push(data.unidad);
      paramCount++;
    }
    if (data.costo !== undefined) {
      fields.push(`costo = $${paramCount}`);
      values.push(data.costo);
      paramCount++;
    }

    // If no fields to update, return current item
    if (fields.length === 0) {
      return this.getById(id);
    }

    // Add ID parameter
    values.push(id);

    // Execute update query (updated_at is automatically updated by trigger)
    const result = await query(
      `UPDATE inventario SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete inventory item
   * @param {number} id - Inventory item ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await query('DELETE FROM inventario WHERE id = $1', [id]);
  }
}

module.exports = new InventarioService();
