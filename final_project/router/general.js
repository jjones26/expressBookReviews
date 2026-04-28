const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL for self-referencing Axios calls.
// Adjust the port if your server runs on a different one.
const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
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

// Internal endpoint: returns the raw books object (used by Axios callers below)
public_users.get('/books-data', function (req, res) {
  res.status(200).json(books);
});

// Task 10: Get the book list available in the shop using Axios + async/await
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Axios + async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const allBooks = response.data;
    const book = allBooks[isbn];

    if (book) {
      res.status(200).send(JSON.stringify(book, null, 4));
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book", error: error.message });
  }
});

// Task 12: Get book details based on author using Axios + async/await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const allBooks = response.data;
    const all_isbns = Object.keys(allBooks);
    let filtered_books = [];

    all_isbns.forEach((isbn) => {
      if (allBooks[isbn].author === author) {
        filtered_books.push({
          "isbn": isbn,
          "title": allBooks[isbn].title,
          "reviews": allBooks[isbn].reviews
        });
      }
    });

    if (filtered_books.length > 0) {
      res.status(200).send(JSON.stringify(filtered_books, null, 4));
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Task 13: Get all books based on title using Axios + async/await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const allBooks = response.data;
    const all_isbns = Object.keys(allBooks);
    let filtered_books = [];

    all_isbns.forEach((isbn) => {
      if (allBooks[isbn].title === title) {
        filtered_books.push({
          "isbn": isbn,
          "author": allBooks[isbn].author,
          "reviews": allBooks[isbn].reviews
        });
      }
    });

    if (filtered_books.length > 0) {
      res.status(200).send(JSON.stringify(filtered_books, null, 4));
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
