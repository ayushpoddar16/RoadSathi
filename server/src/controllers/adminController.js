const Provider = require('../models/Provider');

// @route  PATCH /api/admin/providers/:id/approve
const approveProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json({ message: 'Provider approved', provider });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};

module.exports = { approveProvider };