const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null, // filled in once someone accepts
    },
    vehicleType: {
      type: String,
      enum: ['2-wheeler', '3-wheeler', '4-wheeler', 'multi-wheeler'],
      required: true,
    },
    issueCategory: {
      type: String,
      enum: ['fuel', 'mechanical', 'electrical', 'towing', 'service'],
      required: true,
    },
    subIssue: {
      type: String,
      required: true, // e.g. "flat tyre", "engine not starting"
    },
    note: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    status: {
      type: String,
      enum: [
        'pending',      // just created, searching for provider
        'matched',      // provider accepted
        'on_the_way',
        'arrived',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    payment: {
      amount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid',
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
    },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  },
  { timestamps: true }
);

requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);