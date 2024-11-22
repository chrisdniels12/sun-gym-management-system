const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all classes - Returns a list of all gym classes sorted by name
// Example: GET /api/classes
router.get('/', async (req, res) => {
    try {
        // Query database for all classes, sort them alphabetically by class name
        const [rows] = await db.query('SELECT * FROM Classes ORDER BY className');
        res.json(rows);
    } catch (error) {
        // If there's an error, return a 500 status code and the error message
        res.status(500).json({ error: error.message });
    }
});

// CREATE new class - Adds a new class to the system
// Example: POST /api/classes
// Required body: { className: "Yoga", trainerID: 1, schedule: "Monday 9AM", capacity: 20 }
router.post('/', async (req, res) => {
    // Extract class details from request body
    const { className, trainerID, schedule, capacity } = req.body;
    try {
        // Insert new class into database with provided details
        const [result] = await db.query(
            'INSERT INTO Classes (className, trainerID, schedule, capacity) VALUES (?, ?, ?, ?)',
            [className, trainerID, schedule, capacity]
        );
        // Return the ID of the newly created class
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE class - Modifies an existing class's details
// Example: PUT /api/classes/1
// Required body: { className: "Advanced Yoga", trainerID: 2, schedule: "Tuesday 10AM", capacity: 15 }
router.put('/:id', async (req, res) => {
    // Extract updated class details from request body
    const { className, trainerID, schedule, capacity } = req.body;
    try {
        // Update the class with matching ID with new details
        await db.query(
            'UPDATE Classes SET className=?, trainerID=?, schedule=?, capacity=? WHERE classID=?',
            [className, trainerID, schedule, capacity, req.params.id]
        );
        res.json({ message: 'Class updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE class - Removes a class from the system
// Example: DELETE /api/classes/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the class with the specified ID from database
        await db.query('DELETE FROM Classes WHERE classID=?', [req.params.id]);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
