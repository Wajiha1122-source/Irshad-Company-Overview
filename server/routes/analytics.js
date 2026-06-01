const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getEmployeeStats,
  getInventoryStats,
  getOfficeStats
} = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Public routes for authenticated users
router.get('/dashboard', getDashboardStats);
router.get('/employees', getEmployeeStats);
router.get('/inventory', getInventoryStats);
router.get('/offices', getOfficeStats);

module.exports = router;
