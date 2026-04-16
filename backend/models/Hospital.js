const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    default: 'Bhopal'
  },
  state: {
    type: String,
    default: 'Madhya Pradesh'
  },
  emergency: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  totalBeds: {
    type: Number,
    default: 0
  },
  availableBeds: {
    type: Number,
    default: null
  },
  icuBeds: {
    type: Number,
    default: 0
  },
  icuAvailable: {
    type: Number,
    default: null
  },
  ventilators: {
    type: Number,
    default: 0
  },
  ventilatorsAvailable: {
    type: Number,
    default: null
  },
  specialties: [{
    type: String,
    trim: true
  }],
  accreditation: [{
    type: String,
    trim: true
  }],
  ayushmanEmpanelled: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: [77.4126, 23.2599] // Default to Bhopal
    }
  },
  googlePlaceId: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  open24x7: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['green', 'amber', 'red'],
    default: 'green'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for backward compatibility
hospitalSchema.virtual('coordinates').get(function() {
  if (this.location && this.location.coordinates) {
    return {
      lng: this.location.coordinates[0],
      lat: this.location.coordinates[1]
    };
  }
  return null;
});

// Indexes
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ hospitalName: 'text', fullName: 'text', area: 'text', specialties: 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);
