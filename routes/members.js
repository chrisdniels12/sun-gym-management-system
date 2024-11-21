const express = require('express');
const router = express.Router();
const connection = require('../utils/db');

/**
 * GET /members
 * Display all members with statistics
 */
router.get('/', (req, res) => {
    // Query to get all members
    const membersQuery = 'SELECT * FROM Members ORDER BY lastName, firstName';

    connection.query(membersQuery, (err, members) => {
        if (err) {
            console.error('Error fetching members:', err);
            return res.status(500).send('Error fetching members');
        }

        // Query to get membership statistics
        const statsQuery = `
            SELECT 
                COUNT(*) AS totalMembers,
                SUM(CASE WHEN MONTH(joinDate) = MONTH(CURRENT_DATE) 
                    AND YEAR(joinDate) = YEAR(CURRENT_DATE) THEN 1 ELSE 0 END) AS newMembers,
                COUNT(CASE WHEN membershipType = 'Basic' THEN 1 END) AS basicMembers,
                COUNT(CASE WHEN membershipType = 'Premium' THEN 1 END) AS premiumMembers,
                COUNT(CASE WHEN membershipType = 'VIP' THEN 1 END) AS vipMembers
            FROM Members;
        `;

        connection.query(statsQuery, (err, statsResults) => {
            if (err) {
                console.error('Error fetching stats:', err);
                return res.status(500).send('Error fetching statistics');
            }

            // Render the members page with data and statistics
            res.render('members', {
                members: members,
                stats: {
                    totalMembers: statsResults[0].totalMembers,
                    newMembers: statsResults[0].newMembers,
                    membersByType: {
                        Basic: statsResults[0].basicMembers,
                        Premium: statsResults[0].premiumMembers,
                        VIP: statsResults[0].vipMembers
                    }
                }
            });
        });
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

    connection.query(query, [id], (err, results) => {
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
    const { firstName, lastName, email, phoneNumber, joinDate, membershipType } = req.body;

    const query = `
        INSERT INTO Members (firstName, lastName, email, phoneNumber, joinDate, membershipType)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
        firstName,
        lastName,
        email,
        phoneNumber || null,
        joinDate,
        membershipType,
    ];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error creating member:', err);
            return res.status(500).send('Failed to create member');
        }
        res.redirect('/members'); // Redirect to members list after successful creation
    });
});

/**
 * POST /members/:id
 * Update an existing member
 */
router.post('/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, joinDate, membershipType } = req.body;

    const query = `
        UPDATE Members
        SET firstName = ?, lastName = ?, email = ?, phoneNumber = ?, joinDate = ?, membershipType = ?
        WHERE memberID = ?
    `;
    const values = [
        firstName,
        lastName,
        email,
        phoneNumber,
        joinDate,
        membershipType,
        id,
    ];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating member:', err);
            return res.status(500).send('Failed to update member');
        }
        res.redirect('/members'); // Redirect back to the members list
    });
});

/**
 * POST /members/delete/:id
 * Delete a member
 */
router.post('/delete/:id', (req, res) => {
    console.log('DELETE request received for ID:', req.params.id);

    const { id } = req.params;
    const query = 'DELETE FROM Members WHERE memberID = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting member:', err);
            return res.status(500).json({ error: 'Failed to delete member' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.redirect('/members');
    });
});

module.exports = router;
