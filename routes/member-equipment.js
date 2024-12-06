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

// UPDATE member equipment usage
router.put('/:id', async (req, res) => {
    try {
        const usageId = req.params.id;
        const { memberID, equipmentID, usageDate, usageDuration } = req.body;
        console.log('Updating usage:', { usageId, memberID, equipmentID, usageDate, usageDuration });

        // Check if usage record exists
        const [existingUsage] = await db.query(
            'SELECT * FROM MemberEquipment WHERE memberEquipID = ?',
            [usageId]
        );

        if (existingUsage.length === 0) {
            return res.status(404).json({ error: 'Usage record not found' });
        }

        // Update the usage record
        const [result] = await db.query(
            `UPDATE MemberEquipment 
             SET memberID = ?, 
                 equipmentID = ?, 
                 usageDate = ?, 
                 usageDuration = ?
             WHERE memberEquipID = ?`,
            [memberID, equipmentID, usageDate, usageDuration, usageId]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update usage record' });
        }

        // Get updated usage data with member and equipment names
        const [updatedUsage] = await db.query(`
            SELECT me.*, CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   e.equipmentName
            FROM MemberEquipment me
            JOIN Members m ON me.memberID = m.memberID
            JOIN Equipments e ON me.equipmentID = e.equipmentID
            WHERE me.memberEquipID = ?
        `, [usageId]);

        res.json({
            message: 'Usage record updated successfully',
            usage: updatedUsage[0]
        });
    } catch (error) {
        console.error('Error updating usage record:', error);
        res.status(500).json({ error: error.message || 'Error updating usage record' });
    }
});

// DELETE member equipment usage
router.delete('/:id', async (req, res) => {
    try {
        const usageId = req.params.id;
        console.log('Deleting usage record with ID:', usageId);

        // Delete the usage record
        const [result] = await db.query('DELETE FROM MemberEquipment WHERE memberEquipID = ?', [usageId]);

        if (result.affectedRows === 0) {
            console.log('No usage record found with ID:', usageId);
            return res.status(404).json({ error: 'Usage record not found' });
        }

        console.log('Usage record deleted successfully:', usageId);
        res.json({ message: 'Usage record deleted successfully' });
    } catch (error) {
        console.error('Error deleting usage record:', error);
        res.status(500).json({ error: error.message || 'Failed to delete usage record' });
    }
});

module.exports = router;
