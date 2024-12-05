// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const db = require('./database/db-connector').pool;
const handlebars = require('express-handlebars');

// Add this near the top of app.js
const ONID = process.env.ONID || 'piercebe'; // Default for development
const BASE_PATH = `/~${ONID}/CS340/sun-gym-management-system`;
console.log('Current BASE_PATH:', BASE_PATH);

// Handlebars setup
const hbs = handlebars.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        formatTime: function (time) {
            // Convert time to HH:mm format
            return time ? time.slice(0, 5) : '';  // Takes only HH:mm part
        },
        toLowerCase: function (str) {
            return str ? str.toLowerCase() : '';
        }
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(`${BASE_PATH}`, express.static(path.join(__dirname, 'public')));

// Root route - serve index.html with BASE_PATH
app.get(`${BASE_PATH}`, (req, res) => {
    res.render('index', { basePath: BASE_PATH });
});

// Page routes (must come before API routes)
app.get(`${BASE_PATH}/trainers`, async (req, res) => {
    try {
        const [trainers] = await db.query('SELECT * FROM Trainers ORDER BY lastName, firstName');
        const [classesResult] = await db.query('SELECT COUNT(*) as count FROM Classes WHERE status = "active"');
        const activeClasses = classesResult[0].count;
        const availableTrainers = trainers.length;
        const avgClassLoad = activeClasses / (trainers.length || 1);

        res.render('trainers', {
            title: 'Manage Trainers',
            customCSS: 'trainers',
            customJS: 'trainerOperations',
            basePath: BASE_PATH,
            trainers: trainers,
            stats: {
                totalTrainers: trainers.length,
                activeClasses,
                availableTrainers,
                avgClassLoad: Math.round(avgClassLoad * 10) / 10
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading trainers');
    }
});

// API routes
app.use(`${BASE_PATH}/api/members`, require('./routes/members'));
app.use(`${BASE_PATH}/api/trainers`, require('./routes/trainers'));
app.use(`${BASE_PATH}/api/classes`, require('./routes/classes'));
app.use(`${BASE_PATH}/api/equipment`, require('./routes/equipment'));
app.use(`${BASE_PATH}/api/payments`, require('./routes/payments'));
app.use(`${BASE_PATH}/api/member-equipment`, require('./routes/member-equipment'));
app.use(`${BASE_PATH}/api/class-bookings`, require('./routes/class-bookings'));
app.use(`${BASE_PATH}/api/member-trainer`, require('./routes/member-trainer'));
app.use(`${BASE_PATH}/api/trainer-equipment`, require('./routes/trainer-equipment'));

// Test database connection
async function testDatabase() {
    try {
        const [rows] = await db.query('SELECT * FROM Members LIMIT 1');
        console.log('Database test query results:', rows);
        console.log('Database connection pool ready');
    } catch (error) {
        console.error('Database error:', error);
        console.error('Continuing despite database error - Please connect to OSU VPN');
    }
}

testDatabase();

// Start server
const PORT = 8997;  // Fixed port for OSU engr server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
