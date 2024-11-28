const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all payments
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.paymentID, CONCAT(m.firstName, ' ', m.lastName) AS memberName, 
                   p.amount, p.paymentDate, p.paymentMethod
            FROM Payments p
            JOIN Members m ON p.memberID = m.memberID
            ORDER BY p.paymentDate DESC
        `);
        console.log('Fetched payments:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new payment
router.post('/', async (req, res) => {
    const { memberID, amount, paymentDate, paymentMethod } = req.body;
    try {
        // Insert new payment
        const [result] = await db.query(
            'INSERT INTO Payments (memberID, amount, paymentDate, paymentMethod) VALUES (?, ?, ?, ?)',
            [memberID, amount, paymentDate, paymentMethod]
        );

        res.status(201).json({
            message: 'Payment added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({
            error: error.message || 'Error adding payment to database'
        });
    }
});

module.exports = router;
