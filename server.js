import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

//dotenv is used to access the database password using process.env
dotenv.config();

//Setting up Express Server
const app = express();
const PORT = 3000;

//Using bodyParser to add body in requests
app.use(bodyParser.urlencoded({extended: true}));

//Telling express the location of public dir to store static files
app.use(express.static("public"));

//Configuring Database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book-list",
    password: process.env.password
});

db.connect();

async function getBookList() {
    try {
        const response = await db.query("SELECT * FROM books");
        return response.rows;
    } catch(err) {
        console.error("Error getting Book List from DB", err);
    }
}

async function getBook(bookId) {
    try {
        const response = await db.query("SELECT * FROM books WHERE id=$1", [bookId]);
        return response.rows[0];
    } catch(err) {
        console.error("Error getting Book from DB", err);
    }
}

//Setting up GET route at home
app.get("/", async (req, res) => {
    const bookList = await getBookList();
    res.render("index.ejs", {bookList: bookList});
});

app.post("/book", async (req, res) => {
    const bookId = req.body.bookid;
    const book = await getBook(bookId);
    res.render("book-notes.ejs", {book: book});
});

app.get("/new", (req, res) => {
    res.render("new.ejs");
});

app.post("/submit", async (req, res) => {
    const name = req.body.name, author = req.body.author, isbn = req.body.isbn, date = req.body.date, rating = parseInt(req.body.rating), summary = req.body.summary, notes = req.body.notes;
    try {
        await db.query(`INSERT INTO books (name, author, isbn, date, rating, summary, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7);`, 
        [name, author, isbn, date, rating, summary, notes]);
        res.redirect("/");
    } catch(err) {
        console.error("Error adding new Book in DB", err);
    }
});






app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`);
});
