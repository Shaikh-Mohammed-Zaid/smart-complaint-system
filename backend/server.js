require('dotenv').config();
require('express-async-errors');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const voteRoutes = require('./routes/voteRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }
});

// Make io accessible to controllers
app.set('io', io);

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Socket connected: ${socket.id}`);
  }

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  socket.on('join_complaint', (complaintId) => {
    socket.join(`complaint_${complaintId}`);
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Socket disconnected: ${socket.id}`);
    }
  });
});

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: 'Supabase (PostgreSQL)', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🗄️  Database: Supabase (PostgreSQL) — ${process.env.SUPABASE_URL}`);
});
