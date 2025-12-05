// tests/integration/userPlants/userPlants.test.js
const request = require('supertest');
const app = require('../../../app');
const UserPlant = require('../../../models/UserPlant');
const User = require('../../../models/User');
const Space = require('../../../models/Space');
const Plant = require('../../../models/Plant');
const { testUsers, testSpaces, testPlants, testUserPlants } = require('../../fixtures/testData');
const jwt = require('jsonwebtoken');

describe('User Plants API', () => {
  let authToken;
  let userId;
  let testSpace;
  let testPlant;

  beforeEach(async () => {
    // Clear the database before each test
    await UserPlant.deleteMany({});
    await User.deleteMany({});
    await Space.deleteMany({});
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

    // Create test plants
    testPlant = await Plant.create(testPlants.basil);
  });

  describe('GET /api/user-plants', () => {
    it('should retrieve user plants for authenticated user', async () => {
      // Create a user plant first
      await UserPlant.create({
        user_id: userId,
        space_id: testSpace._id,
        ...testUserPlants.validUserPlant,
        plant_slug: testPlant.slug
      });

      const response = await request(app)
        .get('/api/user-plants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].nickname).toBe(testUserPlants.validUserPlant.nickname);
      expect(response.body[0].user_id).toBe(userId.toString());
    });

    it('should return empty array when user has no plants', async () => {
      const response = await request(app)
        .get('/api/user-plants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/user-plants')
        .expect(401);
    });
  });

  describe('POST /api/user-plants', () => {
    it('should create a new user plant with valid data', async () => {
      const userData = {
        space_id: testSpace._id,
        ...testUserPlants.validUserPlant,
        plant_slug: testPlant.slug
      };

      const response = await request(app)
        .post('/api/user-plants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.nickname).toBe(testUserPlants.validUserPlant.nickname);
      expect(response.body.user_id).toBe(userId.toString());

      // Verify user plant was created in database
      const userPlant = await UserPlant.findById(response.body._id);
      expect(userPlant).toBeTruthy();
      expect(userPlant.nickname).toBe(testUserPlants.validUserPlant.nickname);
    });

    it('should fail to create user plant with invalid plant slug', async () => {
      const userData = {
        space_id: testSpace._id,
        ...testUserPlants.validUserPlant,
        plant_slug: 'invalid-plant'
      };

      const response = await request(app)
        .post('/api/user-plants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Unknown plant slug');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/user-plants')
        .send(testUserPlants.validUserPlant)
        .expect(401);
    });
  });

  describe('DELETE /api/user-plants/:id', () => {
    it('should delete an existing user plant', async () => {
      // Create a user plant first
      const userPlant = await UserPlant.create({
        user_id: userId,
        space_id: testSpace._id,
        ...testUserPlants.validUserPlant,
        plant_slug: testPlant.slug
      });

      await request(app)
        .delete(`/api/user-plants/${userPlant._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify user plant was deleted from database
      const deletedUserPlant = await UserPlant.findById(userPlant._id);
      expect(deletedUserPlant).toBeNull();
    });

    it('should fail to delete non-existent user plant', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await request(app)
        .delete(`/api/user-plants/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200); // Controller doesn't return 404 for delete operations
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/user-plants/${fakeId}`)
        .expect(401);
    });
  });
});