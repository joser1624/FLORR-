const { query, getClient } = require('../config/database');

class ArreglosService {
  /**
   * Get all arreglos including recipe items with inventario details
   * Requirements: 13.8, 13.9
   */
  async getAll() {
    const result = await query(
      `SELECT 
         a.id, a.nombre, a.margen, 
         a.costo_total::float AS costo_total, 
         a.precio_venta::float AS precio_venta,
         a.created_at, a.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', ai.id,
               'inventario_id', ai.inventario_id,
               'cantidad', ai.cantidad,
               'nombre', i.nombre,
               'tipo', i.tipo,
               'unidad', i.unidad,
               'costo', i.costo::float
             )
           ) FILTER (WHERE ai.id IS NOT NULL),
           '[]'
         ) AS items
       FROM arreglos a
       LEFT JOIN arreglos_inventario ai ON a.id = ai.arreglo_id
       LEFT JOIN inventario i ON ai.inventario_id = i.id
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get arreglo by ID with full recipe details
   * Requirements: 13.8, 13.9
   */
  async getById(id) {
    const result = await query(
      `SELECT 
         a.id, a.nombre, a.margen,
         a.costo_total::float AS costo_total,
         a.precio_venta::float AS precio_venta,
         a.created_at, a.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', ai.id,
               'inventario_id', ai.inventario_id,
               'cantidad', ai.cantidad,
               'nombre', i.nombre,
               'tipo', i.tipo,
               'unidad', i.unidad,
               'costo', i.costo::float
             )
           ) FILTER (WHERE ai.id IS NOT NULL),
           '[]'
         ) AS items
       FROM arreglos a
       LEFT JOIN arreglos_inventario ai ON a.id = ai.arreglo_id
       LEFT JOIN inventario i ON ai.inventario_id = i.id
       WHERE a.id = $1
       GROUP BY a.id`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create arreglo with transaction support
   * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 24.1
   */
  async create(data) {
    const { nombre, margen, items = [] } = data;

    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }

    const margenNum = Number(margen);
    if (isNaN(margenNum) || margenNum < 0 || margenNum > 100) {
      throw new Error('El margen debe estar entre 0 y 100');
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      let costo_total = 0;

      for (const item of items) {
        if (!item.inventario_id || !item.cantidad || item.cantidad <= 0) {
          throw new Error('Cada item debe tener inventario_id y cantidad válidos');
        }

        const invResult = await client.query(
          'SELECT id, costo FROM inventario WHERE id = $1',
          [item.inventario_id]
        );

        if (invResult.rows.length === 0) {
          throw new Error(`Inventario con ID ${item.inventario_id} no encontrado`);
        }

        costo_total += parseFloat(invResult.rows[0].costo) * item.cantidad;
      }

      const precio_venta = costo_total * (1 + margenNum / 100);

      const arregloResult = await client.query(
        `INSERT INTO arreglos (nombre, margen, costo_total, precio_venta)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nombre.trim(), margenNum, costo_total, precio_venta]
      );

      const arreglo = arregloResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO arreglos_inventario (arreglo_id, inventario_id, cantidad)
           VALUES ($1, $2, $3)`,
          [arreglo.id, item.inventario_id, item.cantidad]
        );
      }

      await client.query('COMMIT');

      return await this.getById(arreglo.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update arreglo recalculating costo_total and precio_venta
   * Requirements: 13.6, 13.9
   */
  async update(id, data) {
    const { nombre, margen, items } = data;

    if (nombre !== undefined && nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }

    if (margen !== undefined) {
      const margenNum = Number(margen);
      if (isNaN(margenNum) || margenNum < 0 || margenNum > 100) {
        throw new Error('El margen debe estar entre 0 y 100');
      }
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const currentResult = await client.query(
        'SELECT * FROM arreglos WHERE id = $1',
        [id]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Arreglo no encontrado');
      }

      const current = currentResult.rows[0];
      const newNombre = nombre !== undefined ? nombre.trim() : current.nombre;
      const newMargen = margen !== undefined ? Number(margen) : parseFloat(current.margen);

      let costo_total = parseFloat(current.costo_total);

      if (items !== undefined) {
        costo_total = 0;

        for (const item of items) {
          if (!item.inventario_id || !item.cantidad || item.cantidad <= 0) {
            throw new Error('Cada item debe tener inventario_id y cantidad válidos');
          }

          const invResult = await client.query(
            'SELECT id, costo FROM inventario WHERE id = $1',
            [item.inventario_id]
          );

          if (invResult.rows.length === 0) {
            throw new Error(`Inventario con ID ${item.inventario_id} no encontrado`);
          }

          costo_total += parseFloat(invResult.rows[0].costo) * item.cantidad;
        }

        await client.query(
          'DELETE FROM arreglos_inventario WHERE arreglo_id = $1',
          [id]
        );

        for (const item of items) {
          await client.query(
            `INSERT INTO arreglos_inventario (arreglo_id, inventario_id, cantidad)
             VALUES ($1, $2, $3)`,
            [id, item.inventario_id, item.cantidad]
          );
        }
      }

      const precio_venta = costo_total * (1 + newMargen / 100);

      await client.query(
        `UPDATE arreglos 
         SET nombre = $1, margen = $2, costo_total = $3, precio_venta = $4, updated_at = NOW()
         WHERE id = $5`,
        [newNombre, newMargen, costo_total, precio_venta, id]
      );

      await client.query('COMMIT');

      return await this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete arreglo - CASCADE handles arreglos_inventario
   * Requirements: 13.7, 13.9, 24.8
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM arreglos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Arreglo no encontrado');
    }
  }
}

module.exports = new ArreglosService();
