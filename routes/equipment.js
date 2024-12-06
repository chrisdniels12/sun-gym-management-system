const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all equipment
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT equipmentID, equipmentName, equipmentType as type, status, 
                   location, lastMaintenance 
            FROM Equipments 
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
            'SELECT * FROM Equipments WHERE equipmentName = ? OR location = ?',
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
            'INSERT INTO Equipments (equipmentName, equipmentType, status, location) VALUES (?, ?, ?, ?)',
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

// UPDATE equipment
router.put('/:id', async (req, res) => {
    try {
        const equipmentId = req.params.id;
        const { equipmentName, type, status, location } = req.body;
        console.log('Updating equipment:', { equipmentId, equipmentName, type, status, location });

        // Check if equipment exists
        const [existingEquipment] = await db.query(
            'SELECT * FROM Equipments WHERE equipmentID = ?',
            [equipmentId]
        );

        if (existingEquipment.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        // Check for duplicate names/locations (excluding current equipment)
        const [duplicates] = await db.query(
            'SELECT * FROM Equipments WHERE (equipmentName = ? OR location = ?) AND equipmentID != ?',
            [equipmentName, location, equipmentId]
        );

        if (duplicates.length > 0) {
            const errors = [];
            duplicates.forEach(duplicate => {
                if (duplicate.equipmentName === equipmentName) {
                    errors.push(`Equipment name "${equipmentName}" is already in use`);
                }
                if (duplicate.location === location) {
                    errors.push(`Location "${location}" is already occupied`);
                }
            });
            if (errors.length > 0) {
                return res.status(400).json({ error: errors.join(', ') });
            }
        }

        // Update the equipment
        const [result] = await db.query(
            `UPDATE Equipments 
             SET equipmentName = ?, 
                 equipmentType = ?, 
                 status = ?, 
                 location = ?
             WHERE equipmentID = ?`,
            [equipmentName, type, status, location, equipmentId]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update equipment' });
        }

        res.json({
            message: 'Equipment updated successfully',
            equipment: {
                equipmentID: equipmentId,
                equipmentName,
                type,
                status,
                location
            }
        });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ error: error.message || 'Error updating equipment' });
    }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
    try {
        const equipmentId = req.params.id;
        console.log('Deleting equipment with ID:', equipmentId);

        // First delete related records in intersection tables
        await db.query('DELETE FROM MemberEquipment WHERE equipmentID = ?', [equipmentId]);
        await db.query('DELETE FROM TrainerEquipment WHERE equipmentID = ?', [equipmentId]);

        // Then delete the equipment
        const [result] = await db.query('DELETE FROM Equipments WHERE equipmentID = ?', [equipmentId]);

        if (result.affectedRows === 0) {
            console.log('No equipment found with ID:', equipmentId);
            return res.status(404).json({ error: 'Equipment not found' });
        }

        console.log('Equipment deleted successfully:', equipmentId);
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ error: error.message || 'Failed to delete equipment' });
    }
});

module.exports = router;
