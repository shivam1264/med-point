const Emergency = require('../models/Emergency');
const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');
const User = require('../models/User');


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
    const { lat, lng, hospitalId, address } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!lat || !lng) {

      return res.status(400).json({ success: false, message: 'Location required' });
    }

    // Check if user already has active emergency
    const activeEmergency = await Emergency.findOne({
      user: userId,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });

    if (activeEmergency) {
      if (activeEmergency.status === 'pending') {
        // Auto-cancel old pending request to allow switching hospitals
        console.log('Auto-cancelling old pending SOS to allow new request');
        activeEmergency.status = 'cancelled';
        activeEmergency.cancelledAt = new Date();
        await activeEmergency.save();
      } else {
        // Driver already assigned, must cancel manually
        return res.status(400).json({ 
          success: false, 
          message: `Ambulance already ${activeEmergency.status}. Please cancel it first before re-requesting.`, 
          data: activeEmergency 
        });
      }
    }

    let nearestHospital = null;
    let minHospDist = Infinity;
    let availableAmbulanceList = [];

    // Prepare emergency data
    const emergencyData = {
      user: userId,
      userName: user?.name,
      userPhone: user?.phone,
      userEmergencyContact: user?.emergencyContact?.phone ? `${user.emergencyContact.name} (${user.emergencyContact.phone})` : 'None',
      pickupOTP: Math.floor(1000 + Math.random() * 9000).toString(),
      location: { type: 'Point', coordinates: [lng, lat], address: address || 'Location detected by GPS' },
    };


    if (hospitalId) {
      // Targeted Hospital
      nearestHospital = await Hospital.findById(hospitalId);
      if (!nearestHospital) {
        return res.status(404).json({ success: false, message: 'Selected hospital not found' });
      }
      availableAmbulanceList = await Ambulance.find({ 
        hospital: hospitalId, 
        isOnline: true, 
        isAvailable: true 
      });
    } else {
      // Recommendation Algorithm for SOS
      const radius = 100000; // 100km
      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(String(lng)), parseFloat(String(lat))] },
            distanceField: 'distanceKm',
            distanceMultiplier: 0.001,
            spherical: true,
            maxDistance: radius,
          }
        },
        {
          $addFields: {
            distScore: { $max: [0, { $subtract: [40, { $multiply: ["$distanceKm", 2] }] }] },
            bedScore: {
              $cond: [{ $gt: ["$totalBeds", 0] }, { $multiply: [{ $divide: ["$availableBeds", "$totalBeds"] }, 35] }, 0]
            },
            ratingScore: { $multiply: [{ $divide: ["$rating", 5] }, 15] },
            statusScore: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "green"] }, then: 10 },
                  { case: { $eq: ["$status", "amber"] }, then: 5 },
                  { case: { $eq: ["$status", "red"] }, then: 0 }
                ],
                default: 5
              }
            }
          }
        },
        { $addFields: { score: { $add: ["$distScore", "$bedScore", "$ratingScore", "$statusScore"] } } },
        { $sort: { score: -1 } },
        { $limit: 5 }
      ];

      const recommendedHospitals = await Hospital.aggregate(pipeline);
      if (recommendedHospitals.length > 0) {
        nearestHospital = recommendedHospitals[0];
        minHospDist = recommendedHospitals[0].distanceKm;
        
        emergencyData.recommendations = recommendedHospitals.map(h => ({
          hospitalId: h._id,
          name: h.hospitalName,
          score: h.score,
          distance: h.distanceKm
        }));
      }
      
      availableAmbulanceList = await Ambulance.find({ isOnline: true, isAvailable: true });
    }

    if (nearestHospital) {
      emergencyData.hospital = nearestHospital._id;
      emergencyData.hospitalName = nearestHospital.hospitalName;
      emergencyData.hospitalAddress = nearestHospital.address;
      emergencyData.hospitalLat = nearestHospital.location.coordinates[1];
      emergencyData.hospitalLng = nearestHospital.location.coordinates[0];
    }

    const emergency = await Emergency.create(emergencyData);

    // Broadcast to all available ambulances
    if (req.io && availableAmbulanceList.length > 0) {
      availableAmbulanceList.forEach(amb => {
        req.io.to(`ambulance_${amb._id}`).emit('new_emergency', {
          _id: emergency._id,
          emergencyId: emergency._id,
          location: emergency.location,
          hospitalName: emergency.hospitalName,
          userId,
          userName: emergency.userName,
          userPhone: emergency.userPhone,
          emergencyContact: emergency.userEmergencyContact,
          message: 'New SOS Alert! Patient needs help.'
        });

      });
    }

    res.status(201).json({
      success: true,
      message: availableAmbulanceList.length > 0 
          ? `Emergency created. Alert sent to ${availableAmbulanceList.length} nearby ambulances.` 
          : 'Emergency created. Waiting for an ambulance to come online.',
      data: emergency,
      ambulanceDispatched: false,
      nearestHospital: nearestHospital ? {
        name: nearestHospital.hospitalName,
        address: nearestHospital.address,
        phone: nearestHospital.phone,
        distance: minHospDist !== Infinity ? `${minHospDist.toFixed(1)} km` : 'Unknown'
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
    }).populate('ambulance', 'driverName vehicleNumber driverPhone location').populate('hospital', 'hospitalName address phone');
    res.json({ success: true, data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/emergencies/active — driver sees their assigned or pending emergency
const getActiveEmergency = async (req, res) => {
  try {
    // 1. Check if they have an active accepted/in_progress emergency
    let emergency = await Emergency.findOne({
      ambulance: req.user.id,
      status: { $in: ['accepted', 'in_progress'] }
    }).populate('user', 'name phone bloodGroup');

    if (emergency) {
      return res.json({ success: true, data: emergency });
    }

    // 2. Poll for pending emergencies for their hospital
    const driver = await Ambulance.findById(req.user.id);
    if (!driver || !driver.isAvailable || !driver.isOnline) {
      return res.json({ success: true, data: null });
    }

    emergency = await Emergency.findOne({
      status: 'pending',
      $or: [
        { hospital: driver.hospital },
        { hospital: null }
      ]
    }).populate('user', 'name phone bloodGroup').sort({ createdAt: -1 });

    res.json({ success: true, data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/emergencies/:id/accept
const acceptEmergency = async (req, res) => {
  try {
    const driver = await Ambulance.findById(req.user.id);
    if (!driver || !driver.isAvailable) {
      return res.status(400).json({ success: false, message: 'You are not available' });
    }

    // Race condition protection: Atomically find a pending emergency and assign it.
    const emergency = await Emergency.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { 
        status: 'accepted', 
        acceptedAt: new Date(), 
        ambulance: req.user.id,
        ambulanceDriverName: driver.driverName,
        ambulanceVehicleNumber: driver.vehicleNumber
      },
      { new: true }
    );

    if (!emergency) {
      return res.status(400).json({ success: false, message: 'Emergency already accepted by someone else or cancelled.' });
    }

    // Mark ambulance as unavailable
    driver.isAvailable = false;
    await driver.save();

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
    const { otp } = req.body;
    const emergency = await Emergency.findById(req.params.id);
    
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });
    
    if (emergency.pickupOTP && emergency.pickupOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid Verification OTP' });
    }

    emergency.status = 'completed';
    emergency.completedAt = new Date();
    await emergency.save();

    // Free up modern ambulance
    if (emergency.ambulance) {
      await Ambulance.findByIdAndUpdate(emergency.ambulance, { isAvailable: true });
    }

    // Notify user via Socket.io
    if (req.io) {
      req.io.to(`user_${emergency.user}`).emit('emergency_completed', {
        emergencyId: emergency._id,
        message: 'Your emergency trip has been completed.'
      });
    }

    res.json({ success: true, message: 'Emergency completed', data: emergency });
  } catch (err) {
    console.error('Complete Emergency Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/emergencies/:id/cancel
const cancelSOS = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    // Validate ownership
    if (!emergency.user || emergency.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this emergency' });
    }

    if (['completed', 'cancelled'].includes(emergency.status)) {
      return res.status(400).json({ success: false, message: `Emergency already ${emergency.status}` });
    }

    // Free up ambulance if one was assigned
    if (emergency.ambulance) {
      await Ambulance.findByIdAndUpdate(emergency.ambulance, { isAvailable: true });
      
      // Notify driver
      if (req.io) {
        req.io.to(`ambulance_${emergency.ambulance}`).emit('emergency_cancelled', {
          emergencyId: emergency._id,
          message: 'The user has cancelled the emergency request.'
        });
      }
    }

    emergency.status = 'cancelled';
    emergency.cancelledAt = new Date();
    await emergency.save();

    res.json({ success: true, message: 'Emergency cancelled successfully', data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/emergencies — hospital admin sees all
const getAllEmergencies = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const filter = {};
    if (hospitalId) filter.hospital = hospitalId;

    const emergencies = await Emergency.find(filter)
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

module.exports = { triggerSOS, getMyEmergency, getActiveEmergency, acceptEmergency, declineEmergency, completeEmergency, cancelSOS, getAllEmergencies };
