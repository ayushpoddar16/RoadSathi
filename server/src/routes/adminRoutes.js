const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { approveProvider } = require('../controllers/adminController');

router.patch('/providers/:id/approve', protect, authorize('admin'), approveProvider);

module.exports = router;