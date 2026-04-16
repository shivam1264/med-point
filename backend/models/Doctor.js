const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  qualification: { type: String, trim: true },
  experience: { type: Number, default: 0 }, // years
  
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  hospitalName: { type: String },
  
  phone: { type: String },
  email: { type: String },
  consultationFee: { type: Number, default: 0 },
  
  availableStatus: { 
    type: String, 
    enum: ['available', 'busy', 'off-duty'], 
    default: 'available' 
  },
  
  schedule: {
    mon: { type: String, default: '9:00 AM - 5:00 PM' },
    tue: { type: String, default: '9:00 AM - 5:00 PM' },
    wed: { type: String, default: '9:00 AM - 5:00 PM' },
    thu: { type: String, default: '9:00 AM - 5:00 PM' },
    fri: { type: String, default: '9:00 AM - 5:00 PM' },
    sat: { type: String, default: '9:00 AM - 1:00 PM' },
    sun: { type: String, default: 'Off' }
  },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
