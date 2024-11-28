const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT cb.bookingID, 
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

        res.status(201).json({
            message: 'Booking added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error adding booking:', error);
        res.status(500).json({
            error: error.message || 'Error adding booking to database'
        });
    }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM ClassBookings WHERE bookingID = ?', [req.params.id]);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
