const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all member-equipment relationships - Returns all equipment usage records
// Example: GET /api/member-equipment
router.get('/', async (req, res) => {
    try {
        // Query database for all equipment usage, joining with Members and Equipment tables
        const [rows] = await db.query(`
            SELECT ME.*, 
                   M.firstName, M.lastName,
                   E.equipmentName
            FROM Member_Equipment ME
            JOIN Members M ON ME.memberID = M.memberID
            JOIN Equipment E ON ME.equipmentID = E.equipmentID
            ORDER BY ME.usageDate DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new equipment usage record
// Example: POST /api/member-equipment
// Required body: { memberID: 1, equipmentID: 2, usageDate: "2024-01-15", duration: 30 }
router.post('/', async (req, res) => {
    // Extract usage details from request body
    const { memberID, equipmentID, usageDate, duration } = req.body;
    try {
        // Insert new equipment usage record
        const [result] = await db.query(
            'INSERT INTO Member_Equipment (memberID, equipmentID, usageDate, duration) VALUES (?, ?, ?, ?)',
            [memberID, equipmentID, usageDate, duration]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE equipment usage record
// Example: PUT /api/member-equipment/1
// Required body: { usageDate: "2024-01-16", duration: 45 }
router.put('/:id', async (req, res) => {
    // Extract updated usage details from request body
    const { usageDate, duration } = req.body;
    try {
        // Update the usage record with matching ID
        await db.query(
            'UPDATE Member_Equipment SET usageDate=?, duration=? WHERE usageID=?',
            [usageDate, duration, req.params.id]
        );
        res.json({ message: 'Equipment usage record updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE equipment usage record
// Example: DELETE /api/member-equipment/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the usage record with specified ID
        await db.query('DELETE FROM Member_Equipment WHERE usageID=?', [req.params.id]);
        res.json({ message: 'Equipment usage record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
