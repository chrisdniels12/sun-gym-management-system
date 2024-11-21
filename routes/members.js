const express = require('express');
const router = express.Router();
const db = require('../database/db-connector').pool;

/**
 * GET /members
 * Display all members with statistics
 */
router.get('/', (req, res) => {
    const query = `
        SELECT memberID, firstName, lastName, email, phoneNumber, joinDate, membershipType 
        FROM Members
        ORDER BY lastName, firstName`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching members:', err);
            res.status(500).send('Error fetching members');
            return;
        }
        res.render('members', { members: results });
    });
});

/**
 * GET /members/create
 * Render the form to create a new member
 */
router.get('/create', (req, res) => {
    console.log('Create Route Hit');
    res.render('members_form', { formTitle: 'Add', buttonText: 'Create', action: '/members', record: {} });
});

/**
 * GET /members/edit/:id
 * Render the form to edit an existing member
 */
router.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Members WHERE memberID = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching member:', err);
            return res.status(500).send('Error fetching member');
        }

        if (results.length === 0) {
            return res.status(404).send('Member not found');
        }

        res.render('members_form', {
            formTitle: 'Edit',
            buttonText: 'Update',
            record: results[0],
        });
    });
});

/**
 * POST /members
 * Add a new member
 */
router.post('/', (req, res) => {
    const { firstName, lastName, email, phoneNumber, membershipType } = req.body;
    const query = `
        INSERT INTO Members (firstName, lastName, email, phoneNumber, joinDate, membershipType)
        VALUES (?, ?, ?, ?, CURRENT_DATE, ?)`;

    db.query(query, [firstName, lastName, email, phoneNumber, membershipType], (err, result) => {
        if (err) {
            console.error('Error adding member:', err);
            res.status(500).send('Error adding member');
            return;
        }
        res.redirect('/members');
    });
});

/**
 * POST /members/:id
 * Update an existing member
 */
router.post('/:id', (req, res) => {
    const { firstName, lastName, email, phoneNumber, membershipType } = req.body;
    const query = `
        UPDATE Members 
        SET firstName = ?, lastName = ?, email = ?, phoneNumber = ?, membershipType = ?
        WHERE memberID = ?`;

    db.query(query, [firstName, lastName, email, phoneNumber, membershipType, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating member:', err);
            res.status(500).send('Error updating member');
            return;
        }
        res.json({ success: true });
    });
});

/**
 * DELETE /members/:id
 * Delete a member and their related records
 */
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;

    // Start a transaction since we're doing multiple operations
    db.beginTransaction(async (err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        try {
            // First delete related records from intersection tables
            await db.query('DELETE FROM MemberTrainer WHERE memberID = ?', [id]);
            await db.query('DELETE FROM ClassBookings WHERE memberID = ?', [id]);
            await db.query('DELETE FROM MemberEquipment WHERE memberID = ?', [id]);

            // Then delete the member
            const [results] = await db.query('DELETE FROM Members WHERE memberID = ?', [id]);

            if (results.affectedRows === 0) {
                await db.rollback();
                return res.status(404).json({ message: 'Member not found' });
            }

            // If we get here, commit the transaction
            await db.commit();
            res.json({ message: 'Member deleted successfully' });

        } catch (error) {
            // If anything goes wrong, rollback the transaction
            await db.rollback();
            console.error('Error during delete operation:', error);
            res.status(500).json({ error: 'Failed to delete member' });
        }
    });
});

module.exports = router;
