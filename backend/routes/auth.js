const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAmbulance, loginHospital, createHospitalAdmin, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/ambulance/login', loginAmbulance);
router.post('/hospital/login', loginHospital);
router.post('/hospital/create-admin', createHospitalAdmin); // setup: create admin per hospital

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;

