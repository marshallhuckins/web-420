const request = require('supertest');
const app = require('../src/app');
const books = require('../database/books');

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

describe('Chapter 5: API Tests', () => {
  beforeEach(() => {
      // Reset mock database before each test
      if (typeof books.setMockData === 'function') {
          books.setMockData([
              { id: 1, title: 'Book One', author: 'Author One' },
              { id: 2, title: 'Book Two', author: 'Author Two' }
          ]);
      }
  });

  test('Should update a book and return a 204 status code', async () => {
    const response = await request(app)
        .put('/api/books/1')
        .send({ title: 'Updated Book One', author: 'Author One' });

    expect(response.status).toEqual(204);

    // Fetch the updated book from the API instead of using books.find()
    const updatedBookResponse = await request(app).get('/api/books/1');
    expect(updatedBookResponse.body.title).toEqual('Updated Book One');
});

  test('Should return a 400-status code when using a non-numeric id', async () => {
      const response = await request(app)
          .put('/api/books/foo')
          .send({ title: 'New Title', author: 'Author' });

      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual('Input must be a number');
  });

  test('Should return a 400-status code when updating a book with a missing title', async () => {
      const response = await request(app)
          .put('/api/books/1')
          .send({ author: 'Updated Author' });

      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual('Bad Request');
  });
});

describe("Chapter 6: API Tests", () => {
  test("It should log a user in and return a 200-status with 'Authentication successful' message", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "harry@hogwarts.edu", password: "potter" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Authentication successful" });
  });

  test("It should return a 401-status code with 'Unauthorized' message when logging in with incorrect credentials", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "harry@hogwarts.edu", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" }); // ✅ Corrected
});


  test("It should return a 400-status code with 'Bad Request' when missing email or password", async () => {
    const response = await request(app).post("/api/login").send({ email: "harry@hogwarts.edu" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Bad Request: Email and password are required." });
  });
});

describe('Chapter 7: API Tests', () => {
  test('It should return a 200 status with “Security questions successfully answered” message', async () => {
      const response = await request(app)
          .post('/api/users/test@example.com/verify-security-question')
          .send([{ answer: 'correct-answer-1' }, { answer: 'correct-answer-2' }]);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Security questions successfully answered');
  });

  test('It should return a 400 status code with “Bad Request” message when the request body fails AJV validation', async () => {
      const response = await request(app)
          .post('/api/users/test@example.com/verify-security-question')
          .send([{ ans: 'incorrect-key' }]); // Invalid request format
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Bad Request');
  });

  test('It should return a 401 status code with “Unauthorized” message when the security questions are incorrect', async () => {
      const response = await request(app)
          .post('/api/users/test@example.com/verify-security-question')
          .send([{ answer: 'wrong-answer-1' }, { answer: 'wrong-answer-2' }]);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
  });
});

