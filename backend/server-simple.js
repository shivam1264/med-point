const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8081', 'http://10.244.66.235:8081', 'http://192.168.1.100:8081'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Sample hospital data (static for now)
const sampleHospitals = [
  {
    _id: 'h1',
    name: 'City General Hospital',
    address: '123 Main Street, Downtown',
    distance: '2.3 km',
    status: 'available',
    coordinates: { lat: 23.2599, lng: 77.4126 },
    beds: {
      icu: { total: 25, free: 18 },
      general: { total: 80, free: 62 },
      ot: { total: 3, free: 2 }
    },
    specialists: ['Neurosurgeon', 'Cardiologist', 'Ortho'],
    contact: { phone: '+1234567890' },
    emergencyServices: true,
    rating: 4.8
  },
  {
    _id: 'h2',
    name: 'MediCare Center',
    address: '456 Park Avenue, West Side',
    distance: '4.1 km',
    status: 'moderate',
    coordinates: { lat: 23.2635, lng: 77.4018 },
    beds: {
      icu: { total: 20, free: 8 },
      general: { total: 80, free: 48 },
      ot: { total: 2, free: 1 }
    },
    specialists: ['Cardiologist', 'General Surgeon'],
    contact: { phone: '+0987654321' },
    emergencyServices: true,
    rating: 4.5
  },
  {
    _id: 'h3',
    name: 'Emergency Medical Center',
    address: '789 Highway Road, North District',
    distance: '6.7 km',
    status: 'full',
    coordinates: { lat: 23.2156, lng: 77.4304 },
    beds: {
      icu: { total: 34, free: 2 },
      general: { total: 120, free: 26 },
      ot: { total: 4, free: 0 }
    },
    specialists: ['Neurosurgeon'],
    contact: { phone: '+1122334455' },
    emergencyServices: true,
    rating: 4.9
  }
];

// Routes
app.get('/api/hospitals', (req, res) => {
  const { search, status, sortBy = 'name', order = 'asc' } = req.query;
  
  let hospitals = [...sampleHospitals];
  
  // Search functionality
  if (search) {
    hospitals = hospitals.filter(hospital => 
      hospital.name.toLowerCase().includes(search.toLowerCase()) ||
      hospital.address.toLowerCase().includes(search.toLowerCase()) ||
      hospital.specialists.some(spec => spec.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  // Filter by status
  if (status) {
    hospitals = hospitals.filter(hospital => hospital.status === status);
  }
  
  // Sorting
  hospitals.sort((a, b) => {
    if (sortBy === 'name') {
      return order === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    } else if (sortBy === 'status') {
      return order === 'desc' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
    } else if (sortBy === 'rating') {
      return order === 'desc' ? a.rating - b.rating : b.rating - a.rating;
    }
    return 0;
  });
  
  res.json({
    success: true,
    count: hospitals.length,
    total: hospitals.length,
    pages: 1,
    currentPage: 1,
    data: hospitals
  });
});

app.get('/api/hospitals/:id', (req, res) => {
  const hospital = sampleHospitals.find(h => h._id === req.params.id);
  
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
});

app.post('/api/hospitals', (req, res) => {
  const newHospital = {
    _id: `h${sampleHospitals.length + 1}`,
    ...req.body
  };
  
  sampleHospitals.push(newHospital);
  
  res.status(201).json({
    success: true,
    message: 'Hospital created successfully',
    data: newHospital
  });
});

app.get('/api/hospitals/nearby', (req, res) => {
  const { lat, lng, maxDistance = 10000 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }
  
  // Simple distance calculation (not exact but for demo)
  const hospitals = sampleHospitals.slice(0, 3); // Return first 3 as nearby
  
  res.json({
    success: true,
    count: hospitals.length,
    data: hospitals
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MedFlow Backend API is running!',
    version: '1.0.0',
    endpoints: {
      hospitals: '/api/hospitals'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/hospitals - Get all hospitals`);
  console.log(`  GET /api/hospitals/:id - Get single hospital`);
  console.log(`  POST /api/hospitals - Create hospital`);
  console.log(`  GET /api/hospitals/nearby - Get nearby hospitals`);
});
