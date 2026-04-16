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
    const { lat, lng, maxDistance, onlyWithBeds } = req.query;
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

    // 3. Perform the search with a very large radius to see IF anything exists
    const radius = maxDistance ? parseInt(String(maxDistance)) : 500000; // 500km default

    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(String(lng)), parseFloat(String(lat))] },
          distanceField: 'distanceKm',
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: radius,
          query: onlyWithBeds === 'true' ? {
            $or: [{ icuAvailable: { $gt: 0 } }, { availableBeds: { $gt: 0 } }]
          } : {}
        }
      },
      { $sort: { distanceKm: 1 } },
      { $limit: onlyWithBeds === 'true' ? 5 : 20 }
    ];

    const hospitals = await Hospital.aggregate(pipeline);
    console.log(`📍 Search [${lng}, ${lat}] Result: ${hospitals.length} hospitals`);
    
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
