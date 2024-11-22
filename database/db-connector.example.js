// ./database/db-connector.js

// Get an instance of mysql to use in the app
const mysql = require('mysql2/promise');

// Create a 'connection pool' using the provided credentials
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'classmysql.engr.oregonstate.edu',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
})
module.exports.pool = pool;