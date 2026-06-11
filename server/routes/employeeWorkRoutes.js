const express = require('express');
const router = express.Router();
const {
  getWork,
  addWork,
  deleteAllWork,
  deleteWorkItem
} = require('../controllers/employeeWorkController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/employees/:employeeId/work - Get all work for employee
router.get('/', getWork);

// POST /api/employees/:employeeId/work - Add work for employee
router.post('/', authorize('Owner', 'Manager'), addWork);

// DELETE /api/employees/:employeeId/work - Delete all work for employee
router.delete('/', authorize('Owner', 'Manager'), deleteAllWork);

// DELETE /api/employees/:employeeId/work/:workId - Delete single work item
router.delete('/:workId', authorize('Owner', 'Manager'), deleteWorkItem);

module.exports = router;
