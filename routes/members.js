const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all members
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Members ORDER BY lastName, firstName');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new member
router.post('/', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, membershipType } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Members (firstName, lastName, email, phoneNumber, joinDate, membershipType) VALUES (?, ?, ?, ?, CURDATE(), ?)',
            [firstName, lastName, email, phoneNumber, membershipType]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE member
router.put('/:id', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, membershipType } = req.body;
    try {
        await db.query(
            'UPDATE Members SET firstName=?, lastName=?, email=?, phoneNumber=?, membershipType=? WHERE memberID=?',
            [firstName, lastName, email, phoneNumber, membershipType, req.params.id]
        );
        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE member
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Members WHERE memberID=?', [req.params.id]);
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
