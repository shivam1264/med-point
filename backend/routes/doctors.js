const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, createDoctor, updateDoctor, updateDoctorStatus, deleteDoctor } = require('../controllers/doctorController');
const { protect, hospitalAdminOnly } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, hospitalAdminOnly, createDoctor);
router.put('/:id', protect, hospitalAdminOnly, updateDoctor);
router.patch('/:id/status', protect, hospitalAdminOnly, updateDoctorStatus);
router.delete('/:id', protect, hospitalAdminOnly, deleteDoctor);

module.exports = router;
