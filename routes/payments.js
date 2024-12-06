const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all payments
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.paymentID, p.memberID, CONCAT(m.firstName, ' ', m.lastName) AS memberName, 
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

// UPDATE payment
router.put('/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const { memberID, amount, paymentDate, paymentMethod } = req.body;
        console.log('Updating payment:', { paymentId, memberID, amount, paymentDate, paymentMethod });

        // Check if payment exists
        const [existingPayment] = await db.query(
            'SELECT * FROM Payments WHERE paymentID = ?',
            [paymentId]
        );

        if (existingPayment.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Update the payment
        const [result] = await db.query(
            `UPDATE Payments 
             SET memberID = ?, 
                 amount = ?, 
                 paymentDate = ?, 
                 paymentMethod = ?
             WHERE paymentID = ?`,
            [memberID, amount, paymentDate, paymentMethod, paymentId]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update payment' });
        }

        // Get updated payment data with member name
        const [updatedPayment] = await db.query(`
            SELECT p.*, CONCAT(m.firstName, ' ', m.lastName) as memberName
            FROM Payments p
            JOIN Members m ON p.memberID = m.memberID
            WHERE p.paymentID = ?
        `, [paymentId]);

        res.json({
            message: 'Payment updated successfully',
            payment: updatedPayment[0]
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: error.message || 'Error updating payment' });
    }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;
        console.log('Deleting payment with ID:', paymentId);

        // Delete the payment
        const [result] = await db.query('DELETE FROM Payments WHERE paymentID = ?', [paymentId]);

        if (result.affectedRows === 0) {
            console.log('No payment found with ID:', paymentId);
            return res.status(404).json({ error: 'Payment not found' });
        }

        console.log('Payment deleted successfully:', paymentId);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: error.message || 'Failed to delete payment' });
    }
});

module.exports = router;
