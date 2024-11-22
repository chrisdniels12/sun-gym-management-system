const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all classes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Classes ORDER BY className');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new class
router.post('/', async (req, res) => {
    const { className, trainerID, schedule, capacity } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Classes (className, trainerID, schedule, capacity) VALUES (?, ?, ?, ?)',
            [className, trainerID, schedule, capacity]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE class
router.put('/:id', async (req, res) => {
    const { className, trainerID, schedule, capacity } = req.body;
    try {
        await db.query(
            'UPDATE Classes SET className=?, trainerID=?, schedule=?, capacity=? WHERE classID=?',
            [className, trainerID, schedule, capacity, req.params.id]
        );
        res.json({ message: 'Class updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE class
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Classes WHERE classID=?', [req.params.id]);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
