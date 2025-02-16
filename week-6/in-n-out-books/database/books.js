/**
 * Author: Professor Krasso
 * Date: 4/1/2024
 * File Name: books.js
 * Description: Books collection file for the in-n-out-books application; used to store book data
 */

// Require the Collection class
const Collection = require("./collection");

// Array of book objects
const books = new Collection([
  { id: 1, title: "The Fellowship of the Ring", author: "J.R.R. Tolkien" },
  { id: 2, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling" },
  { id: 3, title: "The Two Towers", author: "J.R.R. Tolkien" },
  { id: 4, title: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling" },
  { id: 5, title: "The Return of the King", author: "J.R.R. Tolkien" },
]);

// Insert a new book into the collection
books.insert = function (book) {
    this.data.push(book); // Changed from this.items to this.data
};

// Delete a book by ID
books.deleteOne = function (query) {
    const index = this.data.findIndex(book => book.id === query.id); // Changed from this.items to this.data
    if (index !== -1) {
        this.data.splice(index, 1); // Changed from this.items to this.data
        return true;
    }
    return false;
};

module.exports = books; // export the books collection


