const Request = require('../models/Request');
const Provider = require('../models/Provider');

// @route  POST /api/requests/:id/rate
const submitRating = async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed jobs' });
    }

    request.rating = { stars, comment };
    await request.save();

    // Recalculate provider's average rating
    const provider = await Provider.findById(request.provider);
    const newCount = provider.rating.count + 1;
    const newAverage =
      (provider.rating.average * provider.rating.count + stars) / newCount;

    provider.rating = { average: newAverage, count: newCount };
    await provider.save();

    res.json({ message: 'Rating submitted', rating: request.rating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

module.exports = { submitRating };