const { query } = require('../config/database');

class PedidosService {
  /**
   * Get all pedidos with filtering and pagination
   * Requirement 21.6: Pagination with default page size 50
   */
  async getAll(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM pedidos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.estado) {
      baseQuery += ` AND estado = $${paramCount}`;
      params.push(filters.estado);
      paramCount++;
    }
    if (filters.cliente_telefono) {
      baseQuery += ` AND cliente_telefono = $${paramCount}`;
      params.push(filters.cliente_telefono);
      paramCount++;
    }
    if (filters.fecha_entrega) {
      baseQuery += ` AND DATE(fecha_entrega) = $${paramCount}`;
      params.push(filters.fecha_entrega);
      paramCount++;
    }

    let orderClause;
    if (filters.estado && (filters.estado === 'pendiente' || filters.estado === 'en preparación')) {
      orderClause = 'ORDER BY fecha_entrega ASC';
    } else if (!filters.estado) {
      orderClause = `ORDER BY 
        CASE WHEN estado IN ('pendiente', 'en preparación') THEN 0 ELSE 1 END,
        CASE WHEN estado IN ('pendiente', 'en preparación') THEN fecha_entrega ELSE NULL END ASC,
        created_at DESC`;
    } else {
      orderClause = 'ORDER BY created_at DESC';
    }

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
      'SELECT * FROM pedidos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(data) {
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
        new Date(),
        data.fecha_entrega,
        data.descripcion,
        data.total || 0,
        data.metodo_pago || null,
        'pendiente',
        data.trabajador_id || null
      ]
    );
    return result.rows[0];
  }

  async update(id, data) {
    if (data.estado) {
      const validEstados = ['pendiente', 'en preparación', 'listo para entrega', 'entregado', 'cancelado'];
      if (!validEstados.includes(data.estado)) {
        throw new Error(`estado debe ser uno de: ${validEstados.join(', ')}`);
      }
    }

    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (data.cliente_id !== undefined) { updateFields.push(`cliente_id = $${paramCount++}`); params.push(data.cliente_id); }
    if (data.cliente_nombre !== undefined) { updateFields.push(`cliente_nombre = $${paramCount++}`); params.push(data.cliente_nombre); }
    if (data.cliente_telefono !== undefined) { updateFields.push(`cliente_telefono = $${paramCount++}`); params.push(data.cliente_telefono); }
    if (data.direccion !== undefined) { updateFields.push(`direccion = $${paramCount++}`); params.push(data.direccion); }
    if (data.fecha_entrega !== undefined) { updateFields.push(`fecha_entrega = $${paramCount++}`); params.push(data.fecha_entrega); }
    if (data.descripcion !== undefined) { updateFields.push(`descripcion = $${paramCount++}`); params.push(data.descripcion); }
    if (data.total !== undefined) { updateFields.push(`total = $${paramCount++}`); params.push(data.total); }
    if (data.metodo_pago !== undefined) { updateFields.push(`metodo_pago = $${paramCount++}`); params.push(data.metodo_pago); }
    if (data.estado !== undefined) { updateFields.push(`estado = $${paramCount++}`); params.push(data.estado); }
    if (data.trabajador_id !== undefined) { updateFields.push(`trabajador_id = $${paramCount++}`); params.push(data.trabajador_id); }

    if (updateFields.length === 0) {
      return await this.getById(id);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await query(
      `UPDATE pedidos SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  async delete(id) {
    await query('DELETE FROM pedidos WHERE id = $1', [id]);
  }
}

module.exports = new PedidosService();
