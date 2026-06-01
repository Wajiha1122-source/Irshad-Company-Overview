const express = require('express');
const router = express.Router();
const { getAllActivityLogs, createActivityLog } = require('../controllers/activityController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Public routes for authenticated users
router.get('/', getAllActivityLogs);

// Owner only route for creating logs (usually done internally)
router.post('/', authorize('Owner'), createActivityLog);

module.exports = router;
