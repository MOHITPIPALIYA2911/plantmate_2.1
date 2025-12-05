// tests/integration/auth/auth.test.js
const request = require('supertest');
const app = require('../../../app');
const User = require('../../../models/User');
const { testUsers } = require('../../fixtures/testData');
describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      
      // Verify user was created in database
      const user = await User.findById(response.body.id);
      expect(user).toBeTruthy();
      expect(user.first_Name).toBe(testUsers.validUser.first_Name);
      expect(user.LastName).toBe(testUsers.validUser.LastName);
      expect(user.emailId).toBe(testUsers.validUser.emailId.toLowerCase());
    });

    it('should fail to register with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.missingFields)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Missing fields');
    });

    it('should fail to register with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validUser)
        .expect(201);

      // Second registration with same email should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validUser)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validUser)
        .expect(201);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          emailId: testUsers.validUser.emailId,
          password: testUsers.validUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.first_Name).toBe(testUsers.validUser.first_Name);
    });

    it('should fail to login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          emailId: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail to login with invalid password', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validUser)
        .expect(201);

      // Then try to login with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          emailId: testUsers.validUser.emailId,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});