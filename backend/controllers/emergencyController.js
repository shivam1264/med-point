const Emergency = require('../models/Emergency');
const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');

// Helper: calculate distance in km between two coordinates
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// POST /api/sos — User triggers SOS
const triggerSOS = async (req, res) => {
  try {
    const { lat, lng, address, hospitalId } = req.body;
    const userId = req.user.id;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Location required' });
    }

    // Check if user already has active emergency
    const activeEmergency = await Emergency.findOne({
      user: userId,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });
    if (activeEmergency) {
      return res.status(400).json({ success: false, message: 'You already have an active emergency', data: activeEmergency });
    }

    // Targeted Hospital Booking vs General SOS
    let nearestHospital = null;
    let nearestAmbulance = null;
    let minHospDist = Infinity;
    let minAmbDist = Infinity;

    if (hospitalId) {
      // User selected a specific hospital
      nearestHospital = await Hospital.findById(hospitalId);
      if (!nearestHospital) {
        return res.status(404).json({ success: false, message: 'Selected hospital not found' });
      }
      
      // Find nearest ambulance ONLY from this hospital
      const availableAmbulances = await Ambulance.find({ 
        hospital: hospitalId, 
        isOnline: true, 
        isAvailable: true 
      });

      for (const amb of availableAmbulances) {
        if (amb.currentLocation && amb.currentLocation.lat) {
          const dist = getDistanceKm(lat, lng, amb.currentLocation.lat, amb.currentLocation.lng);
          if (dist < minAmbDist) {
            minAmbDist = dist;
            nearestAmbulance = amb;
          }
        }
      }
    } else {
      // General SOS: Find nearest available ambulance from ALL
      const availableAmbulances = await Ambulance.find({ isOnline: true, isAvailable: true });
      for (const amb of availableAmbulances) {
        if (amb.currentLocation && amb.currentLocation.lat) {
          const dist = getDistanceKm(lat, lng, amb.currentLocation.lat, amb.currentLocation.lng);
          if (dist < minAmbDist) {
            minAmbDist = dist;
            nearestAmbulance = amb;
          }
        }
      }

      // Find nearest hospital with beds for General SOS
      const hospitals = await Hospital.find({});
      for (const h of hospitals) {
        if (h.coordinates && h.coordinates.lat) {
          const dist = getDistanceKm(lat, lng, h.coordinates.lat, h.coordinates.lng);
          if (dist < minHospDist) {
            minHospDist = dist;
            nearestHospital = h;
          }
        }
      }
    }

    // Create emergency
    const emergencyData = {
      user: userId,
      location: { type: 'Point', coordinates: [lng, lat], address: address || 'Location detected by GPS' },
    };

    if (nearestHospital) {
      emergencyData.hospital = nearestHospital._id;
      emergencyData.hospitalName = nearestHospital.hospitalName;
      emergencyData.hospitalAddress = nearestHospital.address;
      emergencyData.hospitalLat = nearestHospital.location.coordinates[1];
      emergencyData.hospitalLng = nearestHospital.location.coordinates[0];
    }

    if (nearestAmbulance) {
      emergencyData.ambulance = nearestAmbulance._id;
      emergencyData.ambulanceDriverName = nearestAmbulance.driverName;
      emergencyData.ambulanceVehicleNumber = nearestAmbulance.vehicleNumber;
      emergencyData.ambulanceDrivrePhone = nearestAmbulance.driverPhone;
    }

    const emergency = await Emergency.create(emergencyData);

    // Notify ambulance via Socket.io (emitted from server)
    if (nearestAmbulance && req.io) {
      req.io.to(`ambulance_${nearestAmbulance._id}`).emit('new_emergency', {
        emergencyId: emergency._id,
        location: emergency.location,
        hospitalName: emergency.hospitalName,
        userId,
        message: 'New SOS Alert! Patient needs help.'
      });
    }

    res.status(201).json({
      success: true,
      message: nearestAmbulance
        ? `Emergency created. Ambulance ${nearestAmbulance.vehicleNumber} dispatched.`
        : 'Emergency created. Finding available ambulance...',
      data: emergency,
      ambulanceDispatched: !!nearestAmbulance,
      nearestHospital: nearestHospital ? {
        name: nearestHospital.hospitalName,
        address: nearestHospital.address,
        phone: nearestHospital.phone,
        distance: `${minHospDist.toFixed(1)} km`
      } : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/emergencies/my — get current user's active emergency
const getMyEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({
      user: req.user.id,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    }).populate('ambulance', 'driverName vehicleNumber driverPhone').populate('hospital', 'hospitalName address phone');
    res.json({ success: true, data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/emergencies/active — driver sees their assigned emergency
const getActiveEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({
      ambulance: req.user.id,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    }).populate('user', 'name phone bloodGroup');
    res.json({ success: true, data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/emergencies/:id/accept
const acceptEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted', acceptedAt: new Date() },
      { new: true }
    );
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    // Mark ambulance as unavailable
    await Ambulance.findByIdAndUpdate(req.user.id, { isAvailable: false });

    // Notify user via Socket.io
    if (req.io) {
      req.io.to(`user_${emergency.user}`).emit('emergency_accepted', {
        emergencyId: emergency._id,
        driverName: emergency.ambulanceDriverName,
        vehicleNumber: emergency.ambulanceVehicleNumber
      });
    }

    res.json({ success: true, data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/emergencies/:id/decline
const declineEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'pending', ambulance: null, ambulanceDriverName: null, ambulanceVehicleNumber: null },
      { new: true }
    );
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });
    res.json({ success: true, message: 'Emergency declined', data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/emergencies/:id/complete
const completeEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    // Mark ambulance available again
    await Ambulance.findByIdAndUpdate(emergency.ambulance, { isAvailable: true });

    res.json({ success: true, message: 'Emergency completed', data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/emergencies — hospital admin sees all
const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('user', 'name phone')
      .populate('ambulance', 'driverName vehicleNumber')
      .populate('hospital', 'hospitalName')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, count: emergencies.length, data: emergencies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { triggerSOS, getMyEmergency, getActiveEmergency, acceptEmergency, declineEmergency, completeEmergency, getAllEmergencies };
