const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT cb.bookingID, cb.memberID,
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   c.className, c.scheduleDay, c.scheduleTime,
                   cb.bookingDate
            FROM ClassBookings cb
            JOIN Members m ON cb.memberID = m.memberID
            JOIN Classes c ON cb.classID = c.classID
            ORDER BY cb.bookingDate DESC, c.scheduleTime
        `);
        console.log('Fetched bookings:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single booking
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT cb.bookingID, cb.memberID, cb.classID,
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   c.className, c.scheduleDay, c.scheduleTime,
                   cb.bookingDate
            FROM ClassBookings cb
            JOIN Members m ON cb.memberID = m.memberID
            JOIN Classes c ON cb.classID = c.classID
            WHERE cb.bookingID = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new booking
router.post('/', async (req, res) => {
    const { memberID, classID, bookingDate } = req.body;
    try {
        // Check for existing booking
        const [existingBookings] = await db.query(
            'SELECT * FROM ClassBookings WHERE memberID = ? AND classID = ? AND bookingDate = ?',
            [memberID, classID, bookingDate]
        );

        // Check class capacity
        const [classInfo] = await db.query(
            'SELECT maxCapacity, (SELECT COUNT(*) FROM ClassBookings WHERE classID = ? AND bookingDate = ?) as currentBookings FROM Classes WHERE classID = ?',
            [classID, bookingDate, classID]
        );

        // Collect all conflicts
        const errors = [];
        if (existingBookings.length > 0) {
            errors.push({ field: 'booking', value: 'duplicate' });
        }
        if (classInfo[0].currentBookings >= classInfo[0].maxCapacity) {
            errors.push({ field: 'capacity', value: 'full' });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Duplicate entries found',
                duplicates: errors
            });
        }

        // If no conflicts, insert new booking
        const [result] = await db.query(
            'INSERT INTO ClassBookings (memberID, classID, bookingDate) VALUES (?, ?, ?)',
            [memberID, classID, bookingDate]
        );

        // Get the newly created booking with all details
        const [newBooking] = await db.query(`
            SELECT cb.bookingID, cb.memberID,
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   c.className, c.scheduleDay, c.scheduleTime,
                   cb.bookingDate
            FROM ClassBookings cb
            JOIN Members m ON cb.memberID = m.memberID
            JOIN Classes c ON cb.classID = c.classID
            WHERE cb.bookingID = ?
        `, [result.insertId]);

        res.status(201).json({
            message: 'Booking added successfully',
            id: result.insertId,
            booking: newBooking[0]
        });
    } catch (error) {
        console.error('Error adding booking:', error);
        res.status(500).json({
            error: error.message || 'Error adding booking to database'
        });
    }
});

// UPDATE booking
router.put('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { memberID, classID, bookingDate } = req.body;
        console.log('Updating booking:', { bookingId, memberID, classID, bookingDate });

        // Check if booking exists
        const [existingBooking] = await db.query(
            'SELECT * FROM ClassBookings WHERE bookingID = ?',
            [bookingId]
        );

        if (existingBooking.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update the booking
        const [result] = await db.query(
            `UPDATE ClassBookings 
             SET memberID = ?, 
                 classID = ?
             WHERE bookingID = ?`,
            [memberID, classID, bookingId]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update booking' });
        }

        // Get updated booking data
        const [updatedBooking] = await db.query(`
            SELECT cb.bookingID, cb.memberID,
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   c.className, c.scheduleDay, c.scheduleTime,
                   cb.bookingDate
            FROM ClassBookings cb
            JOIN Members m ON cb.memberID = m.memberID
            JOIN Classes c ON cb.classID = c.classID
            WHERE cb.bookingID = ?
        `, [bookingId]);

        res.json({
            message: 'Booking updated successfully',
            booking: updatedBooking[0]
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: error.message || 'Error updating booking' });
    }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM ClassBookings WHERE bookingID = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
