const Request = require('../models/Request');
const Provider = require('../models/Provider');

// @route  POST /api/requests
// @desc   Customer creates a help request
const createRequest = async (req, res) => {
  try {
    const { vehicleType, issueCategory, subIssue, note, longitude, latitude } = req.body;

    if (!vehicleType || !issueCategory || !subIssue || longitude == null || latitude == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const request = await Request.create({
      customer: req.user._id,
      vehicleType,
      issueCategory,
      subIssue,
      note: note || '',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      status: 'pending',
    });

    const RADIUS_METERS = 5000;

    const nearbyProviders = await Provider.find({
      isOnline: true,
      isApproved: true,
      serviceTypes: issueCategory,
      vehicleTypesSupported: vehicleType,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: RADIUS_METERS,
        },
      },
    }).populate('user', 'name phone');

    const io = req.app.get('io');
    nearbyProviders.forEach((provider) => {
      io.to(`provider_${provider.user._id}`).emit('new-request', {
        requestId: request._id,
        vehicleType,
        issueCategory,
        subIssue,
        note,
        location: request.location,
        createdAt: request.createdAt,
      });
    });

    res.status(201).json({
      message: 'Request created',
      request,
      notifiedProviders: nearbyProviders.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create request', error: error.message });
  }
};

// @route  GET /api/requests/:id
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name phone' } });

    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch request', error: error.message });
  }
};

// @route  GET /api/requests/history
const getMyRequests = async (req, res) => {
  try {
    const filter =
      req.user.role === 'customer'
        ? { customer: req.user._id }
        : { provider: req.query.providerId }; // provider profile id passed from frontend

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};
// @route  DELETE /api/requests/:id
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the customer who created it can delete, and only if not actively in progress
    const activeStatuses = ['matched', 'on_the_way', 'arrived', 'in_progress'];
    if (activeStatuses.includes(request.status)) {
      return res.status(400).json({ message: 'Cannot delete an active job. Cancel it first.' });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete request', error: error.message });
  }
};
module.exports = { createRequest, getRequestById, getMyRequests, deleteRequest };