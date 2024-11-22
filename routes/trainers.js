const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// Get all trainers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Trainers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new trainer
router.post('/', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, hireDate, specialization } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Trainers (firstName, lastName, email, phoneNumber, hireDate, specialization) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, phoneNumber, hireDate, specialization]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a trainer
router.put('/:id', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, specialization } = req.body;
    try {
        await db.query(
            'UPDATE Trainers SET firstName=?, lastName=?, email=?, phoneNumber=?, specialization=? WHERE trainerID=?',
            [firstName, lastName, email, phoneNumber, specialization, req.params.id]
        );
        res.json({ message: 'Trainer updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a trainer
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Trainers WHERE trainerID=?', [req.params.id]);
        res.json({ message: 'Trainer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;