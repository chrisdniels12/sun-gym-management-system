const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all equipment - Returns a list of all gym equipment
// Example: GET /api/equipment
router.get('/', async (req, res) => {
    try {
        // Query database for all equipment, sort by equipment name
        const [rows] = await db.query('SELECT * FROM Equipment ORDER BY equipmentName');
        res.json(rows);
    } catch (error) {
        // If there's an error, return a 500 status code and the error message
        res.status(500).json({ error: error.message });
    }
});

// CREATE new equipment - Adds a new piece of equipment to the system
// Example: POST /api/equipment
// Required body: { equipmentName: "Treadmill", type: "Cardio", status: "Available" }
router.post('/', async (req, res) => {
    // Extract equipment details from request body
    const { equipmentName, type, status } = req.body;
    try {
        // Insert new equipment into database
        const [result] = await db.query(
            'INSERT INTO Equipment (equipmentName, type, status) VALUES (?, ?, ?)',
            [equipmentName, type, status]
        );
        // Return the ID of the newly created equipment
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE equipment - Modifies existing equipment details
// Example: PUT /api/equipment/1
// Required body: { equipmentName: "Treadmill Pro", type: "Cardio", status: "In Maintenance" }
router.put('/:id', async (req, res) => {
    // Extract updated equipment details from request body
    const { equipmentName, type, status } = req.body;
    try {
        // Update the equipment with matching ID
        await db.query(
            'UPDATE Equipment SET equipmentName=?, type=?, status=? WHERE equipmentID=?',
            [equipmentName, type, status, req.params.id]
        );
        res.json({ message: 'Equipment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE equipment - Removes equipment from the system
// Example: DELETE /api/equipment/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the equipment with specified ID from database
        await db.query('DELETE FROM Equipment WHERE equipmentID=?', [req.params.id]);
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

