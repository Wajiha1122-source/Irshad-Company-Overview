const express = require('express');
const router = express.Router();
const {
  getAccounts,
  addAccount,
  deleteAllAccounts,
  deleteAccountItem
} = require('../controllers/employeeAccountController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/employees/:employeeId/account-access - Get all account access for employee
router.get('/', getAccounts);

// POST /api/employees/:employeeId/account-access - Add account access for employee
router.post('/', authorize('Owner', 'Manager'), addAccount);

// DELETE /api/employees/:employeeId/account-access - Delete all account access for employee
router.delete('/', authorize('Owner', 'Manager'), deleteAllAccounts);

// DELETE /api/employees/:employeeId/account-access/:accountId - Delete single account access item
router.delete('/:accountId', authorize('Owner', 'Manager'), deleteAccountItem);

module.exports = router;
