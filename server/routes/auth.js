const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, ssoLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/sso-login', ssoLogin);

// Protected routes
router.get('/me', auth, getCurrentUser);

module.exports = router;
