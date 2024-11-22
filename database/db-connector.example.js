const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'classmysql.engr.oregonstate.edu',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
});
module.exports.pool = pool;