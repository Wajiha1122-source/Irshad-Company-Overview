const express = require('express');
const router = express.Router();
const {
  getAllAssetAssignments,
  getAssetAssignmentById,
  createAssetAssignment,
  updateAssetAssignment,
  deleteAssetAssignment
} = require('../controllers/assetController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Public routes for authenticated users
router.get('/', getAllAssetAssignments);
router.get('/:id', getAssetAssignmentById);

// Owner/Manager only routes
router.post('/', authorize('Owner', 'Manager'), createAssetAssignment);
router.put('/:id', authorize('Owner', 'Manager'), updateAssetAssignment);
router.delete('/:id', authorize('Owner'), deleteAssetAssignment);

module.exports = router;
