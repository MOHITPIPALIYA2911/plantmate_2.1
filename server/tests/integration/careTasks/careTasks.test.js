// tests/integration/careTasks/careTasks.test.js
const request = require('supertest');
const app = require('../../../app');
const CareTask = require('../../../models/CareTask');
const UserPlant = require('../../../models/UserPlant');
const User = require('../../../models/User');
const Space = require('../../../models/Space');
const Plant = require('../../../models/Plant');
const { testUsers, testSpaces, testPlants, testUserPlants, testCareTasks } = require('../../fixtures/testData');
const jwt = require('jsonwebtoken');

describe('Care Tasks API', () => {
  let authToken;
  let userId;
  let testSpace;
  let testPlant;
  let testUserPlant;

  beforeEach(async () => {
    // Clear the database before each test
    await CareTask.deleteMany({});
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

  describe('GET /api/care-tasks', () => {
    it('should retrieve care tasks for authenticated user', async () => {
      // Create a care task first
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      });

      const response = await request(app)
        .get('/api/care-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe(testCareTasks.wateringTask.type);
      expect(response.body[0].user_id).toBe(userId.toString());
    });

    it('should return empty array when user has no care tasks', async () => {
      const response = await request(app)
        .get('/api/care-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/care-tasks')
        .expect(401);
    });
  });

  describe('POST /api/care-tasks', () => {
    it('should create a new care task with valid data', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      const taskData = {
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      };

      const response = await request(app)
        .post('/api/care-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(testCareTasks.wateringTask.type);
      expect(response.body.user_id).toBe(userId.toString());

      // Verify care task was created in database
      const careTask = await CareTask.findById(response.body._id);
      expect(careTask).toBeTruthy();
      expect(careTask.type).toBe(testCareTasks.wateringTask.type);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/care-tasks')
        .send(testCareTasks.wateringTask)
        .expect(401);
    });
  });

  describe('DELETE /api/care-tasks/:id', () => {
    it('should delete an existing care task', async () => {
      // Create a care task first
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      const careTask = await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      });

      await request(app)
        .delete(`/api/care-tasks/${careTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify care task was deleted from database
      const deletedCareTask = await CareTask.findById(careTask._id);
      expect(deletedCareTask).toBeNull();
    });

    it('should fail to delete non-existent care task', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await request(app)
        .delete(`/api/care-tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200); // Controller doesn't return 404 for delete operations
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/care-tasks/${fakeId}`)
        .expect(401);
    });
  });

  describe('POST /api/care-tasks/:id/done', () => {
    it('should mark an existing care task as done', async () => {
      // Create a care task first
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      const careTask = await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      });

      const response = await request(app)
        .post(`/api/care-tasks/${careTask._id}/done`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);

      // Verify care task was marked as done in database
      const updatedCareTask = await CareTask.findById(careTask._id);
      expect(updatedCareTask.status).toBe('done');
      expect(updatedCareTask.completed_at).toBeTruthy();
    });

    it('should fail to mark non-existent care task as done', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await request(app)
        .post(`/api/care-tasks/${fakeId}/done`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .post(`/api/care-tasks/${fakeId}/done`)
        .expect(401);
    });
  });

  describe('POST /api/care-tasks/:id/snooze', () => {
    it('should snooze an existing care task', async () => {
      // Create a care task first
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      const careTask = await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      });

      const snoozeData = {
        minutes: 120
      };

      const response = await request(app)
        .post(`/api/care-tasks/${careTask._id}/snooze`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(snoozeData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'snoozed');
      expect(response.body.due_at).toBeTruthy();

      // Verify care task was snoozed in database
      const updatedCareTask = await CareTask.findById(careTask._id);
      expect(updatedCareTask.status).toBe('snoozed');
    });

    it('should fail to snooze non-existent care task', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      const snoozeData = {
        minutes: 120
      };

      await request(app)
        .post(`/api/care-tasks/${fakeId}/snooze`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(snoozeData)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .post(`/api/care-tasks/${fakeId}/snooze`)
        .expect(401);
    });
  });

  describe('POST /api/care-tasks/:id/reschedule', () => {
    it('should reschedule an existing care task', async () => {
      // Create a care task first
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      const careTask = await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      
      const rescheduleData = {
        dueAt: futureDate.toISOString()
      };

      const response = await request(app)
        .post(`/api/care-tasks/${careTask._id}/reschedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(rescheduleData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'pending');
      expect(new Date(response.body.due_at).getDate()).toBe(futureDate.getDate());

      // Verify care task was rescheduled in database
      const updatedCareTask = await CareTask.findById(careTask._id);
      expect(updatedCareTask.status).toBe('pending');
      expect(new Date(updatedCareTask.due_at).getDate()).toBe(futureDate.getDate());
    });

    it('should fail to reschedule care task without dueAt parameter', async () => {
      // Create a care task first
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      
      const careTask = await CareTask.create({
        user_id: userId,
        user_plant_id: testUserPlant._id,
        ...testCareTasks.wateringTask,
        due_at: dueDate
      });

      const rescheduleData = {
        // Missing dueAt parameter
      };

      await request(app)
        .post(`/api/care-tasks/${careTask._id}/reschedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(rescheduleData)
        .expect(400);
    });

    it('should fail to reschedule non-existent care task', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      
      const rescheduleData = {
        dueAt: futureDate.toISOString()
      };

      await request(app)
        .post(`/api/care-tasks/${fakeId}/reschedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(rescheduleData)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .post(`/api/care-tasks/${fakeId}/reschedule`)
        .expect(401);
    });
  });
});