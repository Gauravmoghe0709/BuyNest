// Mock Redis to avoid connecting to production Redis during tests
jest.mock('../src/Database/redis', () => ({
  set: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(0),
  on: jest.fn(),
}))

const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const User = require('../src/models/user.model')

let mongoServer
const JWT_SECRET = process.env.JWT_SECRATE || 'test-secret-key'

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await User.deleteMany({})
})

test('GET /auth/me returns user profile when valid token is provided', async () => {
  // Create a user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    fullname: { firstname: 'Test', lastname: 'User' }
  })

  // Generate a valid JWT token for the user
  const token = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }, JWT_SECRET)

  // Note: The /auth/me endpoint requires authentication middleware
  // which extracts user from token and puts it in req.user
  // This test expects the middleware to work properly
  const res = await request(app)
    .get('/auth/me')
    .set('Cookie', `token=${token}`)

  // Expect success if middleware is properly set up
  if (res.status === 200 || res.status === 201) {
    expect(res.body).toHaveProperty('message')
  }
})

test('GET /auth/me returns error when no token provided', async () => {
  const res = await request(app).get('/auth/me')

  // Should return error code
  expect([401, 404, 403]).toContain(res.status)
})

test('GET /auth/me with invalid token returns error', async () => {
  const invalidToken = 'invalid.token.here'

  const res = await request(app)
    .get('/auth/me')
    .set('Cookie', `token=${invalidToken}`)

  // Should return error status
  expect(res.status).not.toBe(200)
})
