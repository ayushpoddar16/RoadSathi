const Provider = require('../models/Provider');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// @route  GET /api/providers/me
const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await Provider.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// @route  PUT /api/providers/me
// @desc   Update service types + vehicle types supported
const updateMyProviderProfile = async (req, res) => {
  try {
    const { serviceTypes, vehicleTypesSupported } = req.body;

    const profile = await Provider.findOneAndUpdate(
      { user: req.user._id },
      { serviceTypes, vehicleTypesSupported },
      { new: true }
    );

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @route  POST /api/providers/documents
// @desc   Upload verification documents (license, ID proof)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'roadsathi/documents');

    const profile = await Provider.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          documents: {
            url: result.secure_url,
            publicId: result.public_id,
            type: req.body.type || 'other',
          },
        },
      },
      { new: true }
    );

    res.json({ message: 'Document uploaded', profile });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// @route  PATCH /api/providers/status
// @desc   REST backup for online/offline toggle (in case socket connection drops)
const toggleOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const profile = await Provider.findOneAndUpdate(
      { user: req.user._id },
      { isOnline },
      { new: true }
    );
    res.json({ message: `Status set to ${isOnline ? 'online' : 'offline'}`, profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

module.exports = { getMyProviderProfile, updateMyProviderProfile, uploadDocument, toggleOnlineStatus };