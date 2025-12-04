// app.js - Express application setup without starting the server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const spacesRoutes = require('./routes/spaces.routes');
const plantsRoutes = require('./routes/plants.routes');
const userPlantsRoutes = require('./routes/userPlants.routes');
const careTasksRoutes = require('./routes/careTasks.routes');
const calendarRoutes = require('./routes/calendar.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

/** CORS FIX for Render + Frontend */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://plantmate-2-1.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  credentials: true,
}));

app.use(express.json());
app.use(cookie());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

/** Mount routes */
app.use(['/auth', '/api/auth'], authRoutes);
app.use(['/profiles', '/api/profiles'], profileRoutes);
app.use(['/spaces', '/api/spaces'], spacesRoutes);
app.use(['/plants', '/api/plants'], plantsRoutes);
app.use(['/catalog', '/api/catalog'], plantsRoutes);
app.use(['/user-plants', '/api/user-plants'], userPlantsRoutes);
app.use(['/care-tasks', '/api/care-tasks'], careTasksRoutes);
app.use(['/calendar', '/api/calendar'], calendarRoutes);
app.use(['/dashboard', '/api/dashboard'], dashboardRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;