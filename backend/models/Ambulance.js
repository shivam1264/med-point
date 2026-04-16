const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ambulanceSchema = new mongoose.Schema({
  driverName: { type: String, required: true, trim: true },
  driverPhone: { type: String, required: true, trim: true },
  vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
  vehicleType: { type: String, enum: ['Basic', 'Advanced', 'ICU'], default: 'Basic' },
  
  // Login credentials assigned by hospital
  driverId: { type: String, required: true, unique: true }, // e.g. DRV-2847
  password: { type: String, required: true },
  
  // Hospital that registered this ambulance
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  hospitalName: { type: String },

  // Live status
  isOnline: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.4126, 23.2599] } // [lng, lat]
  },
  
  role: { type: String, default: 'ambulance' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for backward compatibility
ambulanceSchema.virtual('currentLocation').get(function() {
  if (this.location && this.location.coordinates) {
    return {
      lng: this.location.coordinates[0],
      lat: this.location.coordinates[1]
    };
  }
  return null;
});

// Index for geo queries
ambulanceSchema.index({ location: '2dsphere' });

ambulanceSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

ambulanceSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Ambulance', ambulanceSchema);
