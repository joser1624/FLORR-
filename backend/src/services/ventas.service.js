const { query, getClient } = require('../config/database');

class VentasService {
  /**
   * Get all ventas with optional filters and pagination
   * Requirements: 6.11, 6.12, 6.13, 6.14, 21.6
   */
  async getAll(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    let baseQuery = `FROM ventas v
      LEFT JOIN usuarios u ON v.trabajador_id = u.id
      WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (filters.fecha) {
      baseQuery += ' AND DATE(v.fecha) = $' + paramCount;
      params.push(filters.fecha);
      paramCount++;
    }
    if (filters.metodo_pago) {
      baseQuery += ' AND v.metodo_pago = $' + paramCount;
      params.push(filters.metodo_pago);
      paramCount++;
    }
    if (filters.trabajador_id) {
      baseQuery += ' AND v.trabajador_id = $' + paramCount;
      params.push(filters.trabajador_id);
      paramCount++;
    }

    const countResult = await query('SELECT COUNT(*) as total ' + baseQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const queryText = `SELECT v.*, u.nombre AS trabajador_nombre ` + baseQuery +
      ' ORDER BY v.created_at DESC LIMIT $' + paramCount + ' OFFSET $' + (paramCount + 1);
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

  /**
   * Get venta by ID with productos details
   */
  async getById(id) {
    const ventaResult = await query(
      'SELECT * FROM ventas WHERE id = $1',
      [id]
    );
    if (ventaResult.rows.length === 0) {
      return null;
    }
    const venta = ventaResult.rows[0];

    const productosResult = await query(
      `SELECT vp.*, p.nombre as producto_nombre
       FROM ventas_productos vp
       JOIN productos p ON vp.producto_id = p.id
       WHERE vp.venta_id = $1`,
      [id]
    );
    venta.productos = productosResult.rows;
    return venta;
  }

  /**
   * Create venta with transaction support
   * New: Valida que haya caja abierta antes de crear venta
   */
  async create(data, trabajadorId) {
    const { productos, metodo_pago, cliente_id } = data;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new Error('El array de productos no puede estar vacío');
    }

    const metodosPermitidos = ['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia bancaria'];
    if (!metodo_pago || !metodosPermitidos.includes(metodo_pago)) {
      throw new Error(`Método de pago inválido. Debe ser uno de: ${metodosPermitidos.join(', ')}`);
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // VALIDACIÓN CRÍTICA: Verificar que hay caja abierta para hoy
      const cajaResult = await client.query(
        "SELECT id FROM caja WHERE fecha = CURRENT_DATE AND estado = 'abierta'",
        []
      );

      if (cajaResult.rows.length === 0) {
        const error = new Error('Debe abrir la caja del día antes de realizar ventas');
        error.statusCode = 400;
        throw error;
      }

      for (const item of productos) {
        const { producto_id, cantidad, precio_unitario } = item;
        if (!producto_id || !cantidad || cantidad <= 0) {
          throw new Error('Cada producto debe tener producto_id y cantidad válidos');
        }
        if (precio_unitario === undefined || precio_unitario < 0) {
          throw new Error('El precio_unitario debe ser mayor o igual a 0');
        }
        const productResult = await client.query(
          'SELECT id, nombre, stock FROM productos WHERE id = $1',
          [producto_id]
        );
        if (productResult.rows.length === 0) {
          throw new Error(`Producto con ID ${producto_id} no encontrado`);
        }
        const product = productResult.rows[0];
        if (product.stock < cantidad) {
          throw new Error(`Stock insuficiente para el producto "${product.nombre}". Stock disponible: ${product.stock}, solicitado: ${cantidad}`);
        }
      }

      let total = 0;
      for (const item of productos) {
        total += item.cantidad * item.precio_unitario;
      }

      const ventaResult = await client.query(
        `INSERT INTO ventas (total, metodo_pago, trabajador_id, cliente_id, fecha)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [total, metodo_pago, trabajadorId, cliente_id || null]
      );
      const venta = ventaResult.rows[0];

      for (const item of productos) {
        const { producto_id, cantidad, precio_unitario } = item;
        const subtotal = cantidad * precio_unitario;
        await client.query(
          `INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [venta.id, producto_id, cantidad, precio_unitario, subtotal]
        );
        await client.query(
          'UPDATE productos SET stock = stock - $1 WHERE id = $2',
          [cantidad, producto_id]
        );
      }

      if (cliente_id) {
        await client.query(
          'UPDATE clientes SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [cliente_id]
        );
      }

      await client.query('COMMIT');
      return venta;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, data) {
    const fields = ['fecha', 'total', 'metodo_pago', 'trabajador_id', 'cliente_id'];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    const result = await query(
      `UPDATE ventas SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    await query('DELETE FROM ventas WHERE id = $1', [id]);
  }
}

module.exports = new VentasService();
