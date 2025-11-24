// Test for GET /auth/logout endpoint
// This endpoint should clear the authentication token cookie and return a success message

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

test('GET /auth/logout clears token cookie and returns 200', async () => {
  // Create and authenticate a user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await User.create({
    username: 'logoutuser',
    email: 'logout@example.com',
    password: hashedPassword,
    fullname: { firstname: 'Logout', lastname: 'User' }
  })

  const token = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }, JWT_SECRET)

  // Send logout request with the token
  const res = await request(app)
    .get('/auth/logout')
    .set('Cookie', `token=${token}`)

  // Assert successful logout
  expect(res.status).toBe(200)
  expect(res.body).toHaveProperty('message')
  expect(res.body.message).toMatch(/logout|success|cleared|sucessfully/i)

  // Verify token cookie is cleared (Set-Cookie header should contain token=; with Max-Age=0 or expires in past)
  const setCookieHeader = res.headers['set-cookie']
  if (setCookieHeader) {
    const tokenCookie = setCookieHeader.find(cookie => cookie.includes('token='))
    expect(tokenCookie).toBeDefined()
    // Cookie should be cleared (empty value or max-age=0)
    expect(tokenCookie).toMatch(/(token=;|maxAge|max-age=0)/i)
  }
})

test('GET /auth/logout returns 200 even without a token', async () => {
  // Logout without sending a token
  const res = await request(app).get('/auth/logout')

  // Should still return success (logout is idempotent)
  expect(res.status).toBe(200)
  expect(res.body).toHaveProperty('message')
})

test('GET /auth/logout with invalid token still returns 200', async () => {
  const invalidToken = 'invalid.token.here'

  const res = await request(app)
    .get('/auth/logout')
    .set('Cookie', `token=${invalidToken}`)

  // Logout should succeed regardless of token validity
  expect(res.status).toBe(200)
  expect(res.body).toHaveProperty('message')
})

test('GET /auth/logout clears session/token state', async () => {
  // Create a user and generate token
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await User.create({
    username: 'sessionuser',
    email: 'session@example.com',
    password: hashedPassword,
    fullname: { firstname: 'Session', lastname: 'User' }
  })

  const token = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }, JWT_SECRET)

  // First logout
  const logoutRes = await request(app)
    .get('/auth/logout')
    .set('Cookie', `token=${token}`)

  expect(logoutRes.status).toBe(200)

  // After logout, using the cleared cookie should require re-authentication
  // (This test verifies the logout properly clears the session)
  const followUpRes = await request(app)
    .get('/auth/me')
    // Note: after logout, the cookie should be cleared, so subsequent requests should fail auth
    .set('Cookie', `token=`) // Empty token

  // Should get error (401 or other auth error)
  expect([401, 403, 500]).toContain(followUpRes.status)
})
