// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const path = require('path');
const db = require('./database/db-connector').pool;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use('/~piercebe/CS340/sun-gym-management-system', express.static(path.join(__dirname, 'public')));

// Root route
app.get('/~piercebe/CS340/sun-gym-management-system', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the members HTML page for /~piercebe/CS340/sun-gym-management-system/members
// Serve the members HTML page for /members
app.get('/~piercebe/CS340/sun-gym-management-system/members', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'html', 'members.html');
    res.sendFile(filePath);
});



// HTML routes
app.get('/~piercebe/CS340/sun-gym-management-system/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
});

// API routes
app.use('/~piercebe/CS340/sun-gym-management-system/api/members', require('./routes/members'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/trainers', require('./routes/trainers'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/classes', require('./routes/classes'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/equipment', require('./routes/equipment'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/payments', require('./routes/payments'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/member-equipment', require('./routes/member-equipment'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/class-bookings', require('./routes/class-bookings'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/member-trainer', require('./routes/member-trainer'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/trainer-equipment', require('./routes/trainer-equipment'));

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
