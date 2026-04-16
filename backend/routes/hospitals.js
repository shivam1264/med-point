const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getNearbyHospitals,
  updateBedAvailability
} = require('../controllers/hospitalController');

// GET all hospitals
router.get('/', getHospitals);

// GET nearby hospitals
router.get('/nearby', getNearbyHospitals);

// GET single hospital
router.get('/:id', getHospitalById);

// POST create hospital
router.post('/', createHospital);

// PUT update hospital
router.put('/:id', updateHospital);

// PATCH update bed availability
router.patch('/:id/beds', updateBedAvailability);

// DELETE hospital
router.delete('/:id', deleteHospital);

module.exports = router;
