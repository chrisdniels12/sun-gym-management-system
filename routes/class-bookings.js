const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all class bookings - Returns all class booking records
// Example: GET /api/class-bookings
router.get('/', async (req, res) => {
    try {
        // Query database for all bookings, joining with Members and Classes tables
        const [rows] = await db.query(`
            SELECT CB.*, 
                   M.firstName, M.lastName,
                   C.className, C.schedule
            FROM Class_Bookings CB
            JOIN Members M ON CB.memberID = M.memberID
            JOIN Classes C ON CB.classID = C.classID
            ORDER BY C.schedule DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET bookings by member
// Example: GET /api/class-bookings/member/1
router.get('/member/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT CB.*, 
                   C.className, C.schedule, C.maxCapacity,
                   DATE_FORMAT(CB.bookingDate, '%Y-%m-%d') as formattedDate
            FROM Class_Bookings CB
            JOIN Classes C ON CB.classID = C.classID
            WHERE CB.memberID = ?
            ORDER BY C.schedule DESC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET class capacity stats
// Example: GET /api/class-bookings/stats
router.get('/stats', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                C.classID,
                C.className,
                C.maxCapacity,
                COUNT(CB.bookingID) as currentBookings,
                (C.maxCapacity - COUNT(CB.bookingID)) as availableSpots
            FROM Classes C
            LEFT JOIN Class_Bookings CB ON C.classID = CB.classID
            WHERE CB.status != 'Cancelled' OR CB.status IS NULL
            GROUP BY C.classID, C.className, C.maxCapacity`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new class booking
// Example: POST /api/class-bookings
// Required body: { memberID: 1, classID: 2, bookingDate: "2024-01-15", status: "Confirmed" }
router.post('/', async (req, res) => {
    const { memberID, classID, bookingDate, status } = req.body;
    try {
        // Check class capacity
        const hasCapacity = await checkClassCapacity(classID);
        if (!hasCapacity) {
            return res.status(400).json({ error: 'Class is at full capacity' });
        }

        // Create booking with transaction
        await db.query('START TRANSACTION');

        const [result] = await db.query(
            'INSERT INTO Class_Bookings (memberID, classID, bookingDate, status) VALUES (?, ?, ?, ?)',
            [memberID, classID, bookingDate, status]
        );

        await db.query('COMMIT');
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});

// UPDATE class booking
// Example: PUT /api/class-bookings/1
// Required body: { status: "Cancelled" }
router.put('/:id', async (req, res) => {
    // Extract updated booking details from request body
    const { status } = req.body;
    try {
        // Update the booking record with matching ID
        await db.query(
            'UPDATE Class_Bookings SET status=? WHERE bookingID=?',
            [status, req.params.id]
        );
        res.json({ message: 'Booking updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE class booking
// Example: DELETE /api/class-bookings/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the booking record with specified ID
        await db.query('DELETE FROM Class_Bookings WHERE bookingID=?', [req.params.id]);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;