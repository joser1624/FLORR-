const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const ALLOWED_ROLES = ['admin', 'empleado', 'duena'];

class TrabajadoresService {
  async getAll(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) as total FROM usuarios', []);
    const total = parseInt(countResult.rows[0].total);

    const result = await query(
      'SELECT id, nombre, email, telefono, cargo, rol, activo, fecha_ingreso, created_at, updated_at FROM usuarios ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return { data: result.rows, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getById(id) {
    const result = await query(
      'SELECT id, nombre, email, telefono, cargo, rol, activo, fecha_ingreso, created_at, updated_at FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(data) {
    if (!data.nombre || data.nombre.trim() === '') throw new Error('El nombre es requerido');
    if (!data.email || data.email.trim() === '') throw new Error('El email es requerido');

    const emailCheck = await query('SELECT id FROM usuarios WHERE email = $1', [data.email]);
    if (emailCheck.rows.length > 0) throw new Error('El email ya está registrado');

    if (!data.password || data.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    if (!data.rol || !ALLOWED_ROLES.includes(data.rol)) throw new Error('El rol debe ser uno de: admin, empleado, duena');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await query(
      'INSERT INTO usuarios (nombre, email, password, telefono, cargo, rol, activo, fecha_ingreso) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, nombre, email, telefono, cargo, rol, activo, fecha_ingreso, created_at, updated_at',
      [data.nombre.trim(), data.email.trim(), hashedPassword, data.telefono || null, data.cargo || null, data.rol, true, data.fecha_ingreso || null]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const existing = await query('SELECT id, email FROM usuarios WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new Error('Trabajador no encontrado');
    const currentWorker = existing.rows[0];

    if (data.email !== undefined && data.email !== currentWorker.email) {
      const emailCheck = await query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [data.email, id]);
      if (emailCheck.rows.length > 0) throw new Error('El email ya está registrado');
    }
    if (data.password !== undefined && data.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

    let hashedPassword;
    if (data.password !== undefined) hashedPassword = await bcrypt.hash(data.password, 10);

    const setClauses = [];
    const params = [];
    let paramCount = 1;

    if (data.nombre !== undefined) { setClauses.push(`nombre = $${paramCount++}`); params.push(data.nombre.trim()); }
    if (data.email !== undefined) { setClauses.push(`email = $${paramCount++}`); params.push(data.email.trim()); }
    if (hashedPassword !== undefined) { setClauses.push(`password = $${paramCount++}`); params.push(hashedPassword); }
    if (data.telefono !== undefined) { setClauses.push(`telefono = $${paramCount++}`); params.push(data.telefono); }
    if (data.cargo !== undefined) { setClauses.push(`cargo = $${paramCount++}`); params.push(data.cargo); }
    if (data.rol !== undefined) { setClauses.push(`rol = $${paramCount++}`); params.push(data.rol); }
    if (data.activo !== undefined) { setClauses.push(`activo = $${paramCount++}`); params.push(data.activo); }
    if (data.fecha_ingreso !== undefined) { setClauses.push(`fecha_ingreso = $${paramCount++}`); params.push(data.fecha_ingreso); }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const result = await query(
      `UPDATE usuarios SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING id, nombre, email, telefono, cargo, rol, activo, fecha_ingreso, created_at, updated_at`,
      params
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await query(
      'UPDATE usuarios SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) throw new Error('Trabajador no encontrado');
    return { success: true };
  }
}

module.exports = new TrabajadoresService();
