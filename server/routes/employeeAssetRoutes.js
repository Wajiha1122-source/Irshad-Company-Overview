const express = require('express');
const router = express.Router();
const {
  getAssets,
  addAsset,
  deleteAllAssets,
  deleteAssetItem
} = require('../controllers/employeeAssetController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/employees/:employeeId/assets - Get all assets for employee
router.get('/', getAssets);

// POST /api/employees/:employeeId/assets - Add asset for employee
router.post('/', authorize('Owner', 'Manager'), addAsset);

// DELETE /api/employees/:employeeId/assets - Delete all assets for employee
router.delete('/', authorize('Owner', 'Manager'), deleteAllAssets);

// DELETE /api/employees/:employeeId/assets/:assetId - Delete single asset item
router.delete('/:assetId', authorize('Owner', 'Manager'), deleteAssetItem);

module.exports = router;
