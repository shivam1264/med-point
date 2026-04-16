const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { protect, hospitalAdminOnly } = require('../middleware/auth');

// Helper: distance in km
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const { 
  getNearbyHospitals, 
  getHospitals, 
  getHospitalById, 
  createHospital,
  updateBedAvailability, 
  updateHospital,
  deleteHospital 
} = require('../controllers/hospitalController');

// GET /api/hospitals/nearby?lat=&lng=&limit=5
router.get('/nearby', getNearbyHospitals);

// GET /api/hospitals
router.get('/', getHospitals);

// GET /api/hospitals/:id
router.get('/:id', getHospitalById);

// POST /api/hospitals
router.post('/', protect, hospitalAdminOnly, createHospital);

// PATCH /api/hospitals/:id/beds — hospital admin updates bed counts
router.patch('/:id/beds', protect, hospitalAdminOnly, updateBedAvailability);

// PUT /api/hospitals/:id — full update
router.put('/:id', protect, hospitalAdminOnly, updateHospital);

// DELETE /api/hospitals/:id
router.delete('/:id', protect, hospitalAdminOnly, deleteHospital);

module.exports = router;
