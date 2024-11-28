const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all classes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Classes ORDER BY scheduleDay, scheduleTime');
        console.log('Fetched classes:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new class
router.post('/', async (req, res) => {
    const { className, trainerID, scheduleTime, scheduleDay, maxCapacity } = req.body;
    try {
        // Check for time slot conflicts
        const [existingClasses] = await db.query(
            'SELECT * FROM Classes WHERE scheduleDay = ? AND scheduleTime = ?',
            [scheduleDay, scheduleTime]
        );

        // Check for trainer schedule conflicts if trainer is assigned
        let trainerConflicts = [];
        if (trainerID) {
            [trainerConflicts] = await db.query(
                'SELECT * FROM Classes WHERE trainerID = ? AND scheduleDay = ? AND scheduleTime = ?',
                [trainerID, scheduleDay, scheduleTime]
            );
        }

        // Collect all conflicts
        if (existingClasses.length > 0 || trainerConflicts.length > 0) {
            const errors = [];
            const checkedFields = new Set();

            if (existingClasses.length > 0 && !checkedFields.has('time_slot')) {
                errors.push({ field: 'time_slot', value: `${scheduleTime} on ${scheduleDay}` });
                checkedFields.add('time_slot');
            }

            if (trainerConflicts.length > 0 && !checkedFields.has('trainer_schedule')) {
                errors.push({ field: 'trainer_schedule', value: trainerID });
                checkedFields.add('trainer_schedule');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Duplicate entries found',
                    duplicates: errors
                });
            }
        }

        // If no conflicts, insert new class
        const [result] = await db.query(
            'INSERT INTO Classes (className, trainerID, scheduleTime, scheduleDay, maxCapacity) VALUES (?, ?, ?, ?, ?)',
            [className, trainerID || null, scheduleTime, scheduleDay, maxCapacity]
        );

        res.status(201).json({
            message: 'Class added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({
            error: error.message || 'Error adding class to database'
        });
    }
});

module.exports = router;
