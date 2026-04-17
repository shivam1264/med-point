require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const HospitalAdmin = require('./models/HospitalAdmin');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const hospitals = [
  { hospitalName: "AIIMS Bhopal", fullName: "All India Institute of Medical Sciences Bhopal", type: "Government – Teaching & Research", category: "Super Speciality", area: "Saket Nagar", address: "AIIMS Campus Rd, AIIMS Campus, Saket Nagar, Habib Ganj, Bhopal, MP 462020", emergency: true, phone: "+91-755-298-2607", totalBeds: 960, availableBeds: 120, icuBeds: 100, icuAvailable: 18, ventilators: 80, ventilatorsAvailable: 12, specialties: ["General Medicine", "Surgery", "Cardiology", "Neurology", "Oncology", "Orthopedics", "Pediatrics", "Gynecology", "Radiology", "Psychiatry"], accreditation: ["NABH", "MCI"], ayushmanEmpanelled: true, coordinates: { lat: 23.2094, lng: 77.4582 }, rating: 4.0, ratingCount: 1895, open24x7: true, status: "green" },
  { hospitalName: "Hamidia Hospital", fullName: "Hamidia Hospital (Gandhi Medical College)", type: "Government – Teaching", category: "Tertiary Care", area: "Royal Market", address: "Sultania Rd, Royal Market, Bhopal, MP 462001", emergency: true, phone: "+91-755-254-0590", totalBeds: 1500, availableBeds: 280, icuBeds: 120, icuAvailable: 32, ventilators: 100, ventilatorsAvailable: 15, specialties: ["General Medicine", "Surgery", "Orthopedics", "Gynecology", "Pediatrics", "Cardiology", "Neurology", "Emergency Medicine", "ENT", "Ophthalmology"], accreditation: ["MCI"], ayushmanEmpanelled: true, coordinates: { lat: 23.2592, lng: 77.3942 }, rating: 3.2, ratingCount: 783, open24x7: true, status: "green" },
  { hospitalName: "Bansal Hospital", fullName: "Bansal Hospital Bhopal", type: "Private", category: "Multi-Speciality", area: "Shahpura", address: "Chuna Bhatti Rd, Manisha Market, Sector C, Shahpura, Bhopal, MP 462039", emergency: true, phone: "+91-755-408-6000", totalBeds: 400, availableBeds: 75, icuBeds: 50, icuAvailable: 12, ventilators: 30, ventilatorsAvailable: 8, specialties: ["Cardiology", "Neurology", "Orthopedics", "Urology", "Gastroenterology", "Oncology", "Laparoscopic Surgery", "Nephrology"], accreditation: ["NABH"], ayushmanEmpanelled: true, coordinates: { lat: 23.1995, lng: 77.4199 }, rating: 4.0, ratingCount: 3000, open24x7: true, status: "green" },
  { hospitalName: "Apollo Sage Hospital", fullName: "ApolloSage Hospitals Bhopal", type: "Private", category: "Multi-Speciality", area: "Bawadiya Kalan", address: "Bawadiya Kalan, Salaiya, Bhopal, MP 462026", emergency: true, phone: "+91-93039-72510", totalBeds: 350, availableBeds: 60, icuBeds: 60, icuAvailable: 10, ventilators: 40, ventilatorsAvailable: 6, specialties: ["Cardiology", "Organ Transplant", "Neurology", "Radiology", "Oncology", "Orthopedics", "Maternity", "Laparoscopy"], accreditation: ["NABH"], ayushmanEmpanelled: false, coordinates: { lat: 23.1776, lng: 77.4424 }, rating: 4.5, ratingCount: 3500, open24x7: true, status: "green" },
  { hospitalName: "People's Hospital", fullName: "People's Hospital Bhopal", type: "Private – Teaching", category: "Multi-Speciality", area: "Bhanpur", address: "Ayodhya Bypass Rd, Peoples Campus, Bhanpur, Bhopal, MP 462037", emergency: true, phone: "+91-755-248-0000", totalBeds: 700, availableBeds: 140, icuBeds: 80, icuAvailable: 22, ventilators: 50, ventilatorsAvailable: 10, specialties: ["Neonatology", "Pediatrics", "Cardiology", "Orthopedics", "Neurology", "Gastroenterology", "Gynecology", "Oncology"], accreditation: ["NABH"], ayushmanEmpanelled: true, coordinates: { lat: 23.3011, lng: 77.4246 }, rating: 4.5, ratingCount: 961, open24x7: true, status: "green" },
  { hospitalName: "JP Hospital", fullName: "Jai Prakash District Hospital", type: "Government", category: "District Hospital", area: "Shivaji Nagar", address: "Shivaji Nagar, Bhopal, MP 462003", emergency: true, phone: "+91-755-266-0248", totalBeds: 300, availableBeds: 45, icuBeds: 30, icuAvailable: 5, ventilators: 20, ventilatorsAvailable: 3, specialties: ["General Medicine", "Surgery", "Obstetrics", "Gynecology", "Pediatrics", "Emergency Care"], accreditation: [], ayushmanEmpanelled: true, coordinates: { lat: 23.2301, lng: 77.4178 }, rating: 3.6, ratingCount: 424, open24x7: true, status: "amber" },
  { hospitalName: "Noble Hospital", fullName: "Noble Multispeciality Hospital", type: "Private", category: "Multi-Speciality", area: "Misrod", address: "269/1, Near Capital Mall, Misrod, Bhopal, MP 462026", emergency: true, phone: "+91-755-248-8008", totalBeds: 110, availableBeds: 30, icuBeds: 20, icuAvailable: 6, ventilators: 12, ventilatorsAvailable: 4, specialties: ["Cardiology", "Orthopedics", "Neurology", "Dialysis", "Emergency Medicine", "General Surgery"], accreditation: ["NABH"], ayushmanEmpanelled: true, coordinates: { lat: 23.1614, lng: 77.4710 }, rating: 4.4, ratingCount: 1261, open24x7: true, status: "green" },
  { hospitalName: "Siddhanta Hospital", fullName: "Siddhanta Red Cross Superspeciality Hospital", type: "Private", category: "Super Speciality", area: "Shivaji Nagar", address: "Link Rd 1, Shivaji Nagar, Bhopal, MP 462011", emergency: true, phone: "+91-755-257-2555", totalBeds: 120, availableBeds: 25, icuBeds: 20, icuAvailable: 4, ventilators: 15, ventilatorsAvailable: 3, specialties: ["Cardiology", "Cardiac Surgery", "Neurology", "Nephrology", "Critical Care", "Emergency Medicine"], accreditation: ["NABH"], ayushmanEmpanelled: true, coordinates: { lat: 23.2308, lng: 77.4200 }, rating: 4.5, ratingCount: 231, open24x7: true, status: "green" },
  { hospitalName: "Chirayu Hospital", fullName: "Chirayu Medical College & Hospital", type: "Private – Teaching", category: "Multi-Speciality", area: "Bairagarh", address: "Bhopal Byp, Bhainsakhedi, Bairagarh, Bhopal, MP 462030", emergency: true, phone: "+91-755-270-9101", totalBeds: 750, availableBeds: 180, icuBeds: 80, icuAvailable: 20, ventilators: 50, ventilatorsAvailable: 12, specialties: ["General Medicine", "Surgery", "Cardiology", "Pediatrics", "Gynecology", "Orthopedics", "Radiology", "Neurology"], accreditation: ["NABH", "MCI"], ayushmanEmpanelled: true, coordinates: { lat: 23.2690, lng: 77.3081 }, rating: 3.3, ratingCount: 660, open24x7: true, status: "green" },
  { hospitalName: "Narmada Trauma Centre", fullName: "Narmada Trauma Centre Pvt Ltd", type: "Private", category: "Multi-Speciality & Trauma", area: "Arera Colony", address: "E3/23, Arera Colony, Bhopal, MP 462016", emergency: true, phone: "+91-755-404-0000", totalBeds: 200, availableBeds: 40, icuBeds: 30, icuAvailable: 8, ventilators: 20, ventilatorsAvailable: 5, specialties: ["Trauma Surgery", "Orthopedics", "Neurosurgery", "Emergency Medicine", "General Surgery", "Critical Care"], accreditation: [], ayushmanEmpanelled: true, coordinates: { lat: 23.2177, lng: 77.4392 }, rating: 4.1, ratingCount: 515, open24x7: true, status: "green" }
];

const doctors = [
  // AIIMS Bhopal doctors
  { name: "Dr. Rajesh Kumar Sharma", specialty: "Cardiology", qualification: "MD, DM Cardiology", experience: 18, consultationFee: 800 },
  { name: "Dr. Priya Srivastava", specialty: "Neurology", qualification: "MD, DM Neurology", experience: 14, consultationFee: 900 },
  { name: "Dr. Suresh Mehta", specialty: "Orthopedics", qualification: "MS Orthopedics", experience: 20, consultationFee: 700 },
  // Hamidia Hospital
  { name: "Dr. Anita Joshi", specialty: "Gynecology", qualification: "MS Gynecology", experience: 12, consultationFee: 500 },
  { name: "Dr. Vikram Singh", specialty: "General Surgery", qualification: "MS Surgery", experience: 15, consultationFee: 400 },
  // Bansal Hospital
  { name: "Dr. Neha Agarwal", specialty: "Cardiology", qualification: "MD, DM Cardiology", experience: 10, consultationFee: 1200 },
  { name: "Dr. Ramesh Dubey", specialty: "Urology", qualification: "MS Urology", experience: 16, consultationFee: 1000 },
  // Apollo Sage
  { name: "Dr. Kavita Verma", specialty: "Oncology", qualification: "MD, DM Oncology", experience: 13, consultationFee: 1500 },
  { name: "Dr. Ajay Patel", specialty: "Neurology", qualification: "MD, DM Neurology", experience: 11, consultationFee: 1100 },
  // People's Hospital
  { name: "Dr. Sunita Tiwari", specialty: "Pediatrics", qualification: "MD Pediatrics", experience: 9, consultationFee: 600 },
  { name: "Dr. Manoj Khare", specialty: "Gastroenterology", qualification: "MD, DM Gastro", experience: 17, consultationFee: 900 },
];

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear all
    await Hospital.deleteMany({});
    await HospitalAdmin.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data (Hospitals, Admins, Doctors, Users)');

    // Insert hospitals with correct GeoJSON mapping
    const mappedHospitals = hospitals.map(h => ({
      ...h,
      location: {
        type: 'Point',
        coordinates: [h.coordinates.lng, h.coordinates.lat]
      }
    }));
    const insertedHospitals = await Hospital.insertMany(mappedHospitals);
    console.log(`🏥 ${insertedHospitals.length} hospitals inserted`);

    // Insert doctors distributed across hospitals
    const hospitalIds = insertedHospitals.map(h => h._id);
    const doctorData = doctors.map((d, i) => ({
      ...d,
      hospital: hospitalIds[i % hospitalIds.length],
      hospitalName: insertedHospitals[i % hospitalIds.length].hospitalName,
      availableStatus: ['available', 'available', 'busy', 'available', 'off-duty'][Math.floor(Math.random() * 5)] || 'available',
      phone: `+91-98${Math.floor(10000000 + Math.random() * 89999999)}`
    }));
    const insertedDoctors = await Doctor.insertMany(doctorData);
    console.log(`👨‍⚕️ ${insertedDoctors.length} doctors inserted`);

    // Create ONE HospitalAdmin per hospital
    const DEFAULT_PASSWORD = 'hospital@123';
    const adminDocs = insertedHospitals.map((h, i) => ({
      name: `${h.hospitalName} Admin`,
      email: `admin${i + 1}@medflow.com`,
      password: DEFAULT_PASSWORD,
      hospital: h._id,
      hospitalName: h.hospitalName
    }));
    // Use individual save so bcrypt pre-save hook runs on each
    const createdAdmins = [];
    for (const a of adminDocs) {
      const adm = new HospitalAdmin(a);
      await adm.save();
      createdAdmins.push(adm);
    }
    console.log(`🔑 ${createdAdmins.length} hospital admin accounts created`);

    // Create a static Test Patient for mobile app testing
    // Create a static Test Patient for mobile app testing
    const testUser = new User({
      name: 'Test Patient',
      phone: '9988776655',
      password: 'user123',
      bloodGroup: 'O+',
      address: 'Arera Colony, Bhopal'
    });
    await testUser.save();
    console.log('👤 Static Test Patient created: 9988776655 / user123');

    // Create a static Test Ambulance Driver
    const Ambulance = require('./models/Ambulance');
    await Ambulance.deleteMany({}); // Clear existing
    const testAmbulance = new Ambulance({
      driverName: 'Ramesh Driver',
      driverPhone: '9876543210',
      vehicleNumber: 'MP-04-AB-1234',
      vehicleType: 'ICU',
      driverId: 'AMB-101',
      password: 'amb123',
      hospital: insertedHospitals[0]._id, // AIIMS Bhopal
      hospitalName: insertedHospitals[0].hospitalName,
      isOnline: true,
      isAvailable: true
    });
    await testAmbulance.save();
    console.log('🚑 Static Test Ambulance Driver created: AMB-101 / amb123 (Linked to AIIMS Bhopal)');

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('🌐 Hospital Web Panel Login:');
    console.log('   → Select hospital from dropdown');
    console.log(`   → Password for ALL hospitals: ${DEFAULT_PASSWORD}`);
    console.log('   (Each hospital admin sees only their own data)');
    console.log('\n📋 Hospital Admins Created:');
    insertedHospitals.forEach((h, i) => {
      console.log(`   [${i + 1}] ${h.hospitalName}`);
    });
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedAll();
