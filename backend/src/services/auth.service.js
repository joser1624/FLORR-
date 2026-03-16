const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const jwtConfig = require('../config/jwt');

class AuthService {
  /**
   * Login user with credential validation
   * Requirement 19.10: Log all authentication attempts with success or failure status
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Token and user data
   * @throws {Error} 401 for invalid credentials, 403 for inactive account
   */
  async login(email, password) {
    const timestamp = new Date().toISOString();
    
    // Validate password minimum length
    if (!password || password.length < 6) {
      console.log(`🔒 [${timestamp}] Authentication FAILED: Invalid password length for email: ${email}`);
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Find user by email
    const result = await query(
      'SELECT id, nombre, email, password, rol, cargo, activo FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log(`🔒 [${timestamp}] Authentication FAILED: User not found - email: ${email}`);
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    // Check if user is active (403 for inactive accounts)
    if (!user.activo) {
      console.log(`🔒 [${timestamp}] Authentication FAILED: Inactive account - email: ${email}, user_id: ${user.id}`);
      const error = new Error('Cuenta inactiva');
      error.statusCode = 403;
      throw error;
    }

    // Verify password using bcrypt comparison
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`🔒 [${timestamp}] Authentication FAILED: Invalid password - email: ${email}, user_id: ${user.id}`);
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token with 24h expiration including user payload (id, email, rol, nombre)
    const token = jwtConfig.generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    });

    // Log successful authentication
    console.log(`✅ [${timestamp}] Authentication SUCCESS - email: ${email}, user_id: ${user.id}, rol: ${user.rol}`);

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
   * Hash password using bcrypt with 10 salt rounds
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  async hashPassword(password) {
    // Validate password minimum length
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Use bcrypt with 10 salt rounds as per requirements
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {boolean} True if passwords match
   */
  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = new AuthService();
