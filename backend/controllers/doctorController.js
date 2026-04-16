const Doctor = require('../models/Doctor');

// GET /api/doctors
const getDoctors = async (req, res) => {
  try {
    const { hospitalId, specialty, status } = req.query;
    const filter = { isActive: true };
    if (hospitalId) filter.hospital = hospitalId;
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (status) filter.availableStatus = status;
    const doctors = await Doctor.find(filter).populate('hospital', 'hospitalName address');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('hospital', 'hospitalName address phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors — hospital admin only
const createDoctor = async (req, res) => {
  try {
    const { name, specialty, qualification, experience, phone, email, consultationFee, schedule, hospital, hospitalName } = req.body;
    if (!name || !specialty || !hospital) {
      return res.status(400).json({ success: false, message: 'Name, specialty and hospital are required' });
    }
    const doctor = await Doctor.create({ name, specialty, qualification, experience, phone, email, consultationFee, schedule, hospital, hospitalName });
    res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor updated', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/doctors/:id/status
const updateDoctorStatus = async (req, res) => {
  try {
    const { availableStatus } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { availableStatus }, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/doctors/:id
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, updateDoctorStatus, deleteDoctor };
