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

// Root route - serve index.html
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'html', 'index.html');
    console.log('Attempting to serve:', filePath);

    // Check if file exists
    if (require('fs').existsSync(filePath)) {
        console.log('File exists!');
        res.sendFile(filePath);
    } else {
        console.log('File not found!');
        res.status(404).send('index.html not found');
    }
});

// Add a test route
app.get('/test', (req, res) => {
    res.send('Server is working!');
});

// Use the members router for all /members routes
app.use('/members', membersRouter);

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
