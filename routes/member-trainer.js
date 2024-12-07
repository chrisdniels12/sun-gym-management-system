const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all assignments
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT mt.memberTrainerID, 
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   CONCAT(t.firstName, ' ', t.lastName) as trainerName,
                   t.specialization,
                   mt.startDate, mt.endDate,
                   CASE 
                       WHEN mt.endDate IS NULL THEN 'Active'
                       WHEN mt.endDate >= CURRENT_DATE THEN 'Active'
                       ELSE 'Completed'
                   END as status
            FROM MemberTrainer mt
            JOIN Members m ON mt.memberID = m.memberID
            JOIN Trainers t ON mt.trainerID = t.trainerID
            ORDER BY mt.startDate DESC
        `);
        console.log('Fetched assignments:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single assignment
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT mt.memberTrainerID, mt.memberID, mt.trainerID,
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   CONCAT(t.firstName, ' ', t.lastName) as trainerName,
                   mt.startDate, mt.endDate
            FROM MemberTrainer mt
            JOIN Members m ON mt.memberID = m.memberID
            JOIN Trainers t ON mt.trainerID = t.trainerID
            WHERE mt.memberTrainerID = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new assignment
router.post('/', async (req, res) => {
    const { memberID, trainerID, startDate, endDate } = req.body;
    try {
        // Check for active assignment
        const [activeAssignments] = await db.query(
            'SELECT * FROM MemberTrainer WHERE memberID = ? AND (endDate IS NULL OR endDate >= CURRENT_DATE)',
            [memberID]
        );

        // Check trainer capacity
        const [trainerAssignments] = await db.query(
            'SELECT COUNT(*) as clientCount FROM MemberTrainer WHERE trainerID = ? AND (endDate IS NULL OR endDate >= CURRENT_DATE)',
            [trainerID]
        );

        // Collect all conflicts
        const errors = [];
        if (activeAssignments.length > 0) {
            errors.push({ field: 'active_assignment', value: 'exists' });
        }
        if (trainerAssignments[0].clientCount >= 5) {  // Maximum 5 active clients per trainer
            errors.push({ field: 'trainer_capacity', value: 'full' });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Duplicate entries found',
                duplicates: errors
            });
        }

        // If no conflicts, insert new assignment
        const [result] = await db.query(
            'INSERT INTO MemberTrainer (memberID, trainerID, startDate, endDate) VALUES (?, ?, ?, ?)',
            [memberID, trainerID, startDate, endDate]
        );

        res.status(201).json({
            message: 'Assignment added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding assignment:', error);
        res.status(500).json({
            error: error.message || 'Error adding assignment to database'
        });
    }
});

// UPDATE assignment
router.put('/:id', async (req, res) => {
    const { trainerID, startDate, endDate } = req.body;
    try {
        // Check if assignment exists
        const [existingAssignment] = await db.query(
            'SELECT * FROM MemberTrainer WHERE memberTrainerID = ?',
            [req.params.id]
        );

        if (existingAssignment.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check trainer capacity if trainer is being changed
        if (trainerID !== existingAssignment[0].trainerID) {
            const [trainerAssignments] = await db.query(
                'SELECT COUNT(*) as clientCount FROM MemberTrainer WHERE trainerID = ? AND (endDate IS NULL OR endDate >= CURRENT_DATE)',
                [trainerID]
            );

            if (trainerAssignments[0].clientCount >= 5) {
                return res.status(400).json({
                    error: 'Trainer capacity full',
                    duplicates: [{ field: 'trainer_capacity', value: 'full' }]
                });
            }
        }

        // Update the assignment
        await db.query(
            `UPDATE MemberTrainer 
             SET trainerID = ?, 
                 startDate = ?,
                 endDate = ?
             WHERE memberTrainerID = ?`,
            [trainerID, startDate, endDate, req.params.id]
        );

        res.json({ message: 'Assignment updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE assignment
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM MemberTrainer WHERE memberTrainerID = ?', [req.params.id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
