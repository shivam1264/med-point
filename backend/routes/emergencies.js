const express = require('express');
const router = express.Router();
const { triggerSOS, getMyEmergency, getActiveEmergency, acceptEmergency, declineEmergency, completeEmergency, getAllEmergencies } = require('../controllers/emergencyController');
const { protect, hospitalAdminOnly, ambulanceOnly } = require('../middleware/auth');

// User routes
router.post('/sos', protect, triggerSOS);
router.get('/my', protect, getMyEmergency);

// Ambulance driver routes
router.get('/active', protect, ambulanceOnly, getActiveEmergency);
router.patch('/:id/accept', protect, ambulanceOnly, acceptEmergency);
router.patch('/:id/decline', protect, ambulanceOnly, declineEmergency);
router.patch('/:id/complete', protect, ambulanceOnly, completeEmergency);

// Hospital admin
router.get('/', protect, hospitalAdminOnly, getAllEmergencies);

module.exports = router;
