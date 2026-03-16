const { query, getClient } = require('../config/database');

class PedidosService {
  /**
   * Get all pedidos with filtering by estado, cliente_telefono, fecha_entrega
   * Orders pending orders by fecha_entrega ascending
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM pedidos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by estado
    if (filters.estado) {
      queryText += ` AND estado = $${paramCount}`;
      params.push(filters.estado);
      paramCount++;
    }

    // Filter by cliente_telefono
    if (filters.cliente_telefono) {
      queryText += ` AND cliente_telefono = $${paramCount}`;
      params.push(filters.cliente_telefono);
      paramCount++;
    }

    // Filter by fecha_entrega
    if (filters.fecha_entrega) {
      queryText += ` AND fecha_entrega = $${paramCount}`;
      params.push(filters.fecha_entrega);
      paramCount++;
    }

    // Order pending orders by fecha_entrega ascending, others by created_at DESC
    if (filters.estado && (filters.estado === 'pendiente' || filters.estado === 'en preparación')) {
      queryText += ' ORDER BY fecha_entrega ASC';
    } else if (!filters.estado) {
      // If no estado filter, order pending/in-preparation first by fecha_entrega, then others
      queryText += ` ORDER BY 
        CASE 
          WHEN estado IN ('pendiente', 'en preparación') THEN 0 
          ELSE 1 
        END,
        CASE 
          WHEN estado IN ('pendiente', 'en preparación') THEN fecha_entrega 
          ELSE NULL 
        END ASC,
        created_at DESC`;
    } else {
      queryText += ' ORDER BY created_at DESC';
    }

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
   * Create pedido with validation
   * Validates: cliente_nombre, cliente_telefono, fecha_entrega, descripcion not empty
   * Sets estado to "pendiente" and fecha_pedido to current timestamp
   */
  async create(data) {
    // Validation
    if (!data.cliente_nombre || data.cliente_nombre.trim() === '') {
      throw new Error('cliente_nombre no puede estar vacío');
    }
    if (!data.cliente_telefono || data.cliente_telefono.trim() === '') {
      throw new Error('cliente_telefono no puede estar vacío');
    }
    if (!data.fecha_entrega) {
      throw new Error('fecha_entrega no puede estar vacía');
    }
    if (!data.descripcion || data.descripcion.trim() === '') {
      throw new Error('descripcion no puede estar vacía');
    }

    // Set default values
    const estado = 'pendiente';
    const fecha_pedido = new Date();

    const result = await query(
      `INSERT INTO pedidos (
        cliente_id, cliente_nombre, cliente_telefono, direccion, 
        fecha_pedido, fecha_entrega, descripcion, total, 
        metodo_pago, estado, trabajador_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        data.cliente_id || null,
        data.cliente_nombre,
        data.cliente_telefono,
        data.direccion || null,
        fecha_pedido,
        data.fecha_entrega,
        data.descripcion,
        data.total || 0,
        data.metodo_pago || null,
        estado,
        data.trabajador_id || null
      ]
    );
    return result.rows[0];
  }

  /**
   * Update pedido with estado validation
   * Validates estado is one of: pendiente, en preparación, listo para entrega, entregado, cancelado
   * Updates updated_at timestamp automatically via database trigger
   */
  async update(id, data) {
    // Validate estado if provided
    if (data.estado) {
      const validEstados = ['pendiente', 'en preparación', 'listo para entrega', 'entregado', 'cancelado'];
      if (!validEstados.includes(data.estado)) {
        throw new Error(`estado debe ser uno de: ${validEstados.join(', ')}`);
      }
    }

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (data.cliente_id !== undefined) {
      updateFields.push(`cliente_id = $${paramCount}`);
      params.push(data.cliente_id);
      paramCount++;
    }
    if (data.cliente_nombre !== undefined) {
      updateFields.push(`cliente_nombre = $${paramCount}`);
      params.push(data.cliente_nombre);
      paramCount++;
    }
    if (data.cliente_telefono !== undefined) {
      updateFields.push(`cliente_telefono = $${paramCount}`);
      params.push(data.cliente_telefono);
      paramCount++;
    }
    if (data.direccion !== undefined) {
      updateFields.push(`direccion = $${paramCount}`);
      params.push(data.direccion);
      paramCount++;
    }
    if (data.fecha_entrega !== undefined) {
      updateFields.push(`fecha_entrega = $${paramCount}`);
      params.push(data.fecha_entrega);
      paramCount++;
    }
    if (data.descripcion !== undefined) {
      updateFields.push(`descripcion = $${paramCount}`);
      params.push(data.descripcion);
      paramCount++;
    }
    if (data.total !== undefined) {
      updateFields.push(`total = $${paramCount}`);
      params.push(data.total);
      paramCount++;
    }
    if (data.metodo_pago !== undefined) {
      updateFields.push(`metodo_pago = $${paramCount}`);
      params.push(data.metodo_pago);
      paramCount++;
    }
    if (data.estado !== undefined) {
      updateFields.push(`estado = $${paramCount}`);
      params.push(data.estado);
      paramCount++;
    }
    if (data.trabajador_id !== undefined) {
      updateFields.push(`trabajador_id = $${paramCount}`);
      params.push(data.trabajador_id);
      paramCount++;
    }

    // If no fields to update, just return the existing record
    if (updateFields.length === 0) {
      return await this.getById(id);
    }

    // Always update updated_at (database trigger handles this, but we can be explicit)
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const result = await query(
      `UPDATE pedidos SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
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
