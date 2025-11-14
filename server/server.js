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

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(cookie());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plantmate');

// Seed default plants on startup
mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  try {
    const { seedPlants } = require('./seed/plants.seed');
    await seedPlants();
  } catch (err) {
    console.error('⚠️  Could not seed plants:', err.message);
  }
});

// simple health
app.get('/health', (_req, res) => res.json({ ok: true }));

/** Mount routes under BOTH legacy and /api prefixes to avoid 404s */
app.use(['/auth', '/api/auth'], authRoutes);
app.use(['/profiles', '/api/profiles'], profileRoutes);
app.use(['/spaces', '/api/spaces'], spacesRoutes);
app.use(['/plants', '/api/plants'], plantsRoutes);
app.use(['/catalog', '/api/catalog'], plantsRoutes); // Also mount plants catalog under /catalog
app.use(['/user-plants', '/api/user-plants'], userPlantsRoutes);
app.use(['/care-tasks', '/api/care-tasks'], careTasksRoutes);
app.use(['/calendar', '/api/calendar'], calendarRoutes);
app.use(['/dashboard', '/api/dashboard'], dashboardRoutes);

// 404 fallback (helps you see the exact missing path)
app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 7777;
app.listen(port, () => console.log('Server listening on ' + port));
