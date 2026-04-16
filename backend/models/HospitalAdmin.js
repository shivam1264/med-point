const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalAdminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'hospital_admin', enum: ['hospital_admin'] },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  hospitalName: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

hospitalAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

hospitalAdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('HospitalAdmin', hospitalAdminSchema);
