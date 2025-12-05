// tests/integration/dashboard/dashboard.test.js
const request = require('supertest');
const app = require('../../../app');
const CareTask = require('../../../models/CareTask');
const UserPlant = require('../../../models/UserPlant');
const Space = require('../../../models/Space');
const User = require('../../../models/User');
const Plant = require('../../../models/Plant');
const { testUsers, testSpaces, testPlants, testUserPlants } = require('../../fixtures/testData');
const jwt = require('jsonwebtoken');

describe('Dashboard API', () => {
  let authToken;
  let userId;
  let testSpace;
  let testPlant;
  let testUserPlant;

  beforeEach(async () => {
    // Clear the database before each test
    await CareTask.deleteMany({});
    await UserPlant.deleteMany({});
    await Space.deleteMany({});
    await User.deleteMany({});
    await Plant.deleteMany({});

    // Create a test user
    const user = new User(testUsers.validUser);
    await user.save();
    userId = user._id;

    // Generate auth token
    authToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev');

    // Create a test space
    testSpace = await Space.create({
      user_id: userId,
      ...testSpaces.validSpace
    });

    // Create test plant
    testPlant = await Plant.create(testPlants.basil);

    // Create a test user plant
    testUserPlant = await UserPlant.create({
      user_id: userId,
      space_id: testSpace._id,
      ...testUserPlants.validUserPlant,
      plant_slug: testPlant.slug
    });
  });

  describe('GET /api/dashboard/water-tasks', () => {
    it('should retrieve today\'s watering tasks for authenticated user', async () => {
      // Create a care task for today
      const dueDate = new Date();
      dueDate.setHours(10, 0, 0, 0); // Set to 10:00 AM today
      
      await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        type: 'water',
        due_at: dueDate,
        status: 'pending'
      });

      const response = await request(app)
        .get('/api/dashboard/water-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('waterTasks');
      expect(Array.isArray(response.body.waterTasks)).toBe(true);
      expect(response.body.waterTasks.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when user has no watering tasks today', async () => {
      // Create a care task for tomorrow
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(10, 0, 0, 0); // Set to 10:00 AM tomorrow
      
      await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        type: 'water',
        due_at: dueDate,
        status: 'pending'
      });

      const response = await request(app)
        .get('/api/dashboard/water-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('waterTasks');
      expect(Array.isArray(response.body.waterTasks)).toBe(true);
      expect(response.body.waterTasks).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/dashboard/water-tasks')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should retrieve dashboard statistics for authenticated user', async () => {
      // Create additional data for stats
      // Create another user plant
      await UserPlant.create({
        user_id: userId,
        space_id: testSpace._id,
        ...testUserPlants.validUserPlant2,
        plant_slug: testPlant.slug
      });

      // Create another space
      const testSpace2 = await Space.create({
        user_id: userId,
        ...testSpaces.validSpace2
      });

      // Create a care task for today
      const dueDate = new Date();
      dueDate.setHours(10, 0, 0, 0); // Set to 10:00 AM today
      
      await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        type: 'water',
        due_at: dueDate,
        status: 'pending'
      });

      // Create a care task for tomorrow
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(10, 0, 0, 0); // Set to 10:00 AM tomorrow
      
      await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        type: 'fertilize',
        due_at: tomorrowDate,
        status: 'pending'
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalPlants');
      expect(response.body).toHaveProperty('totalSpaces');
      expect(response.body).toHaveProperty('todayTasks');
      expect(response.body).toHaveProperty('upcomingTasks');
      
      expect(response.body.totalPlants).toBeGreaterThanOrEqual(2);
      expect(response.body.totalSpaces).toBeGreaterThanOrEqual(2);
      expect(response.body.todayTasks).toBeGreaterThanOrEqual(1);
      expect(response.body.upcomingTasks).toBeGreaterThanOrEqual(1);
    });

    it('should return zero counts when user has no additional data', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalPlants', 1); // We created one user plant in beforeEach
      expect(response.body).toHaveProperty('totalSpaces', 1); // We created one space in beforeEach
      expect(response.body).toHaveProperty('todayTasks', 0);
      expect(response.body).toHaveProperty('upcomingTasks', 0);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/dashboard/stats')
        .expect(401);
    });
  });
});