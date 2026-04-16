const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');
const doctorRoutes = require('./routes/doctors');
const ambulanceRoutes = require('./routes/ambulances');
const emergencyRoutes = require('./routes/emergencies');

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// Attach io to every request so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/emergencies', emergencyRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🏥 MedFlow API v2.0 Running',
    status: 'OK',
    endpoints: {
      auth: '/api/auth',
      hospitals: '/api/hospitals',
      doctors: '/api/doctors',
      ambulances: '/api/ambulances',
      emergencies: '/api/emergencies'
    }
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Socket.io connection management
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Ambulance driver joins their room for targeted emergency alerts
  socket.on('join_ambulance', (ambulanceId) => {
    socket.join(`ambulance_${ambulanceId}`);
    console.log(`🚑 Ambulance ${ambulanceId} joined real-time room`);
  });

  // User joins their room to receive status updates
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined real-time room`);
  });

  // Ambulance driver sends live location
  socket.on('driver_location', ({ ambulanceId, lat, lng }) => {
    // Broadcast to any dashboard listeners
    io.emit('ambulance_location_update', { ambulanceId, lat, lng, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// MongoDB + Start Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected');
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MedFlow Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for real-time connections`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
