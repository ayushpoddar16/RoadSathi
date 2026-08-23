const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    serviceTypes: {
      type: [String],
      enum: ['fuel', 'mechanical', 'electrical', 'towing', 'service'],
      required: true,
    },
    vehicleTypesSupported: {
      type: [String],
      enum: ['2-wheeler', '3-wheeler', '4-wheeler', 'multi-wheeler'],
      required: true,
    },
    documents: [
      {
        url: String,       // Cloudinary URL
        publicId: String,  // Cloudinary public_id (needed to delete/replace later)
        type: String,      // e.g. "license", "id-proof"
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,      // admin verifies documents before provider can go live
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],   // [longitude, latitude] — GeoJSON order, not lat/long!
        default: [0, 0],
      },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

providerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);