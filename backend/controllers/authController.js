const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ambulance = require('../models/Ambulance');
const HospitalAdmin = require('../models/HospitalAdmin');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/user/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, password, email, bloodGroup, address, emergencyContact } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone and password are required' });
    }
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    const user = await User.create({ name, phone, password, email, bloodGroup, address, emergencyContact });
    const token = generateToken({ id: user._id, role: 'user', phone: user.phone });
    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/user/login
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log(`Attempting login for phone: ${phone}`);
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }
    const user = await User.findOne({ phone });
    if (!user) {
      console.log(`User not found: ${phone}`);
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const isMatch = await user.comparePassword(password);
    console.log(`Password match for ${phone}: ${isMatch}`);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const token = generateToken({ id: user._id, role: 'user', phone: user.phone });
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/ambulance/login
const loginAmbulance = async (req, res) => {
  try {
    const { driverId, password } = req.body;
    if (!driverId || !password) {
      return res.status(400).json({ success: false, message: 'Driver ID and password are required' });
    }
    const driver = await Ambulance.findOne({ driverId });
    if (!driver || !(await driver.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid Driver ID or password' });
    }
    const token = generateToken({ id: driver._id, role: 'ambulance', driverId: driver.driverId });
    // Mark as online
    driver.isOnline = true;
    await driver.save();
    res.json({
      success: true,
      message: 'Login successful',
      token,
      driver: {
        id: driver._id,
        driverId: driver.driverId,
        driverName: driver.driverName,
        vehicleNumber: driver.vehicleNumber,
        vehicleType: driver.vehicleType,
        hospitalName: driver.hospitalName,
        isOnline: driver.isOnline,
        isAvailable: driver.isAvailable,
        role: 'ambulance'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/hospital/login — hospitalId + password
const loginHospital = async (req, res) => {
  try {
    const { hospitalId, password } = req.body;
    if (!hospitalId || !password) {
      return res.status(400).json({ success: false, message: 'Hospital and password are required' });
    }
    const admin = await HospitalAdmin.findOne({ hospital: hospitalId });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'No admin account found for this hospital' });
    }
    if (!(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    const token = generateToken({ id: admin._id, role: 'hospital_admin', hospitalId: admin.hospital });
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        hospitalName: admin.hospitalName,
        hospitalId: admin.hospital,
        role: 'hospital_admin'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/hospital/create-admin — create/update admin for a hospital (setup only)
const createHospitalAdmin = async (req, res) => {
  try {
    const { hospitalId, hospitalName, name, password } = req.body;
    if (!hospitalId || !password) {
      return res.status(400).json({ success: false, message: 'hospitalId and password required' });
    }
    const existing = await HospitalAdmin.findOne({ hospital: hospitalId });
    if (existing) {
      // Update password
      existing.password = password;
      existing.name = name || existing.name;
      await existing.save();
      return res.json({ success: true, message: 'Admin password updated', email: existing.email });
    }
    const email = `admin_${hospitalId.toString().slice(-6)}@medflow.com`;
    const admin = await HospitalAdmin.create({ name: name || 'Hospital Admin', email, password, hospital: hospitalId, hospitalName });
    res.status(201).json({ success: true, message: 'Admin created', email });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let data;
    if (role === 'user') {
      data = await User.findById(id).select('-password');
    } else if (role === 'ambulance') {
      data = await Ambulance.findById(id).select('-password');
    } else if (role === 'hospital_admin') {
      data = await HospitalAdmin.findOne({ hospital: req.user.hospitalId }).select('-password');
    }

    if (!data) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const updates = req.body;

    // Prevent role/password updates through this endpoint for safety
    delete updates.role;
    delete updates.password;
    delete updates.driverId; // Ambulance specific
    delete updates.hospital; // Ambulance specific

    let updated;
    if (role === 'user') {
      updated = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
    } else if (role === 'ambulance') {
      // Drivers can only update personal info, not vehicle/hospital info
      const allowed = { 
        driverName: updates.driverName, 
        driverPhone: updates.driverPhone 
      };
      updated = await Ambulance.findByIdAndUpdate(id, allowed, { new: true, runValidators: true }).select('-password');
    }

    if (!updated) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerUser, loginUser, loginAmbulance, loginHospital, createHospitalAdmin, getProfile, updateProfile };

