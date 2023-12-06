const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

const getBooksPromise = () => {
  return new Promise((resolve, reject) => {
    // Simulating an asynchronous operation (e.g., fetching data from a database)
    setTimeout(() => {
      resolve(books); // Resolve the promise with the books data
    }, 2000); // Simulated delay of 2 seconds
  });
};

// Route to get books using the created promise
public_users.get("/", async (req, res) => {
  try {
    const booksData = await getBooksPromise(); // Await the promise result
    res.json(booksData); // Send the books data as JSON response
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch books" });
  }
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  findBookByISBN(isbn)
    .then((book) => {
      if (book) {
        res.json(book); // Send book details if found
      } else {
        res.status(404).json({ error: "Book not found!" }); // Send an error response if book is not found
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" }); // Handle errors
    });
});

function findBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    // Simulating book retrieval from database or external API using books object
    const book = books[isbn];
    if (book) {
      resolve(book); // Resolve with book details if found
    } else {
      reject("Book not found!"); // Reject with an error if book is not found
    }
  });
}

public_users.get("/author/:author", function (req, res) {
  const authorToFind = req.params.author;

  findBooksByAuthor(authorToFind)
    .then((booksByAuthor) => {
      if (booksByAuthor.length > 0) {
        res.json(booksByAuthor); // Sending books by the provided author as JSON response
      } else {
        res.status(404).json({ message: "No books found by this author" }); // Sending an error response if no books are found
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" }); // Handling errors
    });
});

function findBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const booksByAuthor = [];

    bookKeys.forEach((key) => {
      const book = books[key];
      if (book.author === author) {
        booksByAuthor.push(book);
      }
    });

    resolve(booksByAuthor); // Resolve with books by the provided author
  });
}

public_users.get("/title/:title", function (req, res) {
  const titleToFind = req.params.title;

  findBookByTitle(titleToFind)
    .then((foundBook) => {
      if (foundBook) {
        res.json(foundBook); // Sending the book details as JSON response
      } else {
        res.status(404).json({ message: "Book not found" }); // Sending an error response if the book is not found
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" }); // Handling errors
    });
});

function findBookByTitle(title) {
  return new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    let foundBook = null;

    bookKeys.forEach((key) => {
      const book = books[key];
      if (book.title.toLowerCase() === title.toLowerCase()) {
        foundBook = book;
      }
    });

    if (foundBook) {
      resolve(foundBook); // Resolve with book details if found
    } else {
      reject("Book not found"); // Reject with an error message if book not found
    }
  });
}

public_users.get("/review/:isbn", function (req, res) {
  const isbnToFind = req.params.isbn;
  const book = books[isbnToFind];

  if (book) {
    const reviews = book.reviews;
    res.json(reviews); // Sending the book reviews as JSON response
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
