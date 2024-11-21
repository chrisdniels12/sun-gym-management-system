// App.js

/*
    SETUP
*/
var express = require('express');   // Express library for the web server
var app = express();            // Instantiate an express object to interact with the server
const PORT = process.env.PORT || 9999;

// Database
var db = require('./database/db-connector')

/*
    ROUTES
*/
app.get('/', function (req, res) {
    // Define our queries
    query1 = 'DROP TABLE IF EXISTS diagnostic;';
    query2 = 'CREATE TABLE diagnostic(id INT PRIMARY KEY AUTO_INCREMENT, text VARCHAR(255) NOT NULL);';
    query3 = 'INSERT INTO diagnostic (text) VALUES ("MySQL is working for piercebe!")';
    query4 = 'SELECT * FROM diagnostic;';

    // Execute every query in an asynchronous manner, we want each query to finish before the next one starts

    // DROP TABLE...
    db.pool.query(query1, function (err, results, fields) {
        if (err) {
            console.error("Error in query 1:", err);
            res.status(500).send("Error in query 1: " + err.message);
            return;
        }
        // CREATE TABLE...
        db.pool.query(query2, function (err, results, fields) {
            if (err) {
                console.error("Error in query 2:", err);
                res.status(500).send("Error in query 2: " + err.message);
                return;
            }
            // INSERT INTO...
            db.pool.query(query3, function (err, results, fields) {
                if (err) {
                    console.error("Error in query 3:", err);
                    res.status(500).send("Error in query 3: " + err.message);
                    return;
                }
                // SELECT *...
                db.pool.query(query4, function (err, results, fields) {
                    if (err) {
                        console.error("Error in query 4:", err);
                        res.status(500).send("Error in query 4: " + err.message);
                        return;
                    }
                    // Send the results to the browser
                    res.send(JSON.stringify(results));
                });
            });
        });
    });
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