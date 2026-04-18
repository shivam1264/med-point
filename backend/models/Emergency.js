const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  // Patient info
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userPhone: { type: String },
  userEmergencyContact: { type: String },
  pickupOTP: { type: String },
  
  // Location of patient
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String }
  },
  
  // Assigned ambulance
  ambulance: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  ambulanceDriverName: { type: String },
  ambulanceVehicleNumber: { type: String },
  ambulanceDrivrePhone: { type: String },
  
  // Assigned hospital (nearest with beds)
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  hospitalName: { type: String },
  hospitalAddress: { type: String },
  hospitalLat: { type: Number },
  hospitalLng: { type: Number },
  
  // Status flow: pending → accepted → in_progress → completed / cancelled
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  severity: {
    type: String,
    enum: ['critical', 'moderate', 'mild'],
    default: 'critical'
  },

  notes: { type: String },
  
  // Timestamps for each phase
  acceptedAt: { type: Date },
  arrivedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Top 5 recommendations at time of SOS
  recommendations: [{
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    name: { type: String },
    score: { type: Number },
    distance: { type: Number }
  }]
  
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
