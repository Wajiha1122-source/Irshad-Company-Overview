const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { auth, authorize } = require('../middleware/auth');

// Import nested routes
const workRoutes = require('./employeeWorkRoutes');
const authorityRoutes = require('./employeeAuthorityRoutes');
const assetRoutes = require('./employeeAssetRoutes');
const accountRoutes = require('./employeeAccountRoutes');
const stationaryRoutes = require('./employeeStationaryRoutes');

// All routes require authentication
router.use(auth);

// Nested sub-resource routes (must be defined before /:id to avoid conflicts)
router.use('/:employeeId/work', workRoutes);
router.use('/:employeeId/authority', authorityRoutes);
router.use('/:employeeId/assets', assetRoutes);
router.use('/:employeeId/account-access', accountRoutes);
router.use('/:employeeId/stationary', stationaryRoutes);

// Employee CRUD routes
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('Owner', 'Manager'), createEmployee);
router.put('/:id', authorize('Owner', 'Manager'), updateEmployee);
router.delete('/:id', authorize('Owner'), deleteEmployee);

module.exports = router;
