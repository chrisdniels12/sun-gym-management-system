const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all member-trainer relationships - Returns all training sessions
// Example: GET /api/member-trainer
router.get('/', async (req, res) => {
    try {
        // Query database for all training sessions with member and trainer details
        const [rows] = await db.query(`
            SELECT MT.*, 
                   M.firstName as memberFirstName, M.lastName as memberLastName,
                   T.firstName as trainerFirstName, T.lastName as trainerLastName
            FROM Member_Trainer MT
            JOIN Members M ON MT.memberID = M.memberID
            JOIN Trainers T ON MT.trainerID = T.trainerID
            ORDER BY MT.sessionDate DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new training session
// Example: POST /api/member-trainer
// Required body: { memberID: 1, trainerID: 2, sessionDate: "2024-01-15", duration: 60 }
router.post('/', async (req, res) => {
    // Extract session details from request body
    const { memberID, trainerID, sessionDate, duration } = req.body;
    try {
        // Insert new training session record
        const [result] = await db.query(
            'INSERT INTO Member_Trainer (memberID, trainerID, sessionDate, duration) VALUES (?, ?, ?, ?)',
            [memberID, trainerID, sessionDate, duration]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE training session
// Example: PUT /api/member-trainer/1
// Required body: { sessionDate: "2024-01-16", duration: 45 }
router.put('/:id', async (req, res) => {
    // Extract updated session details from request body
    const { sessionDate, duration } = req.body;
    try {
        // Update the session record with matching ID
        await db.query(
            'UPDATE Member_Trainer SET sessionDate=?, duration=? WHERE sessionID=?',
            [sessionDate, duration, req.params.id]
        );
        res.json({ message: 'Training session updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE training session
// Example: DELETE /api/member-trainer/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the session record with specified ID
        await db.query('DELETE FROM Member_Trainer WHERE sessionID=?', [req.params.id]);
        res.json({ message: 'Training session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
