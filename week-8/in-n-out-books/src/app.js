/**
 * File: app.js
 * Author: Marshall Huckins
 * Date: 03/02/25
 * Description: Express application for In-N-Out-Books
 */

const express = require('express');
const bcrypt = require("bcryptjs");
const books = require('../database/books');
const users = require("../database/users");
const Ajv = require('ajv');


const ajv = new Ajv();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// GET /api/books - Return all books
app.get('/api/books', async (req, res) => {
    try {
        const allBooks = await books.find();
        res.json(allBooks);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/books/:id - Return a single book by ID
app.get('/api/books/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID must be a number' });
        }
        const book = await books.findOne({ id });
        res.json(book);
    } catch (error) {
        res.status(404).json({ error: 'Book not found' });
    }
});



// POST /api/books - Add a new book
app.post('/api/books', async (req, res) => {
    try {
        const { id, title, author } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Book title is required' });
        }

        await books.insert({ id, title, author });
        res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/books/:id - Update a book by ID
app.put('/api/books/:id', async (req, res) => {
  try {
      const id = Number(req.params.id);
      const { title, author } = req.body;

      // Validate ID
      if (isNaN(id)) {
          return res.status(400).json({ error: 'Input must be a number' });
      }

      // Validate title
      if (!title) {
          return res.status(400).json({ error: 'Bad Request' });
      }

      // Find the book in the database
      const book = await books.findOne({ id });
      if (!book) {
          return res.status(404).json({ error: 'Book not found' });
      }

      console.log("Before update:", book);

      // Attempt to update the book
      const updated = await books.updateOne({ id }, { title, author });

      console.log("After update:", await books.findOne({ id }));

      if (!updated) {
          return res.status(500).json({ error: 'Failed to update book' });
      }

      res.status(204).send(); // No Content
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/books/:id - Delete a book by ID
app.delete('/api/books/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        const deleted = await books.deleteOne({ id });

        if (!deleted) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET route for the root URL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>In-N-Out-Books</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                h1 { color: #2C3E50; }
                .section { margin: 20px auto; max-width: 600px; text-align: left; }
                footer { margin-top: 20px; font-size: 0.9em; color: #555; }
            </style>
        </head>
        <body>
            <header>
                <h1>Welcome to In-N-Out-Books!</h1>
                <p>Manage your book collection with ease.</p>
            </header>
            <main>
                <section class="section">
                    <h2>Top Selling Books</h2>
                    <ul>
                        <li>The Great Gatsby</li>
                        <li>To Kill a Mockingbird</li>
                        <li>1984</li>
                    </ul>
                </section>
                <section class="section">
                    <h2>Hours of Operation</h2>
                    <p>Monday - Friday: 9 AM - 8 PM</p>
                    <p>Saturday - Sunday: 10 AM - 6 PM</p>
                </section>
                <section class="section">
                    <h2>Contact Information</h2>
                    <p>Email: contact@in-n-out-books.com</p>
                    <p>Phone: (555) 123-4567</p>
                </section>
            </main>
            <footer>
                <p>&copy; 2025 In-N-Out-Books. All rights reserved.</p>
            </footer>
        </body>
        </html>
    `);
});


// POST /api/login - Authenticate a user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Bad Request: Email and password are required." });
    }

    // Find user in the collection
    const user = await users.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ message: "Authentication successful" });

  } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// JSON Schema for request validation
const securityQuestionSchema = {
  type: 'array',
  items: {
      type: 'object',
      properties: {
          answer: { type: 'string' }
      },
      required: ['answer'],
      additionalProperties: false
  }
};

const validate = ajv.compile(securityQuestionSchema);

// POST route to verify security questions
app.post('/api/users/:email/verify-security-question', async (req, res) => {
  try {
      console.log("Incoming request:", req.body);

      const { email } = req.params;

      // 🔍 Ensure that the user is retrieved correctly
      console.log("🔍 Searching for user with email:", email);
      console.log("Current users collection:", JSON.stringify(users, null, 2));

      const user = users.data.find(user => user.email === email);
      console.log("🔍 Found User:", JSON.stringify(user, null, 2));

      if (!user || !user.securityQuestions) {
          console.log("Error: No stored security questions found.");
          return res.status(401).json({ message: 'Unauthorized' }); 
      }

      if (!validate(req.body)) {
          console.log("AJV Validation Failed:", validate.errors);
          return res.status(400).json({ message: 'Bad Request', errors: validate.errors });
      }

      // 🔍 Fix: Make sure correctAnswers is retrieved properly
      const correctAnswers = user.securityQuestions || [];
      const providedAnswers = req.body;

      console.log("Stored Answers:", correctAnswers);
      console.log("Provided Answers:", providedAnswers);

      // 🔍 Ensure the array isn't empty before comparison
      if (correctAnswers.length === 0) {
          console.log("Error: No stored security questions found.");
          return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate the answers
      const isCorrect = correctAnswers.every((q, i) => q.answer === providedAnswers[i].answer);

      if (!isCorrect) {
          return res.status(401).json({ message: 'Unauthorized' });
      }

      res.status(200).json({ message: 'Security questions successfully answered' });

  } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 404 Middleware - Handle Not Found Errors
app.use((req, res, next) => {
  res.status(404).send('404 - Page Not Found');
});

// 500 Middleware - Handle Internal Server Errors
app.use((err, req, res, next) => {
  res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});


// Start the server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

