const { query, getClient } = require('../config/database');

class VentasService {
  /**
   * Get all ventas with optional filters
   * Task 7.2: Implements sales query service
   * Requirements: 6.11 (filter by fecha), 6.12 (filter by metodo_pago), 
   *               6.13 (filter by trabajador_id), 6.14 (parameterized queries)
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM ventas WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by fecha
    if (filters.fecha) {
      queryText += ` AND DATE(fecha) = $${paramCount}`;
      params.push(filters.fecha);
      paramCount++;
    }

    // Filter by metodo_pago
    if (filters.metodo_pago) {
      queryText += ` AND metodo_pago = $${paramCount}`;
      params.push(filters.metodo_pago);
      paramCount++;
    }

    // Filter by trabajador_id
    if (filters.trabajador_id) {
      queryText += ` AND trabajador_id = $${paramCount}`;
      params.push(filters.trabajador_id);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get venta by ID with productos details
   * Task 7.2: Returns venta with ventas_productos details including product names
   * Requirements: 6.14 (parameterized queries)
   */
  async getById(id) {
    // Get venta
    const ventaResult = await query(
      'SELECT * FROM ventas WHERE id = $1',
      [id]
    );

    if (ventaResult.rows.length === 0) {
      return null;
    }

    const venta = ventaResult.rows[0];

    // Get ventas_productos with product details
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
   * Validates inputs, checks stock, creates records, deducts stock
   */
  async create(data, trabajadorId) {
    const { productos, metodo_pago, cliente_id } = data;

    // Validation: productos array not empty
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new Error('El array de productos no puede estar vacío');
    }

    // Validation: metodo_pago in allowed list
    const metodosPermitidos = ['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia bancaria'];
    if (!metodo_pago || !metodosPermitidos.includes(metodo_pago)) {
      throw new Error(`Método de pago inválido. Debe ser uno de: ${metodosPermitidos.join(', ')}`);
    }

    // Get database client for transaction
    const client = await getClient();

    try {
      // BEGIN TRANSACTION
      await client.query('BEGIN');

      // Step 1: Validate all products exist and have sufficient stock
      for (const item of productos) {
        const { producto_id, cantidad, precio_unitario } = item;

        // Validate required fields
        if (!producto_id || !cantidad || cantidad <= 0) {
          throw new Error('Cada producto debe tener producto_id y cantidad válidos');
        }

        if (precio_unitario === undefined || precio_unitario < 0) {
          throw new Error('El precio_unitario debe ser mayor o igual a 0');
        }

        // Check product exists and has sufficient stock
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

      // Step 2: Calculate total
      let total = 0;
      for (const item of productos) {
        const subtotal = item.cantidad * item.precio_unitario;
        total += subtotal;
      }

      // Step 3: Create ventas record
      const ventaResult = await client.query(
        `INSERT INTO ventas (total, metodo_pago, trabajador_id, cliente_id, fecha)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [total, metodo_pago, trabajadorId, cliente_id || null]
      );

      const venta = ventaResult.rows[0];

      // Step 4: Create ventas_productos records and deduct stock
      for (const item of productos) {
        const { producto_id, cantidad, precio_unitario } = item;
        const subtotal = cantidad * precio_unitario;

        // Insert ventas_productos record
        await client.query(
          `INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [venta.id, producto_id, cantidad, precio_unitario, subtotal]
        );

        // Deduct stock from productos
        await client.query(
          'UPDATE productos SET stock = stock - $1 WHERE id = $2',
          [cantidad, producto_id]
        );
      }

      // Step 5: Update cliente ultima_compra if cliente_id provided
      if (cliente_id) {
        await client.query(
          'UPDATE clientes SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [cliente_id]
        );
      }

      // COMMIT TRANSACTION
      await client.query('COMMIT');

      return venta;

    } catch (error) {
      // ROLLBACK TRANSACTION on any error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  }

  /**
   * Update venta (limited fields)
   */
  async update(id, data) {
    const fields = ["fecha","total","metodo_pago","trabajador_id","cliente_id"];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      `UPDATE ventas SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete venta
   */
  async delete(id) {
    await query('DELETE FROM ventas WHERE id = $1', [id]);
  }
}

module.exports = new VentasService();
