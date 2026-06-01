const express = require('express');
const router = express.Router();
const { getAllOffices, getOfficeById, createOffice, updateOffice, deleteOffice } = require('../controllers/officeController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Public routes for authenticated users
router.get('/', getAllOffices);
router.get('/:id', getOfficeById);

// Owner/Manager only routes
router.post('/', authorize('Owner', 'Manager'), createOffice);
router.put('/:id', authorize('Owner', 'Manager'), updateOffice);
router.delete('/:id', authorize('Owner'), deleteOffice);

module.exports = router;
