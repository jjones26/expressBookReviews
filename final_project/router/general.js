const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      // Check if user already exists
      const exists = users.filter((user) => user.username === username);
      if (exists.length === 0) {
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
      } else {
        return res.status(404).json({ message: "User already exists!" });
      }
    }
    return res.status(404).json({ message: "Unable to register user." });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});


  

 // Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const all_isbns = Object.keys(books); // Get all ISBNs (keys)
    let books_by_author = [];
  
    all_isbns.forEach((isbn) => {
      if (books[isbn]["author"] === author) {
        books_by_author.push({
          "isbn": isbn,
          "title": books[isbn]["title"],
          "reviews": books[isbn]["reviews"]
        });
      }
    });
  
    if (books_by_author.length > 0) {
      res.send(JSON.stringify(books_by_author, null, 4));
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  });


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const all_isbns = Object.keys(books);
    let books_by_title = [];
  
    all_isbns.forEach((isbn) => {
      if (books[isbn]["title"] === title) {
        books_by_title.push({
          "isbn": isbn,
          "author": books[isbn]["author"],
          "reviews": books[isbn]["reviews"]
        });
      }
    });
  
    if (books_by_title.length > 0) {
      res.send(JSON.stringify(books_by_title, null, 4));
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  });



// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.send(JSON.stringify(book.reviews, null, 4));
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Retrieve ISBN from request parameters
    const book = books[isbn]; // Look up the book in your books database
  
    if (book) {
      res.send(JSON.stringify(book, null, 4));
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });

module.exports.general = public_users;
