const mongoose = require('mongoose');
require('dotenv').config();
const Hospital = require('./models/Hospital');

const hospitals = [
  {
    hospitalName: 'AIIMS Bhopal',
    address: 'Saket Nagar, Bhopal',
    status: 'green',
    location: { type: 'Point', coordinates: [77.4586, 23.2036] },
    availableBeds: 50,
    icuAvailable: 10
  },
  {
    hospitalName: 'Hamidia Hospital',
    address: 'Sultania Rd, Bhopal',
    status: 'amber',
    location: { type: 'Point', coordinates: [77.3934, 23.2644] },
    availableBeds: 20,
    icuAvailable: 5
  },
  {
    hospitalName: 'Bansal Hospital',
    address: 'Shahpura Lake, Bhopal',
    status: 'green',
    location: { type: 'Point', coordinates: [77.4363, 23.1956] },
    availableBeds: 35,
    icuAvailable: 8
  },
  {
    hospitalName: 'Chirayu Hospital',
    address: 'Bairagarh, Bhopal',
    status: 'red',
    location: { type: 'Point', coordinates: [77.3484, 23.2592] },
    availableBeds: 5,
    icuAvailable: 2
  },
  {
    hospitalName: 'Jawaharlal Nehru Hospital',
    address: 'BHEL, Bhopal',
    status: 'green',
    location: { type: 'Point', coordinates: [77.4125, 23.2842] },
    availableBeds: 40,
    icuAvailable: 12
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB...');
    
    // Delete existing to clean up
    await Hospital.deleteMany({});
    
    await Hospital.insertMany(hospitals);
    console.log('✅ Success: 5 Real Hospitals Seeded in Bhopal!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
