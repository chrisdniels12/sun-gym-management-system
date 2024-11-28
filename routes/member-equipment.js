const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all member equipment usage
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT me.memberEquipID, CONCAT(m.firstName, ' ', m.lastName) AS memberName, 
                   e.equipmentName, me.usageDate, me.usageDuration
            FROM MemberEquipment me
            JOIN Members m ON me.memberID = m.memberID
            JOIN Equipments e ON me.equipmentID = e.equipmentID
            ORDER BY me.usageDate DESC
        `);
        console.log('Fetched member equipment usage:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new member equipment usage
router.post('/', async (req, res) => {
    const { memberID, equipmentID, usageDate, usageDuration } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO MemberEquipment (memberID, equipmentID, usageDate, usageDuration) VALUES (?, ?, ?, ?)',
            [memberID, equipmentID, usageDate, usageDuration]
        );

        res.status(201).json({
            message: 'Equipment usage recorded successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error recording equipment usage:', error);
        res.status(500).json({
            error: error.message || 'Error recording equipment usage'
        });
    }
});

module.exports = router;
