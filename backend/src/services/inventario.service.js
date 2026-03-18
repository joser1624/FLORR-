const { query } = require('../config/database');

class InventarioService {
  /**
   * Get all inventory items with optional filtering and pagination
   * Requirement 21.6: Pagination with default page size 50
   */
  async getAll(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM inventario WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.tipo) {
      baseQuery += ` AND tipo = $${paramCount}`;
      params.push(filters.tipo);
      paramCount++;
    }

    if (filters.stock_bajo === true || filters.stock_bajo === 'true') {
      baseQuery += ' AND stock <= stock_min';
    }

    const orderClause = (filters.stock_bajo === true || filters.stock_bajo === 'true')
      ? 'ORDER BY stock ASC'
      : 'ORDER BY created_at DESC';

    const countResult = await query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].total);

    const queryText = `SELECT * ${baseQuery} ${orderClause} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return {
      data: result.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  async getById(id) {
    const result = await query(
      'SELECT * FROM inventario WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(data) {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre es requerido');
    }
    const allowedTipos = ['flores', 'materiales', 'accesorios'];
    if (!data.tipo || !allowedTipos.includes(data.tipo)) {
      throw new Error('El tipo debe ser: flores, materiales o accesorios');
    }
    if (data.stock === undefined || data.stock === null || data.stock < 0) {
      throw new Error('El stock debe ser mayor o igual a 0');
    }
    if (data.costo === undefined || data.costo === null || data.costo < 0) {
      throw new Error('El costo debe ser mayor o igual a 0');
    }

    const result = await query(
      `INSERT INTO inventario (nombre, tipo, stock, stock_min, unidad, costo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        data.nombre,
        data.tipo,
        data.stock,
        data.stock_min || 5,
        data.unidad || 'unidad',
        data.costo
      ]
    );
    return result.rows[0];
  }

  async update(id, data) {
    if (data.nombre !== undefined && data.nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }
    if (data.tipo !== undefined) {
      const allowedTipos = ['flores', 'materiales', 'accesorios'];
      if (!allowedTipos.includes(data.tipo)) {
        throw new Error('El tipo debe ser: flores, materiales o accesorios');
      }
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock debe ser mayor o igual a 0');
    }
    if (data.costo !== undefined && data.costo < 0) {
      throw new Error('El costo debe ser mayor o igual a 0');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nombre !== undefined) { fields.push(`nombre = $${paramCount++}`); values.push(data.nombre); }
    if (data.tipo !== undefined) { fields.push(`tipo = $${paramCount++}`); values.push(data.tipo); }
    if (data.stock !== undefined) { fields.push(`stock = $${paramCount++}`); values.push(data.stock); }
    if (data.stock_min !== undefined) { fields.push(`stock_min = $${paramCount++}`); values.push(data.stock_min); }
    if (data.unidad !== undefined) { fields.push(`unidad = $${paramCount++}`); values.push(data.unidad); }
    if (data.costo !== undefined) { fields.push(`costo = $${paramCount++}`); values.push(data.costo); }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE inventario SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    try {
      // Verificar si el ítem está siendo usado en arreglos
      const checkUsage = await query(
        'SELECT COUNT(*) as count FROM arreglos_inventario WHERE inventario_id = $1',
        [id]
      );
      
      const usageCount = parseInt(checkUsage.rows[0].count);
      
      if (usageCount > 0) {
        throw new Error(`No se puede eliminar este ítem porque está siendo usado en ${usageCount} arreglo(s) floral(es). Primero debes eliminar o modificar esos arreglos.`);
      }
      
      const result = await query('DELETE FROM inventario WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Item no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      // Si es un error de restricción de clave foránea, dar un mensaje más claro
      if (error.code === '23503') {
        throw new Error('No se puede eliminar este ítem porque está siendo usado en otros registros del sistema.');
      }
      throw error;
    }
  }
}

module.exports = new InventarioService();
