const express = require('express');
const router = express.Router();
const {
  getStationary,
  addStationary,
  deleteAllStationary,
  deleteStationaryItem
} = require('../controllers/employeeStationaryController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/employees/:employeeId/stationary - Get all stationary for employee
router.get('/', getStationary);

// POST /api/employees/:employeeId/stationary - Add stationary for employee
router.post('/', authorize('Owner', 'Manager'), addStationary);

// DELETE /api/employees/:employeeId/stationary - Delete all stationary for employee
router.delete('/', authorize('Owner', 'Manager'), deleteAllStationary);

// DELETE /api/employees/:employeeId/stationary/:stationaryId - Delete single stationary item
router.delete('/:stationaryId', authorize('Owner', 'Manager'), deleteStationaryItem);

module.exports = router;
