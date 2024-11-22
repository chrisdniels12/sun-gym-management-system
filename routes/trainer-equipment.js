const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

// GET all trainer-equipment certifications - Returns all equipment certifications
// Example: GET /api/trainer-equipment
router.get('/', async (req, res) => {
    try {
        // Query database for all certifications with trainer and equipment details
        const [rows] = await db.query(`
            SELECT TE.*, 
                   T.firstName, T.lastName,
                   E.equipmentName
            FROM Trainer_Equipment TE
            JOIN Trainers T ON TE.trainerID = T.trainerID
            JOIN Equipment E ON TE.equipmentID = E.equipmentID
            ORDER BY T.lastName, T.firstName`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new equipment certification
// Example: POST /api/trainer-equipment
// Required body: { trainerID: 1, equipmentID: 2, certificationDate: "2024-01-15" }
router.post('/', async (req, res) => {
    // Extract certification details from request body
    const { trainerID, equipmentID, certificationDate } = req.body;
    try {
        // Insert new certification record
        const [result] = await db.query(
            'INSERT INTO Trainer_Equipment (trainerID, equipmentID, certificationDate) VALUES (?, ?, ?)',
            [trainerID, equipmentID, certificationDate]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE equipment certification
// Example: PUT /api/trainer-equipment/1
// Required body: { certificationDate: "2024-01-16" }
router.put('/:id', async (req, res) => {
    // Extract updated certification details from request body
    const { certificationDate } = req.body;
    try {
        // Update the certification record with matching ID
        await db.query(
            'UPDATE Trainer_Equipment SET certificationDate=? WHERE certificationID=?',
            [certificationDate, req.params.id]
        );
        res.json({ message: 'Certification updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE equipment certification
// Example: DELETE /api/trainer-equipment/1
router.delete('/:id', async (req, res) => {
    try {
        // Remove the certification record with specified ID
        await db.query('DELETE FROM Trainer_Equipment WHERE certificationID=?', [req.params.id]);
        res.json({ message: 'Certification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
