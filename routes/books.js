let express = require("express");
let router = express.Router();
let dbCon = require("../lib/db.js");
const { format, parseISO } = require("date-fns");

// display books
router.get("/", (req, res, next) => {
  dbCon.query("SELECT * FROM books ORDER BY id ", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.redirect("books", { data: "" });
    } else {
      res.render("books", {
         data: rows

        });
    }
  });
});


//display add books page
router.get("/add", (req, res, next) => {
  res.render("books/add", {
    name: "",
    author: "",
  });
});

//add books
router.post("/add", (req, res, next) => {
  let name = req.body.name;
  let author = req.body.author;
  let errors = false;

  if (name.length === 0 || author.length === 0) {
    errors = true;
    //set flash message
    req.flash("error", "Please enter name and author");
    // render to add.rjs
    res.render("books/add", {
      name: name,
      author: author,
    });
  }

  //if no error
  if (!errors) {
    let form_data = {
      name: name,
      author: author,
    };

    //insert query
    dbCon.query("INSERT INTO books SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);

        res.render("books/add", {
          name: form_data.name,
          author: form_data.author,
        });
      } else {
        req.flash("success", "Book successfully added");
        res.redirect("/books");
      }
    });
  }
});

// display edit books page
router.get("/edit/:id", (req, res, next) => {
  let id = req.params.id;

  // Use prepared statement to avoid SQL Injection
  dbCon.query("SELECT * FROM books WHERE id = ?", [id], (err, rows, fields) => {
    if (err) {
      // Handle database error
      console.error(err);
      return res.status(500).send("Database error occurred.");
    }

    if (rows.length <= 0) {
      req.flash("error", "Book not found with id =" + id);
      return res.redirect("/books");
    } else {
      res.render("books/edit", {
        title: "Edit book",
        id: rows[0].id,
        name: rows[0].name,
        author: rows[0].author,
      });
    }
  });
});

// Update books page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let name = req.body.name;
  let author = req.body.author;
  let errors = false;

  if (name.length === 0 || author.length === 0) {
    errors = true;
    req.flash("error", "Please enter name and author");
    res.render("books/edit", {
      id: id,
      name: name,
      author: author,
    });
  }
  // If no error
  if (!errors) {
    let form_data = {
      name: name,
      author: author,
    };
    // Update query
    dbCon.query(
      "UPDATE books SET ? WHERE id = ?",
      [form_data, id],
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("books/edit", {
            id: id,
            name: form_data.name,
            author: form_data.author,
          });
        } else {
          req.flash("success", "Book successfully updated");
          res.redirect("/books");
        }
      }
    );
  }
});

// Delete book data
router.get("/delete/:id", (req, res, next) => {
  let id = req.params.id;

  // Delete query
  dbCon.query("DELETE FROM books WHERE id = ?", [id], (err, result) => {
    if (err) {
      req.flash("error", err);
      res.redirect("/books");
    } else {
      req.flash("success", "Book successfully deleted ID = " + id);
      res.redirect("/books");
    }
  });
});

module.exports = router;
