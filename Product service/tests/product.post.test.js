// Mock ImageKit to avoid real network calls
jest.mock('imagekit', () => {
  return jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockResolvedValue({ url: 'https://example.com/image.jpg' })
  }))
})

const request = require('supertest')
const app = require('../src/app')

describe('POST /products', () => {
  test('creates product with image upload', async () => {
    const res = await request(app)
      .post('/products')
      .field('title', 'Test Product')
      .field('price', '19.99')
      .attach('image', Buffer.from('fake-image-content'), 'test.jpg')

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('product')
    expect(res.body.product).toHaveProperty('image', 'https://example.com/image.jpg')
  })

  test('creates product without image', async () => {
    const res = await request(app)
      .post('/products')
      .send({ title: 'No Image', price: '5.00' })

    expect(res.status).toBe(201)
    expect(res.body.product.image).toBeNull()
  })
})
