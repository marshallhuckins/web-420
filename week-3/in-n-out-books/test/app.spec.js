const request = require('supertest');
const app = require('../src/app');

describe('Chapter 3.1: API Tests', () => {
  describe('GET /api/books', () => {
    it('Should return an array of books', async () => {
      const res = await request(app).get('/api/books');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/books/:id', () => {
    it('Should return a single book', async () => {
      const res = await request(app).get('/api/books/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('Should return a 400 error if the id is not a number', async () => {
      const res = await request(app).get('/api/books/not-a-number');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'ID must be a number');
    });
  });
});
