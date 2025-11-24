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
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const User = require('../src/models/user.model')

let mongoServer

// Set JWT_SECRATE for testing if not already set
process.env.JWT_SECRATE = process.env.JWT_SECRATE || 'test_secret_key'

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
})

beforeEach(async () => {
  await User.deleteMany({})
})

test('POST /auth/login authenticates a user and returns 200 with cookie', async () => {
  const plain = 'password123'
  const hashed = await bcrypt.hash(plain, 10)

  // create a user in the DB (simulate existing registered user)
  await User.create({
    username: 'loginuser',
    email: 'login@example.com',
    password: hashed,
    fullname: { firstname: 'Login', lastname: 'User' }
  })

  const res = await request(app)
    .post('/auth/login')
    .send({ username: 'loginuser', password: plain })

  // Debug: log response if it fails
  if (res.status !== 200) {
    console.log('Login response status:', res.status)
    console.log('Login response body:', res.body)
  }

  // Expected behavior: successful login returns 200 and a user payload
  expect(res.status).toBe(200)
  expect(res.body).toHaveProperty('user')
  expect(res.body.user.username).toBe('loginuser')

  // Login should set a token cookie (Set-Cookie header present)
  expect(res.headers['set-cookie']).toBeDefined()
})
