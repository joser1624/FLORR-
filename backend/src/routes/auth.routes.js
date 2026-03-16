const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

// Validation rules for login
const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .isEmail()
    .withMessage('Email debe ser válido'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  validateRequest
];

// Public routes
router.post('/login', loginValidation, authController.login.bind(authController));

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser.bind(authController));
router.post('/logout', verifyToken, authController.logout.bind(authController));

module.exports = router;
