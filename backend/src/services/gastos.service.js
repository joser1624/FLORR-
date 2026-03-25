const { query } = require('../config/database');

const ALLOWED_CATEGORIAS = ['flores', 'transporte', 'materiales', 'mantenimiento', 'merma', 'otros'];

class GastosService {
  /**
   * Get all gastos with optional filtering and pagination
   * Requirement 10.5: Filter by mes, 10.6: Filter by categoria
   * Requirement 21.6: Pagination with default page size 50
   */
  async getAll(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM gastos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.mes) {
      baseQuery += ` AND TO_CHAR(fecha, 'YYYY-MM') = $${paramCount}`;
      params.push(filters.mes);
      paramCount++;
    }
    if (filters.categoria) {
      baseQuery += ` AND categoria = $${paramCount}`;
      params.push(filters.categoria);
      paramCount++;
    }

    const countResult = await query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].total);

    const queryText = `SELECT * ${baseQuery} ORDER BY fecha DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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
    const result = await query('SELECT * FROM gastos WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(data) {
    const errors = [];

    if (!data.descripcion || data.descripcion.trim() === '') {
      errors.push('La descripción no puede estar vacía');
    }
    if (!data.categoria || !ALLOWED_CATEGORIAS.includes(data.categoria)) {
      errors.push(`La categoría debe ser una de: ${ALLOWED_CATEGORIAS.join(', ')}`);
    }
    if (data.monto === undefined || data.monto === null || data.monto < 0) {
      errors.push('El monto debe ser mayor o igual a cero');
    }
    if (!data.fecha || data.fecha.toString().trim() === '') {
      errors.push('La fecha no puede estar vacía');
    }

    // Validar datos de inventario si se proporcionan
    if (data.inventario_id && data.cantidad) {
      if (data.cantidad <= 0) {
        errors.push('La cantidad debe ser mayor a cero');
      }
    }

    if (errors.length > 0) {
      const error = new Error('Errores de validación');
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    let itemNombre = null;
    let itemUnidad = null;

    // Si se proporciona inventario_id y cantidad, actualizar el stock SOLO si NO es merma
    if (data.inventario_id && data.cantidad && data.categoria !== 'merma') {
      // Verificar que el ítem existe
      const itemResult = await query(
        'SELECT id, nombre, stock, unidad FROM inventario WHERE id = $1',
        [data.inventario_id]
      );

      if (itemResult.rows.length === 0) {
        const error = new Error('El ítem de inventario no existe');
        error.statusCode = 404;
        throw error;
      }

      itemNombre = itemResult.rows[0].nombre;
      itemUnidad = itemResult.rows[0].unidad;

      // Actualizar el stock del inventario (SUMAR para compras)
      await query(
        'UPDATE inventario SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [data.cantidad, data.inventario_id]
      );

      console.log(`✅ Stock actualizado: ${itemNombre} +${data.cantidad} ${itemUnidad}`);
    }

    // Si es merma, solo obtener el nombre del ítem para el historial (sin actualizar stock)
    if (data.categoria === 'merma') {
      if (data.inventario_id) {
        const itemResult = await query(
          'SELECT nombre, unidad FROM inventario WHERE id = $1',
          [data.inventario_id]
        );
        if (itemResult.rows.length > 0) {
          itemNombre = itemResult.rows[0].nombre;
          itemUnidad = itemResult.rows[0].unidad;
        }
      } else if (data.producto_id) {
        const prodResult = await query(
          'SELECT nombre FROM productos WHERE id = $1',
          [data.producto_id]
        );
        if (prodResult.rows.length > 0) {
          itemNombre = prodResult.rows[0].nombre;
          itemUnidad = 'unidad';
        }
      }
    }

    // Crear el gasto con los campos adicionales
    const result = await query(
      `INSERT INTO gastos (descripcion, categoria, monto, fecha, inventario_id, producto_id, cantidad, item_nombre, item_unidad) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        data.descripcion.trim(), 
        data.categoria, 
        data.monto, 
        data.fecha,
        data.inventario_id || null,
        data.producto_id || null,
        data.cantidad || null,
        itemNombre,
        itemUnidad
      ]
    );
    
    return result.rows[0];
  }

  async update(id, data) {
    const result = await query(
      `UPDATE gastos SET descripcion = $1, categoria = $2, monto = $3, fecha = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [data.descripcion, data.categoria, data.monto, data.fecha, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await query('DELETE FROM gastos WHERE id = $1', [id]);
  }
}

module.exports = new GastosService();
