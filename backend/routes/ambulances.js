const express = require('express');
const router = express.Router();
const { getAmbulances, registerAmbulance, updateAmbulanceStatus, updateLocation, deleteAmbulance } = require('../controllers/ambulanceController');
const { protect, hospitalAdminOnly, ambulanceOnly } = require('../middleware/auth');

router.get('/', protect, hospitalAdminOnly, getAmbulances);
router.post('/register', protect, hospitalAdminOnly, registerAmbulance);
router.patch('/location', protect, ambulanceOnly, updateLocation);
router.patch('/:id/status', updateAmbulanceStatus); // called by driver after login
router.delete('/:id', protect, hospitalAdminOnly, deleteAmbulance);

module.exports = router;
