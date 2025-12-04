// tests/integration/plants/plants.test.js
const request = require('supertest');
const app = require('../../../app');
const Plant = require('../../../models/Plant');
const User = require('../../../models/User');
const Space = require('../../../models/Space');
const { testUsers, testPlants, testSpaces } = require('../../fixtures/testData');
const jwt = require('jsonwebtoken');

describe('Plants API', () => {
  let authToken;
  let userId;
  let testSpace;

  beforeEach(async () => {
    // Clear the database before each test
    await Plant.deleteMany({});
    await User.deleteMany({});
    await Space.deleteMany({});

    // Create a test user
    const user = new User(testUsers.validUser);
    await user.save();
    userId = user._id;

    // Generate auth token
    authToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev');

    // Create test plants
    await Plant.create(testPlants.basil);
    await Plant.create(testPlants.tomato);

    // Create a test space
    testSpace = await Space.create({
      user_id: userId,
      ...testSpaces.validSpace
    });
  });

  describe('GET /api/plants', () => {
    it('should retrieve the plant catalog', async () => {
      const response = await request(app)
        .get('/api/plants')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('common_name');
      expect(response.body[1]).toHaveProperty('common_name');
    });

    it('should retrieve the plant catalog at alternative endpoint', async () => {
      const response = await request(app)
        .get('/api/plants/catalog')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/plants/suggestions', () => {
    it('should return plant suggestions for a space', async () => {
      const response = await request(app)
        .get(`/api/plants/suggestions?spaceId=${testSpace._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Both plants should match since basil works for 4-8 hours and tomato for 6-10 hours
      // and our space has 6 hours of sunlight
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('plant_slug');
        expect(response.body[0]).toHaveProperty('common_name');
        expect(response.body[0]).toHaveProperty('score');
        expect(response.body[0]).toHaveProperty('rationale');
      }
    });

    it('should return empty array for invalid space', async () => {
      const response = await request(app)
        .get('/api/plants/suggestions?spaceId=invalidId')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/api/plants/suggestions?spaceId=${testSpace._id}`)
        .expect(401);
    });
  });
});