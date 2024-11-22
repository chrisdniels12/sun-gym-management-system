// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const path = require('path');
const db = require('./database/db-connector').pool;
const membersRouter = require('./routes/members');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Add base path constant
const BASE_PATH = '/~piercebe/CS340/sun-gym-management-system';

// Update your routes
app.get(`${BASE_PATH}/:page`, (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', 'html', `${page}.html`);

    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Root route
app.get(`${BASE_PATH}/`, (req, res) => {
    const filePath = path.join(__dirname, 'public', 'html', 'index.html');
    res.sendFile(filePath);
});

// Use the members router for all /members routes
app.use('/members', membersRouter);

// Add these routes
app.use('/api/members', require('./routes/members'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/member-equipment', require('./routes/member-equipment'));
app.use('/api/class-bookings', require('./routes/class-bookings'));
app.use('/api/member-trainer', require('./routes/member-trainer'));
app.use('/api/trainer-equipment', require('./routes/trainer-equipment'));

// Test the pool with a more specific query
db.query('SELECT * FROM Members LIMIT 1', (err, results) => {
    if (err) {
        console.error('Database error:', err);
        process.exit(1);
    }
    console.log('Database test query results:', results);
    console.log('Database connection pool ready');
});

// Start server
const PORT = process.env.PORT || 8999;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
