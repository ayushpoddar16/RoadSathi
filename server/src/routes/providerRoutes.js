const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const {
  getMyProviderProfile,
  updateMyProviderProfile,
  uploadDocument,
  toggleOnlineStatus,
} = require('../controllers/providerController');

router.get('/me', protect, authorize('provider'), getMyProviderProfile);
router.put('/me', protect, authorize('provider'), updateMyProviderProfile);
router.post('/documents', protect, authorize('provider'), upload.single('document'), uploadDocument);
router.patch('/status', protect, authorize('provider'), toggleOnlineStatus);

module.exports = router;