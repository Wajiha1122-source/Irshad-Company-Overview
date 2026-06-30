const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const MASTER_SSO_USER = 'chmfj@live.com';
const MASTER_SSO_ROLE = 'ceo';

const buildAuthPayload = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role
});

const buildAuthResponseUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
  office_id: user.office_id
});

const createAppToken = (user) => jwt.sign(
  buildAuthPayload(user),
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const failSso = (res, message, status = 401) => (
  res.status(status).send(`SSO login failed: ${message}.`)
);

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

const encodeFragmentValue = (value) => encodeURIComponent(
  Buffer.from(JSON.stringify(value)).toString('base64url')
);

// Register User
const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role, office_id } = req.body;
    
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const result = await pool.query(
      'INSERT INTO users (username, email, password, full_name, role, office_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, full_name, role, office_id',
      [username, email, hashedPassword, full_name, role, office_id]
    );
    
    const user = result.rows[0];
    
    // Generate token
    const token = createAppToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        ...buildAuthResponseUser(user)
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = createAppToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        ...buildAuthResponseUser(user)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SSO login from the Master Dashboard.
const ssoLogin = async (req, res) => {
  try {
    const { token } = req.query;
    const {
      SSO_SECRET,
      SSO_APP_NAME,
      SSO_LOCAL_CEO_USERNAME,
      SSO_REDIRECT_PATH = '/dashboard'
    } = process.env;

    // Change SSO_SECRET in the server environment when rotating the Master Dashboard secret.
    if (!SSO_SECRET) {
      return failSso(res, 'missing SSO_SECRET', 500);
    }

    // Change SSO_APP_NAME here via env to the exact app value issued by the Master Dashboard.
    if (!SSO_APP_NAME) {
      return failSso(res, 'missing app name configuration', 500);
    }

    // Change SSO_LOCAL_CEO_USERNAME via env if the local CEO/admin username changes.
    if (!SSO_LOCAL_CEO_USERNAME) {
      return failSso(res, 'missing local CEO user configuration', 500);
    }

    if (!token) {
      return failSso(res, 'missing token');
    }

    let payload;
    try {
      payload = jwt.verify(token, SSO_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      return failSso(res, 'invalid or expired token');
    }

    if (!payload.exp) {
      return failSso(res, 'token missing expiration');
    }

    if (payload.masterUser !== MASTER_SSO_USER) {
      return failSso(res, 'unauthorized user');
    }

    if (payload.role !== MASTER_SSO_ROLE) {
      return failSso(res, 'unauthorized role');
    }

    if (payload.app !== SSO_APP_NAME) {
      return failSso(res, 'app mismatch');
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [SSO_LOCAL_CEO_USERNAME]
    );

    if (result.rows.length === 0) {
      return failSso(res, 'local CEO user unavailable');
    }

    const user = result.rows[0];

    if (user.role !== 'Owner' || user.is_active === false || user.status === 'Inactive') {
      return failSso(res, 'local CEO user unavailable');
    }

    const appToken = createAppToken(user);
    const responseUser = buildAuthResponseUser(user);

    // Change SSO_REDIRECT_PATH via env when the CEO/admin landing page changes.
    const redirectPath = SSO_REDIRECT_PATH.startsWith('/') ? SSO_REDIRECT_PATH : '/dashboard';
    const redirectUrl = `${getClientUrl()}/sso-complete#token=${encodeURIComponent(appToken)}&user=${encodeFragmentValue(responseUser)}&redirect=${encodeURIComponent(redirectPath)}`;

    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('SSO login error:', error);
    return failSso(res, 'server error', 500);
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, office_id, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getCurrentUser, ssoLogin };
