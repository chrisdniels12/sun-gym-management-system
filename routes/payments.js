const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all payments - Returns a list of all payment records
// Example: GET /api/payments
router.get('/', async (req, res) => {
    try {
        // Query database for all payments, join with Members table to get member names
        const [rows] = await db.query(`
            SELECT Payments.*, Members.firstName, Members.lastName 
            FROM Payments 
            JOIN Members ON Payments.memberID = Members.memberID 
            ORDER BY paymentDate DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new payment - Records a new payment in the system
// Example: POST /api/payments
// Required body: { memberID: 1, amount: 50.00, paymentDate: "2024-01-15", paymentType: "Credit Card" }
router.post('/', async (req, res) => {
    // Extract payment details from request body
    const { memberID, amount, paymentDate, paymentType } = req.body;
    try {
        // Insert new payment record into database
        const [result] = await db.query(
            'INSERT INTO Payments (memberID, amount, paymentDate, paymentType) VALUES (?, ?, ?, ?)',
            [memberID, amount, paymentDate, paymentType]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE payment - Modifies an existing payment record
// Example: PUT /api/payments/1
// Required body: { amount: 75.00, paymentDate: "2024-01-16", paymentType: "Debit Card" }
router.put('/:id', async (req, res) => {
    // Extract updated payment details from request body
    const { amount, paymentDate, paymentType } = req.body;
    try {
        // Update the payment record with matching ID
        await db.query(
            'UPDATE Payments SET amount=?, paymentDate=?, paymentType=? WHERE paymentID=?',
            [amount, paymentDate, paymentType, req.params.id]
        );
        res.json({ message: 'Payment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE payment - Removes a payment record from the system
// Example: DELETE /api/payments/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the payment record with specified ID
        await db.query('DELETE FROM Payments WHERE paymentID=?', [req.params.id]);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
