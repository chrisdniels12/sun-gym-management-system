const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all members
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Members ORDER BY lastName, firstName');
        console.log('Fetched members:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new member
router.post('/', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, membershipType } = req.body;
    try {
        const [existingMembers] = await db.query(
            'SELECT * FROM Members WHERE email = ? OR phoneNumber = ? OR (firstName = ? AND lastName = ?)',
            [email, phoneNumber, firstName, lastName]
        );

        // Check for all duplicates and collect errors (only one per field)
        if (existingMembers.length > 0) {
            const errors = [];
            const checkedFields = new Set(); // Track which fields we've checked

            existingMembers.forEach(existing => {
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

        // If no duplicates, insert new member
        const [result] = await db.query(
            'INSERT INTO Members (firstName, lastName, email, phoneNumber, joinDate, membershipType) VALUES (?, ?, ?, ?, CURDATE(), ?)',
            [firstName, lastName, email, phoneNumber, membershipType]
        );

        res.status(201).json({
            message: 'Member added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({
            error: error.message || 'Error adding member to database'
        });
    }
});

module.exports = router;
