const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const jwtConfig = require('../config/jwt');

class AuthService {
  /**
   * Login user
   */
  async login(email, password) {
    // Find user by email
    const result = await query(
      'SELECT id, nombre, email, password, rol, cargo, activo FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.activo) {
      throw new Error('Usuario inactivo');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Return user data (without password) and token
    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        cargo: user.cargo,
      },
    };
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId) {
    const result = await query(
      'SELECT id, nombre, email, rol, cargo, telefono, fecha_ingreso FROM usuarios WHERE id = $1 AND activo = true',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}

module.exports = new AuthService();
