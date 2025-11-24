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

// Helper: create user in DB and login to obtain cookie
async function createUserAndLogin(username = 'addruser') {
  const plain = 'password123'
  const hashed = await bcrypt.hash(plain, 10)

  await User.create({
    username,
    email: `${username}@example.com`,
    password: hashed,
    fullname: { firstname: 'Addr', lastname: 'User' }
  })

  const res = await request(app)
    .post('/auth/login')
    .send({ username, password: plain })

  expect(res.status).toBe(200)
  const cookie = res.headers['set-cookie']
  expect(cookie).toBeDefined()
  return cookie
}

describe('Addresses API (/auth/me/addresses)', () => {
  test('GET returns empty array when no addresses saved', async () => {
    const cookie = await createUserAndLogin()

    const res = await request(app)
      .get('/auth/me/addresses')
      .set('Cookie', cookie)

    // Expected: 200 and an array of addresses
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('addresses')
    expect(Array.isArray(res.body.addresses)).toBe(true)
    expect(res.body.addresses.length).toBe(0)
  })

  test('POST validates pincode and phone and adds address', async () => {
    const cookie = await createUserAndLogin('addrpost')

    // Invalid pincode (too short)
    let res = await request(app)
      .post('/auth/me/addresses')
      .set('Cookie', cookie)
      .send({ street: '1 Test St', city: 'City', state: 'ST', country: 'Country', pincode: '123', })

    expect(res.status).toBe(400)

    // Invalid phone (non-digit)
    res = await request(app)
      .post('/auth/me/addresses')
      .set('Cookie', cookie)
      .send({ street: '1 Test St', city: 'City', state: 'ST', country: 'Country', pincode: '123456', phone: 'abc' })

    expect(res.status).toBe(400)

    // Valid address
    res = await request(app)
      .post('/auth/me/addresses')
      .set('Cookie', cookie)
      .send({ street: '1 Test St', city: 'City', state: 'ST', country: 'Country', pincode: '123456', phone: '9876543210', isDefault: true })

    expect([200, 201]).toContain(res.status)
    expect(res.body).toHaveProperty('address')
    const address = res.body.address
    expect(address).toHaveProperty('street', '1 Test St')
    expect(address).toHaveProperty('pincode', '123456')
    expect(address).toHaveProperty('phone', '9876543210')
    // default should be marked when requested
    expect(address).toHaveProperty('isDefault')
  })

  test('DELETE removes an address', async () => {
    const cookie = await createUserAndLogin('addrdelete')

    // Add an address first
    let res = await request(app)
      .post('/auth/me/addresses')
      .set('Cookie', cookie)
      .send({ street: 'Remove St', city: 'City', state: 'ST', pincode: '999999', country: 'Country', })

    expect([200, 201]).toContain(res.status)
    const address = res.body.address || (res.body.addresses && res.body.addresses[0])
    expect(address).toBeDefined()
    const addressId = address._id || address.id
    expect(addressId).toBeDefined()

    // Now delete
    res = await request(app)
      .delete(`/auth/me/addresses/${addressId}`)
      .set('Cookie', cookie)

    expect([200,204]).toContain(res.status)
  })
})
