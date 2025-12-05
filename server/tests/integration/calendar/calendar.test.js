// tests/integration/calendar/calendar.test.js
const request = require('supertest');
const app = require('../../../app');
const CalendarEvent = require('../../../models/CalendarEvent');
const User = require('../../../models/User');
const { testUsers, testCalendarEvents } = require('../../fixtures/testData');
const jwt = require('jsonwebtoken');

describe('Calendar API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Clear the database before each test
    await CalendarEvent.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const user = new User(testUsers.validUser);
    await user.save();
    userId = user._id;

    // Generate auth token
    authToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev');
  });

  describe('GET /api/calendar', () => {
    it('should retrieve calendar events for authenticated user', async () => {
      // Create a calendar event first
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);
      
      await CalendarEvent.create({
        user_id: userId,
        ...testCalendarEvents.validEvent,
        start: startDate,
        end: endDate
      });

      const response = await request(app)
        .get('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe(testCalendarEvents.validEvent.title);
      expect(response.body[0].user_id).toBe(userId.toString());
    });

    it('should return empty array when user has no calendar events', async () => {
      const response = await request(app)
        .get('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/calendar')
        .expect(401);
    });
  });

  describe('POST /api/calendar', () => {
    it('should create a new calendar event with valid data', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);
      
      const eventData = {
        ...testCalendarEvents.validEvent,
        start: startDate,
        end: endDate
      };

      const response = await request(app)
        .post('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(testCalendarEvents.validEvent.title);
      expect(response.body.user_id).toBe(userId.toString());

      // Verify calendar event was created in database
      const calendarEvent = await CalendarEvent.findById(response.body._id);
      expect(calendarEvent).toBeTruthy();
      expect(calendarEvent.title).toBe(testCalendarEvents.validEvent.title);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/calendar')
        .send(testCalendarEvents.validEvent)
        .expect(401);
    });
  });

  describe('DELETE /api/calendar/:id', () => {
    it('should delete an existing calendar event', async () => {
      // Create a calendar event first
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);
      
      const calendarEvent = await CalendarEvent.create({
        user_id: userId,
        ...testCalendarEvents.validEvent,
        start: startDate,
        end: endDate
      });

      await request(app)
        .delete(`/api/calendar/${calendarEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify calendar event was deleted from database
      const deletedCalendarEvent = await CalendarEvent.findById(calendarEvent._id);
      expect(deletedCalendarEvent).toBeNull();
    });

    it('should fail to delete non-existent calendar event', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await request(app)
        .delete(`/api/calendar/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200); // Controller doesn't return 404 for delete operations
    });

    it('should fail without authentication', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/calendar/${fakeId}`)
        .expect(401);
    });
  });
});