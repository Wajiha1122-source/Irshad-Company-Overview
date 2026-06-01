const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getAllInventoryItems,
  getInventoryTotals,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateQuantity
} = require('../controllers/inventoryController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Public routes for authenticated users
router.get('/categories', getAllCategories);
router.get('/items', getAllInventoryItems);
router.get('/totals', getInventoryTotals);

// Owner/Manager only routes
router.post('/items', authorize('Owner', 'Manager'), createInventoryItem);
router.put('/items/:id', authorize('Owner', 'Manager'), updateInventoryItem);
router.delete('/items/:id', authorize('Owner'), deleteInventoryItem);
router.patch('/items/:id/quantity', authorize('Owner', 'Manager'), updateQuantity);

module.exports = router;
