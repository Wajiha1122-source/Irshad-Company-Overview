const express = require('express');
const router = express.Router();
const {
  getAuthority,
  addAuthority,
  deleteAllAuthority,
  deleteAuthorityItem
} = require('../controllers/employeeAuthorityController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/employees/:employeeId/authority - Get all authority for employee
router.get('/', getAuthority);

// POST /api/employees/:employeeId/authority - Add authority for employee
router.post('/', authorize('Owner', 'Manager'), addAuthority);

// DELETE /api/employees/:employeeId/authority - Delete all authority for employee
router.delete('/', authorize('Owner', 'Manager'), deleteAllAuthority);

// DELETE /api/employees/:employeeId/authority/:authorityId - Delete single authority item
router.delete('/:authorityId', authorize('Owner', 'Manager'), deleteAuthorityItem);

module.exports = router;
