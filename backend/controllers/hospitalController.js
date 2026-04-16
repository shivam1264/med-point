const Hospital = require('../models/Hospital');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      sortBy = 'name', 
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { specialists: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Sorting options
    const sortOptions = {};
    const allowedSortFields = ['name', 'status', 'rating', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    sortOptions[sortField] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const hospitals = await Hospital.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hospital.countDocuments(query);

    res.json({
      success: true,
      count: hospitals.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hospitals',
      error: error.message
    });
  }
};

// @desc    Get single hospital by ID
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital',
      error: error.message
    });
  }
};

// @desc    Create a new hospital
// @route   POST /api/hospitals
// @access  Public
const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating hospital',
      error: error.message
    });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Public
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    const updatedHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Hospital updated successfully',
      data: updatedHospital
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating hospital',
      error: error.message
    });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Public
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    await Hospital.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting hospital',
      error: error.message
    });
  }
};

// @desc    Get hospitals by location (nearby)
// @route   GET /api/hospitals/nearby
// @access  Public
const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const hospitals = await Hospital.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearby hospitals',
      error: error.message
    });
  }
};

// @desc    Update hospital bed availability
// @route   PATCH /api/hospitals/:id/beds
// @access  Public
const updateBedAvailability = async (req, res) => {
  try {
    const { icuFree, generalFree, otFree } = req.body;

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Update bed availability
    if (icuFree !== undefined) hospital.beds.icu.free = icuFree;
    if (generalFree !== undefined) hospital.beds.general.free = generalFree;
    if (otFree !== undefined) hospital.beds.ot.free = otFree;

    await hospital.save();

    res.json({
      success: true,
      message: 'Bed availability updated successfully',
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bed availability',
      error: error.message
    });
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
