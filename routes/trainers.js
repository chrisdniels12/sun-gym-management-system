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
    const { firstName, lastName, email, phoneNumber, specialization, hireDate } = req.body;
    try {
        const [existingTrainers] = await db.query(
            'SELECT * FROM Trainers WHERE email = ? OR phoneNumber = ? OR (firstName = ? AND lastName = ?)',
            [email, phoneNumber, firstName, lastName]
        );

        // Check for all duplicates and collect errors (only one per field)
        if (existingTrainers.length > 0) {
            const errors = [];
            const checkedFields = new Set(); // Track which fields we've checked

            existingTrainers.forEach(existing => {
                if (existing.email === email && !checkedFields.has('email')) {
                    errors.push({ field: 'email', value: email });
                    checkedFields.add('email');
                }
                if (phoneNumber && existing.phoneNumber === phoneNumber && !checkedFields.has('phone')) {
                    errors.push({ field: 'phone', value: phoneNumber });
                    checkedFields.add('phone');
                }
                if (existing.firstName === firstName && existing.lastName === lastName && !checkedFields.has('name')) {
                    errors.push({ field: 'name', value: `${firstName} ${lastName}` });
                    checkedFields.add('name');
                }
            });

            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Duplicate entries found',
                    duplicates: errors
                });
            }
        }

        // If no duplicates, insert new trainer
        const [result] = await db.query(
            'INSERT INTO Trainers (firstName, lastName, email, phoneNumber, specialization, hireDate) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, phoneNumber, specialization, hireDate]
        );

        res.status(201).json({
            message: 'Trainer added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding trainer:', error);
        res.status(500).json({
            error: error.message || 'Error adding trainer to database'
        });
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