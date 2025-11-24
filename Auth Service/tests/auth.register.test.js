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
const app = require('../src/app')
const User = require('../src/models/user.model')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  process.env.MONGOOSE_URI = uri
  process.env.JWT_SECRATE = "test_jwt_secrate"

  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
   await mongoServer.stop() 
})

beforeEach(async () => {
  // clear users
  await User.deleteMany({})
})

test('POST /auth/register creates a user and returns 200', async () => {
  const payload = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullname: { firstname: 'Test', lastname: 'User' }
  }

  const res = await request(app).post('/auth/register').send(payload)
  // registration endpoint returns 201 Created on success
  expect(res.status).toBe(201)
  expect(res.body.user).toBeDefined()
  expect(res.body.user.username).toBe(payload.username)
  expect(res.body.user.email).toBe(payload.email)
  // password should not be returned
  expect(res.body.user.password).toBeUndefined()

  // ensure stored in DB
  const dbUser = await User.findOne({ username: payload.username }).select("+password").lean()
  console.log(dbUser)
  expect(dbUser).toBeTruthy()
  expect(dbUser.email).toBe(payload.email)

  // stored password should be hashed (not equal to plain)
  expect(dbUser.password).toBeDefined()
  expect(dbUser.password).not.toBe(payload.password)
})

test('should register a user', async () => {
  const response = await request(app)
    .post('/auth/register')
    .send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass',
      fullname: { firstname: 'Test', lastname: 'User' }
    })

  // expect 201 Created
  expect(response.status).toBe(201)
  expect(response.body).toHaveProperty('user')
})
