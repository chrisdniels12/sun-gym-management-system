// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const db = require('./database/db-connector');
const membersRouter = require('./routes/members');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set the view engine
app.set('view engine', 'hbs');

/*
    MEMBERS CRUD OPERATIONS
*/

// Use the members router for all /members routes
app.use('/members', membersRouter);

// Start server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});