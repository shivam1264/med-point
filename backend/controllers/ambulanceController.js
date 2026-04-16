const Ambulance = require('../models/Ambulance');
const bcrypt = require('bcryptjs');

// Generate random Driver ID like DRV-4837
const generateDriverId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DRV-${num}`;
};

// Generate random password like medX@7392
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const word = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const number = Array.from({length: 4}, () => nums[Math.floor(Math.random() * nums.length)]).join('');
  return `${word}@${number}`;
};

// GET /api/ambulances — hospital admin sees all ambulances of their hospital
const getAmbulances = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const filter = {};
    if (hospitalId) filter.hospital = hospitalId;
    const ambulances = await Ambulance.find(filter).select('-password');
    res.json({ success: true, count: ambulances.length, data: ambulances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ambulances/register — hospital admin registers new ambulance driver
const registerAmbulance = async (req, res) => {
  try {
    const { driverName, driverPhone, vehicleNumber, vehicleType, hospitalId, hospitalName } = req.body;
    if (!driverName || !driverPhone || !vehicleNumber || !hospitalId) {
      return res.status(400).json({ success: false, message: 'Driver name, phone, vehicle number and hospital are required' });
    }

    // Check if vehicle already registered
    const exists = await Ambulance.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Vehicle number already registered' });
    }

    // Generate unique Driver ID
    let driverId;
    let isUnique = false;
    while (!isUnique) {
      driverId = generateDriverId();
      const existing = await Ambulance.findOne({ driverId });
      if (!existing) isUnique = true;
    }

    // Generate password (store plain for display ONCE, then hash)
    const plainPassword = generatePassword();

    const ambulance = await Ambulance.create({
      driverName,
      driverPhone,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType: vehicleType || 'Basic',
      driverId,
      password: plainPassword, // will be hashed by pre-save hook
      hospital: hospitalId,
      hospitalName
    });

    // Return with plain password for ONE-TIME display
    res.status(201).json({
      success: true,
      message: 'Ambulance registered successfully',
      credentials: {
        driverId,
        password: plainPassword, // shown once to admin
        driverName,
        vehicleNumber: vehicleNumber.toUpperCase()
      },
      data: {
        id: ambulance._id,
        driverId: ambulance.driverId,
        driverName: ambulance.driverName,
        vehicleNumber: ambulance.vehicleNumber,
        hospitalName: ambulance.hospitalName
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/ambulances/:id/status — driver goes online/offline or available/unavailable
const updateAmbulanceStatus = async (req, res) => {
  try {
    const { isOnline, isAvailable, currentLocation } = req.body;
    const update = {};
    if (isOnline !== undefined) update.isOnline = isOnline;
    if (isAvailable !== undefined) update.isAvailable = isAvailable;
    if (currentLocation) {
      update.location = { 
        type: 'Point', 
        coordinates: [parseFloat(currentLocation.lng), parseFloat(currentLocation.lat)]
      };
    }
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found' });
    res.json({ success: true, data: ambulance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/ambulances/location — update driver location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const ambulanceId = req.user.id;
    await Ambulance.findByIdAndUpdate(ambulanceId, {
      location: { 
        type: 'Point', 
        coordinates: [parseFloat(lng), parseFloat(lat)] 
      }
    });
    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/ambulances/:id
const deleteAmbulance = async (req, res) => {
  try {
    await Ambulance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ambulance removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAmbulances, registerAmbulance, updateAmbulanceStatus, updateLocation, deleteAmbulance };
