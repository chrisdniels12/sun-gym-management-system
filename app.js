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
    // Declare Query 1
    let query1;

    // If there is no query string, we just perform a basic SELECT
    if (req.query.lname === undefined) {
        query1 = "SELECT * FROM bsg_people;";
    }
    // If there is a query string, we assume this is a search, and return desired results
    else {
        query1 = `SELECT * FROM bsg_people WHERE lname LIKE "${req.query.lname}%"`;
    }

    // Query 2 is the same in both cases
    let query2 = "SELECT * FROM bsg_planets;";

    // Run the 1st query
    db.pool.query(query1, function (error, rows, fields) {

        // Save the people
        let people = rows;

        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {

            // Save the planets
            let planets = rows;

            // Construct an object for reference in the table
            let planetmap = {}
            planets.map(planet => {
                let id = parseInt(planet.id, 10);
                planetmap[id] = planet["name"];
            })

            // Overwrite the homeworld ID with the name of the planet in the people object
            people = people.map(person => {
                return Object.assign(person, { homeworld: planetmap[person.homeworld] || person.homeworld })
            })

            return res.render('index', { data: people, planets: planets });
        })
    })
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

app.post('/add-person-ajax', function (req, res) {
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Capture NULL values
    let homeworld = parseInt(data.homeworld);
    if (isNaN(homeworld)) {
        homeworld = 'NULL'
    }

    let age = parseInt(data.age);
    if (isNaN(age)) {
        age = 'NULL'
    }

    // Create the query and run it on the database
    query1 = `INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES ('${data.fname}', '${data.lname}', ${homeworld}, ${age})`;
    db.pool.query(query1, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else {
            // If there was no error, perform a SELECT * on bsg_people
            query2 = `SELECT * FROM bsg_people;`;
            db.pool.query(query2, function (error, rows, fields) {

                // If there was an error on the second query, send a 400
                if (error) {

                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else {
                    res.send(rows);
                }
            })
        }
    })
});

app.delete('/delete-person-ajax/', function (req, res, next) {
    let data = req.body;
    let personID = parseInt(data.id);
    let deleteBsg_Cert_People = `DELETE FROM bsg_cert_people WHERE pid = ?`;
    let deleteBsg_People = `DELETE FROM bsg_people WHERE id = ?`;

    // Run the 1st query
    db.pool.query(deleteBsg_Cert_People, [personID], function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            // Run the second query
            db.pool.query(deleteBsg_People, [personID], function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    })
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