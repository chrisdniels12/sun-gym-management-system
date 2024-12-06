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
            'INSERT INTO Classes (className, trainerID, scheduleTime, scheduleDay, maxCapacity, currentEnrollment) VALUES (?, ?, ?, ?, ?, 0)',
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

// UPDATE class
router.put('/:id', async (req, res) => {
    try {
        const classId = req.params.id;
        const { className, trainerID, scheduleTime, scheduleDay, maxCapacity } = req.body;
        console.log('Updating class:', { classId, className, trainerID, scheduleTime, scheduleDay, maxCapacity });

        // Check if class exists
        const [existingClass] = await db.query(
            'SELECT * FROM Classes WHERE classID = ?',
            [classId]
        );

        if (existingClass.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check for time slot conflicts (excluding this class)
        const [timeConflicts] = await db.query(
            'SELECT * FROM Classes WHERE scheduleDay = ? AND scheduleTime = ? AND classID != ?',
            [scheduleDay, scheduleTime, classId]
        );

        // Check for trainer schedule conflicts if trainer is assigned
        let trainerConflicts = [];
        if (trainerID) {
            [trainerConflicts] = await db.query(
                'SELECT * FROM Classes WHERE trainerID = ? AND scheduleDay = ? AND scheduleTime = ? AND classID != ?',
                [trainerID, scheduleDay, scheduleTime, classId]
            );
        }

        // Handle conflicts
        if (timeConflicts.length > 0 || trainerConflicts.length > 0) {
            const errors = [];
            if (timeConflicts.length > 0) {
                errors.push(`Time slot ${scheduleTime} on ${scheduleDay} is already taken`);
            }
            if (trainerConflicts.length > 0) {
                errors.push(`Trainer is already scheduled at this time`);
            }
            return res.status(400).json({ error: errors.join(', ') });
        }

        // Check if new maxCapacity is less than current enrollment
        const [enrollmentCheck] = await db.query(
            'SELECT currentEnrollment FROM Classes WHERE classID = ?',
            [classId]
        );

        if (enrollmentCheck[0].currentEnrollment > maxCapacity) {
            return res.status(400).json({
                error: `Cannot reduce capacity below current enrollment (${enrollmentCheck[0].currentEnrollment} students)`
            });
        }

        // Update the class
        const [result] = await db.query(
            `UPDATE Classes 
             SET className = ?, 
                 trainerID = ?, 
                 scheduleTime = ?, 
                 scheduleDay = ?, 
                 maxCapacity = ?
             WHERE classID = ?`,
            [className, trainerID || null, scheduleTime, scheduleDay, maxCapacity, classId]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update class' });
        }

        res.json({
            message: 'Class updated successfully',
            class: {
                classID: classId,
                className,
                trainerID,
                scheduleTime,
                scheduleDay,
                maxCapacity
            }
        });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ error: error.message || 'Error updating class' });
    }
});

// DELETE class
router.delete('/:id', async (req, res) => {
    try {
        const classId = req.params.id;
        console.log('Deleting class with ID:', classId);

        // First delete related records in ClassBookings
        await db.query('DELETE FROM ClassBookings WHERE classID = ?', [classId]);

        // Then delete the class
        const [result] = await db.query('DELETE FROM Classes WHERE classID = ?', [classId]);

        if (result.affectedRows === 0) {
            console.log('No class found with ID:', classId);
            return res.status(404).json({ error: 'Class not found' });
        }

        console.log('Class deleted successfully:', classId);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ error: error.message || 'Failed to delete class' });
    }
});

module.exports = router;
