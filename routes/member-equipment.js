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

// GET equipment usage by member
// Example: GET /api/member-equipment/member/1
router.get('/member/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT ME.*, 
                   E.equipmentName, E.equipmentType,
                   DATE_FORMAT(ME.usageDate, '%Y-%m-%d') as formattedDate
            FROM Member_Equipment ME
            JOIN Equipment E ON ME.equipmentID = E.equipmentID
            WHERE ME.memberID = ?
            ORDER BY ME.usageDate DESC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET equipment usage stats
// Example: GET /api/member-equipment/stats
router.get('/stats', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                E.equipmentName,
                COUNT(*) as totalUses,
                AVG(ME.duration) as avgDuration,
                MAX(ME.usageDate) as lastUsed
            FROM Member_Equipment ME
            JOIN Equipment E ON ME.equipmentID = E.equipmentID
            GROUP BY E.equipmentID, E.equipmentName
            ORDER BY totalUses DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validate equipment availability before creating usage record
// Add this before the existing POST route
async function checkEquipmentAvailability(equipmentID) {
    const [rows] = await db.query(
        'SELECT status FROM Equipment WHERE equipmentID = ?',
        [equipmentID]
    );
    return rows[0]?.status === 'Available';
}

// CREATE new equipment usage record
// Example: POST /api/member-equipment
// Required body: { memberID: 1, equipmentID: 2, usageDate: "2024-01-15", duration: 30 }
router.post('/', async (req, res) => {
    const { memberID, equipmentID, usageDate, duration } = req.body;
    try {
        // Check equipment availability
        const isAvailable = await checkEquipmentAvailability(equipmentID);
        if (!isAvailable) {
            return res.status(400).json({ error: 'Equipment not available' });
        }

        // Create usage record and update equipment status
        await db.query('START TRANSACTION');

        const [result] = await db.query(
            'INSERT INTO Member_Equipment (memberID, equipmentID, usageDate, duration) VALUES (?, ?, ?, ?)',
            [memberID, equipmentID, usageDate, duration]
        );

        await db.query(
            'UPDATE Equipment SET status = ? WHERE equipmentID = ?',
            ['In Use', equipmentID]
        );

        await db.query('COMMIT');
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        await db.query('ROLLBACK');
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
