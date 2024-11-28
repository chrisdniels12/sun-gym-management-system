const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all certifications
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT te.trainerEquipID, 
                   CONCAT(t.firstName, ' ', t.lastName) as trainerName,
                   e.equipmentName,
                   te.certificationDate, te.expiryDate,
                   CASE 
                       WHEN te.expiryDate >= CURRENT_DATE THEN 'Valid'
                       ELSE 'Expired'
                   END as status
            FROM TrainerEquipment te
            JOIN Trainers t ON te.trainerID = t.trainerID
            JOIN Equipments e ON te.equipmentID = e.equipmentID
            ORDER BY te.expiryDate DESC
        `);
        console.log('Fetched certifications:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new certification
router.post('/', async (req, res) => {
    const { trainerID, equipmentID, certificationDate, expiryDate } = req.body;
    try {
        // Check for active certification
        const [existingCerts] = await db.query(
            'SELECT * FROM TrainerEquipment WHERE trainerID = ? AND equipmentID = ? AND expiryDate >= CURRENT_DATE',
            [trainerID, equipmentID]
        );

        // Collect all conflicts
        const errors = [];
        if (existingCerts.length > 0) {
            errors.push({ field: 'active_certification', value: 'exists' });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Duplicate entries found',
                duplicates: errors
            });
        }

        // If no conflicts, insert new certification
        const [result] = await db.query(
            'INSERT INTO TrainerEquipment (trainerID, equipmentID, certificationDate, expiryDate) VALUES (?, ?, ?, ?)',
            [trainerID, equipmentID, certificationDate, expiryDate]
        );

        res.status(201).json({
            message: 'Certification added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding certification:', error);
        res.status(500).json({
            error: error.message || 'Error adding certification to database'
        });
    }
});

// RENEW certification
router.put('/:id/renew', async (req, res) => {
    try {
        await db.query(
            'UPDATE TrainerEquipment SET expiryDate = ? WHERE trainerEquipID = ?',
            [req.body.expiryDate, req.params.id]
        );
        res.json({ message: 'Certification renewed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE certification
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM TrainerEquipment WHERE trainerEquipID = ?', [req.params.id]);
        res.json({ message: 'Certification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
