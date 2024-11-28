const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all equipment
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT equipmentID, equipmentName, type, status, 
                   location, lastMaintenance 
            FROM Equipment 
            ORDER BY equipmentName`
        );
        console.log('Fetched equipment:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new equipment
router.post('/', async (req, res) => {
    const { equipmentName, type, status, location } = req.body;
    try {
        // Check for duplicate equipment
        const [existingEquipment] = await db.query(
            'SELECT * FROM Equipment WHERE equipmentName = ? OR location = ?',
            [equipmentName, location]
        );

        // Collect all conflicts
        if (existingEquipment.length > 0) {
            const errors = [];
            const checkedFields = new Set();

            existingEquipment.forEach(existing => {
                if (existing.equipmentName === equipmentName && !checkedFields.has('name')) {
                    errors.push({ field: 'name', value: equipmentName });
                    checkedFields.add('name');
                }
                if (existing.location === location && !checkedFields.has('location')) {
                    errors.push({ field: 'location', value: location });
                    checkedFields.add('location');
                }
            });

            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Duplicate entries found',
                    duplicates: errors
                });
            }
        }

        // If no duplicates, insert new equipment
        const [result] = await db.query(
            'INSERT INTO Equipment (equipmentName, type, status, location) VALUES (?, ?, ?, ?)',
            [equipmentName, type, status, location]
        );

        res.status(201).json({
            message: 'Equipment added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding equipment:', error);
        res.status(500).json({
            error: error.message || 'Error adding equipment to database'
        });
    }
});

module.exports = router;

