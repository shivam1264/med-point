const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAmbulance, loginHospital, createHospitalAdmin } = require('../controllers/authController');

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/ambulance/login', loginAmbulance);
router.post('/hospital/login', loginHospital);
router.post('/hospital/create-admin', createHospitalAdmin); // setup: create admin per hospital

module.exports = router;

