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

describe('Chapter 4: API Tests', () => {
  test('Should return a 201-status code when adding a new book', async () => {
      const response = await request(app)
          .post('/api/books')
          .send({ id: 1, title: 'Test Book', author: 'John Doe' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Book added successfully');
  });

  test('Should return a 400-status code when adding a new book with missing title', async () => {
      const response = await request(app)
          .post('/api/books')
          .send({ id: 2, author: 'Jane Doe' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Book title is required');
  });

  test('Should return a 204-status code when deleting a book', async () => {
      // First, add a book to ensure it exists
      await request(app)
          .post('/api/books')
          .send({ id: 3, title: 'Delete Me', author: 'Author' });

      // Then, delete the book
      const response = await request(app).delete('/api/books/3');

      expect(response.status).toBe(204);
  });
});