// tests/integration/spaces/spaces.test.js
const request = require('supertest');
const app = require('../../../app');
const Space = require('../../../models/Space');
const User = require('../../../models/User');
const { testUsers, testSpaces } = require('../../fixtures/testData');
const jwt = require('jsonwebtoken');
describe('Spaces API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Clear the database before each test
    await Space.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const user = new User(testUsers.validUser);
    await user.save();
    userId = user._id;

    // Generate auth token
    authToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev');
  });

  describe('GET /api/spaces', () => {
    it('should retrieve spaces for authenticated user', async () => {
      // Create a test space
      await Space.create({
        user_id: userId,
        ...testSpaces.validSpace
      });

      const response = await request(app)
        .get('/api/spaces')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(testSpaces.validSpace.name);
      expect(response.body[0].user_id).toBe(userId.toString());
    });

    it('should return empty array when user has no spaces', async () => {
      const response = await request(app)
        .get('/api/spaces')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/spaces')
        .expect(401);
    });
  });

  describe('POST /api/spaces', () => {
    it('should create a new space with valid data', async () => {
      const response = await request(app)
        .post('/api/spaces')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testSpaces.validSpace)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(testSpaces.validSpace.name);
      expect(response.body.user_id).toBe(userId.toString());

      // Verify space was created in database
      const space = await Space.findById(response.body._id);
      expect(space).toBeTruthy();
      expect(space.name).toBe(testSpaces.validSpace.name);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/spaces')
        .send(testSpaces.validSpace)
        .expect(401);
    });
  });

  describe('PUT /api/spaces/:id', () => {
    it('should update an existing space', async () => {
      // Create a space first
      const space = await Space.create({
        user_id: userId,
        ...testSpaces.validSpace
      });

      const updatedData = {
        name: 'Updated Balcony',
        notes: 'Now with more plants'
      };

      const response = await request(app)
        .put(`/api/spaces/${space._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.notes).toBe(updatedData.notes);

      // Verify space was updated in database
      const updatedSpace = await Space.findById(space._id);
      expect(updatedSpace.name).toBe(updatedData.name);
      expect(updatedSpace.notes).toBe(updatedData.notes);
    });

    it('should fail to update non-existent space', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await request(app)
        .put(`/api/spaces/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testSpaces.validSpace2)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .put(`/api/spaces/${fakeId}`)
        .send(testSpaces.validSpace2)
        .expect(401);
    });
  });

  describe('DELETE /api/spaces/:id', () => {
    it('should delete an existing space', async () => {
      // Create a space first
      const space = await Space.create({
        user_id: userId,
        ...testSpaces.validSpace
      });

      await request(app)
        .delete(`/api/spaces/${space._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify space was deleted from database
      const deletedSpace = await Space.findById(space._id);
      expect(deletedSpace).toBeNull();
    });

    it('should fail to delete non-existent space', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await request(app)
        .delete(`/api/spaces/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/spaces/${fakeId}`)
        .expect(401);
    });
  });
});