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

/*
    ROUTES
*/
// app.js

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