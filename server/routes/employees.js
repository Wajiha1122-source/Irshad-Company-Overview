const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addEmployeeWork,
  addEmployeeAuthority,
  addEmployeeAsset,
  addEmployeeAccountAccess,
  addEmployeeStationary
} = require('../controllers/employeeController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Public routes for authenticated users
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);

// Owner/Manager only routes
router.post('/', authorize('Owner', 'Manager'), createEmployee);
router.put('/:id', authorize('Owner', 'Manager'), updateEmployee);
router.delete('/:id', authorize('Owner'), deleteEmployee);

// Employee-related data routes
router.post('/work', authorize('Owner', 'Manager'), addEmployeeWork);
router.post('/authority', authorize('Owner', 'Manager'), addEmployeeAuthority);
router.post('/assets', authorize('Owner', 'Manager'), addEmployeeAsset);
router.post('/account-access', authorize('Owner', 'Manager'), addEmployeeAccountAccess);
router.post('/stationary', authorize('Owner', 'Manager'), addEmployeeStationary);

module.exports = router;
