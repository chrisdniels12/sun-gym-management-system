// App.js

/*
    SETUP
*/
var express = require('express');   // Express library for the web server
var app = express();            // Instantiate an express object to interact with the server
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({ extname: ".hbs" }));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.
const PORT = process.env.PORT || 9999;

// Database
var db = require('./database/db-connector')

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

/*
    ROUTES
*/
app.get('/', function (req, res) {
    let query1 = "SELECT * FROM bsg_people;";               // Define our query

    db.pool.query(query1, function (error, rows, fields) {    // Execute the query
        // If there was an error on the query, log it and send an error message
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else {
            // If the query was successful, render the page with the data
            res.render('index', { data: rows });              // Render the index.hbs file, and also send the renderer
        }                                                   // an object where 'data' is equal to the 'rows' we
    })                                                      // received back from the query
});

app.post('/add-person-form', function (req, res) {
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Capture NULL values
    let homeworld = parseInt(data['input-homeworld']);
    if (isNaN(homeworld)) {
        homeworld = 'NULL'
    }

    let age = parseInt(data['input-age']);
    if (isNaN(age)) {
        age = 'NULL'
    }

    // Create the query and run it on the database
    query1 = `INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES ('${data['input-fname']}', '${data['input-lname']}', ${homeworld}, ${age})`;
    db.pool.query(query1, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else {
            res.redirect('/');
        }
    })
})

/*
    LISTENER
*/
function startServer(port) {
    const server = app.listen(port, '0.0.0.0', function (err) {
        if (err) {
            console.error("Error starting server:", err);
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is in use, trying ${port + 1}...`);
                startServer(port + 1);
            } else {
                process.exit(1);
            }
        } else {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`To access from another device on the same network, use http://<your-ip-address>:${port}`);
        }
    });

    server.on('error', function (e) {
        if (e.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            server.close();
            startServer(port + 1);
        } else {
            console.error("Server error:", e);
        }
    });
}

startServer(PORT);