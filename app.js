// Imports necessary modules
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

// Creates an instance of the Express application
const app = express();

// Serves static files from the 'public' directory, making them accessible via the web server.
app.use(express.static(path.join(__dirname, 'public')));

// Sets the directory for storing view templates (.pug files) to 'views'.
app.set('views', path.join(__dirname, 'views'));

// Sets the view engine to Pug, which is used to render HTML templates.
app.set('view engine', 'pug');

// Session Configuration
app.use(
  session({
    secret: 'tcgcards', 
    resave: true, 
    saveUninitialized: true
  })
);

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tcg cards',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Middleware to check if user is logged in
function checkLoggedIn(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    req.session.error = 'Please Login!';
    res.redirect('/login');
  }
}

const registerRoute = require('./routes/register')(db);
app.use(registerRoute);

const loginRoute = require('./routes/login')(db);
app.use(loginRoute);

const indexRoute = require('./routes/index')(db, checkLoggedIn);
app.use(indexRoute);

// Defines a route for the root URL ('/') and renders the 'index.pug' view with provided title and message.
app.get('/registration', (req, res) => { res.render('registration'); });
app.get('/index', (req, res) => { res.render('index'); });
app.get('/login', (req, res) => { res.render('login'); });

// Starts the server on port 3000 and logs a message to the console when the server is running.
app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});

module.exports = { app, db, checkLoggedIn };
