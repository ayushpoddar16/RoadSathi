const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createRequest, getRequestById, getMyRequests } = require('../controllers/requestController');
const { submitRating } = require('../controllers/ratingController');
const {deleteRequest} = require('../controllers/requestController');

router.post('/:id/rate', protect, authorize('customer'), submitRating);
router.post('/', protect, authorize('customer'), createRequest);
router.get('/history', protect, getMyRequests);
router.get('/:id', protect, getRequestById);
router.delete('/:id', protect, deleteRequest);

module.exports = router;