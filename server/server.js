require('dotenv').config();
const express = require('express');
const app = express();
require('./cron');

const cors = require('cors');
const cookie = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const authRoutes         = require('./routes/auth.routes');
const profileRoutes      = require('./routes/profile.routes');
const spacesRoutes       = require('./routes/spaces.routes');
const plantsRoutes       = require('./routes/plants.routes');
const userPlantsRoutes   = require('./routes/userPlants.routes');
const careTasksRoutes    = require('./routes/careTasks.routes');
const calendarRoutes     = require('./routes/calendar.routes');
const dashboardRoutes    = require('./routes/dashboard.routes');
const notificationsRoutes = require('./routes/notifications.routes'); // 🔔

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://plantmate-2-1.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  credentials: true,
}));

app.use(express.json());
app.use(cookie());
app.use(morgan('dev'));

const isTestEnv = process.env.NODE_ENV === 'test';

if (!isTestEnv) {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI missing in .env');
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Error:', err));

  mongoose.connection.once('open', async () => {
    try {
      const { seedPlants } = require('./seed/plants.seed');
      await seedPlants();
    } catch (err) {
      console.error('⚠️  Could not seed plants:', err.message);
    }
  });
}

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use(['/auth', '/api/auth'], authRoutes);
app.use(['/profiles', '/api/profiles'], profileRoutes);
app.use(['/spaces', '/api/spaces'], spacesRoutes);
app.use(['/plants', '/api/plants'], plantsRoutes);
app.use(['/catalog', '/api/catalog'], plantsRoutes);
app.use(['/user-plants', '/api/user-plants'], userPlantsRoutes);
app.use(['/care-tasks', '/api/care-tasks'], careTasksRoutes);
app.use(['/calendar', '/api/calendar'], calendarRoutes);
app.use(['/dashboard', '/api/dashboard'], dashboardRoutes);
app.use(['/notifications', '/api/notifications'], notificationsRoutes); // 🔔 yaha mount

// 404
app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 7777;
app.listen(port, () => console.log('🚀 Server running on port ' + port));

module.exports = app;
