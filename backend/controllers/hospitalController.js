const Hospital = require('../models/Hospital');

// @desc    Get all hospitals
const getHospitals = async (req, res) => {
  try {
    const { search, status, sortBy = 'name', order = 'asc', page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { hospitalName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    const hospitals = await Hospital.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Hospital.countDocuments(query);
    res.json({ success: true, count: hospitals.length, total, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHospital = async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, maxDistance, onlyWithBeds, limit } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

    // 1. Diagnostics: Log what's in the DB
    const all = await Hospital.find({}).limit(1).lean();
    if (all.length > 0) {
      console.log('📍 Sample Hospital Coords:', all[0].location?.coordinates, ' hospitalName:', all[0].hospitalName);
    }

    // 2. Clear auto-migration with lean() to be safe
    const legacy = await Hospital.find({ 
      $or: [
        { location: { $exists: false } }, 
        { hospitalName: { $exists: false } } 
      ] 
    }).lean();
    
    if (legacy.length > 0) {
      console.log(`🔧 Migrating ${legacy.length} legacy records...`);
      for (const h of legacy) {
        const updates = {};
        if (!h.hospitalName && h.name) updates.hospitalName = h.name;
        
        // Smart Coordinate Extraction
        let oldLat, oldLng;
        if (h.coordinates && typeof h.coordinates === 'object' && !Array.isArray(h.coordinates)) {
          oldLat = h.coordinates.lat;
          oldLng = h.coordinates.lng;
        } else if (Array.isArray(h.coordinates)) {
          oldLng = h.coordinates[0];
          oldLat = h.coordinates[1];
        } else {
          oldLat = h.lat;
          oldLng = h.lng;
        }

        // Only update if we found valid non-default coordinates or if location is missing
        if (oldLat && oldLng) {
          updates.location = { 
            type: 'Point', 
            coordinates: [parseFloat(String(oldLng)), parseFloat(String(oldLat))] 
          };
        }
        
        if (Object.keys(updates).length > 0) {
          await Hospital.findByIdAndUpdate(h._id, { $set: updates });
          console.log(`✅ Migrated: ${h.hospitalName || h.name || h._id} -> [${oldLng}, ${oldLat}]`);
        }
      }
    }

    const radius = maxDistance ? parseInt(String(maxDistance)) : 500000; // 500km default for better discovery

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
      // Recommendation Scoring Logic
      {
        $addFields: {
          // Normalize various factors into a 0-100 scale
          // 1. Distance Score (0-40 pts): Closer is higher. 40 - (distance * 2) capped at 0.
          distScore: { 
            $max: [0, { $subtract: [40, { $multiply: ["$distanceKm", 2] }] }] 
          },
          // 2. Bed Score (0-35 pts): Ratio of available beds
          bedScore: {
            $cond: [
              { $gt: ["$totalBeds", 0] },
              { $multiply: [{ $divide: ["$availableBeds", "$totalBeds"] }, 35] },
              0
            ]
          },
          // 3. Rating Score (0-15 pts)
          ratingScore: { $multiply: [{ $divide: ["$rating", 5] }, 15] },
          // 4. Status Score (0-10 pts)
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
      {
        $addFields: {
          recommendationScore: { 
            $add: ["$distScore", "$bedScore", "$ratingScore", "$statusScore"] 
          }
        }
      },
      { $sort: { recommendationScore: -1 } },
      { $limit: parseInt(String(limit)) || 50 }
    ];

    const hospitals = await Hospital.aggregate(pipeline);
    console.log(`📍 Nearby Hospitals Result: ${hospitals.length} for [${lng}, ${lat}]`);
    
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    console.error('❌ GeoNear Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBedAvailability = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getNearbyHospitals,
  updateBedAvailability
};
