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
    console.log('Received trainer data:', { firstName, lastName, email, phoneNumber, specialization, hireDate });

    try {
        const [existingTrainers] = await db.query(
            'SELECT * FROM Trainers WHERE email = ? OR phoneNumber = ? OR (firstName = ? AND lastName = ?)',
            [email, phoneNumber, firstName, lastName]
        );
        console.log('Checked for existing trainers:', existingTrainers);

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
        console.log('Attempting to insert trainer...');
        const [result] = await db.query(
            'INSERT INTO Trainers (firstName, lastName, email, phoneNumber, specialization, hireDate) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, phoneNumber, specialization, hireDate]
        );
        console.log('Insert result:', result);

        res.status(201).json({
            message: 'Trainer added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding trainer:', error);
        console.error('Full error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({
            error: error.message || 'Error adding trainer to database'
        });
    }
});

// Update a trainer
router.put('/:id', async (req, res) => {
    try {
        const trainerId = req.params.id;
        const { firstName, lastName, email, phoneNumber, specialization } = req.body;
        console.log('Updating trainer:', { trainerId, firstName, lastName, email, phoneNumber, specialization });

        // Check if trainer exists
        const [existingTrainer] = await db.query(
            'SELECT * FROM Trainers WHERE trainerID = ?',
            [trainerId]
        );

        if (existingTrainer.length === 0) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        // Update the trainer
        const [result] = await db.query(
            `UPDATE Trainers 
             SET firstName = ?, 
                 lastName = ?, 
                 email = ?, 
                 phoneNumber = ?, 
                 specialization = ?
             WHERE trainerID = ?`,
            [firstName, lastName, email, phoneNumber, specialization, trainerId]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update trainer' });
        }

        res.json({
            message: 'Trainer updated successfully',
            trainer: {
                trainerID: trainerId,
                firstName,
                lastName,
                email,
                phoneNumber,
                specialization
            }
        });
    } catch (error) {
        console.error('Error updating trainer:', error);
        res.status(500).json({ error: error.message || 'Error updating trainer' });
    }
});

// Delete a trainer
router.delete('/:id', async (req, res) => {
    try {
        const trainerId = req.params.id;
        console.log('Deleting trainer with ID:', trainerId);

        // First delete related records in intersection tables
        await db.query('DELETE FROM MemberTrainer WHERE trainerID = ?', [trainerId]);
        await db.query('DELETE FROM TrainerEquipment WHERE trainerID = ?', [trainerId]);

        // Update any classes to remove this trainer (set to NULL)
        await db.query('UPDATE Classes SET trainerID = NULL WHERE trainerID = ?', [trainerId]);

        // Then delete the trainer
        const [result] = await db.query('DELETE FROM Trainers WHERE trainerID = ?', [trainerId]);

        if (result.affectedRows === 0) {
            console.log('No trainer found with ID:', trainerId);
            return res.status(404).json({ error: 'Trainer not found' });
        }

        console.log('Trainer deleted successfully:', trainerId);
        res.json({ message: 'Trainer deleted successfully' });
    } catch (error) {
        console.error('Error deleting trainer:', error);
        res.status(500).json({ error: error.message || 'Failed to delete trainer' });
    }
});

module.exports = router;
