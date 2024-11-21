const express = require('express');
const router = express.Router();
const connection = require('../utils/db'); // Import MySQL connection

// Get all members and calculate statistics
router.get('/', (req, res) => {
    // Fetch all members
    const query = 'SELECT * FROM Members';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching members:', err);
            return res.status(500).send('Error fetching members');
        }

        // Calculate membership statistics
        const statsQuery = `
            SELECT 
                COUNT(*) AS totalMembers, 
                COUNT(CASE WHEN membership_type = 'Basic' THEN 1 END) AS basicMembers,
                COUNT(CASE WHEN membership_type = 'Premium' THEN 1 END) AS premiumMembers,
                COUNT(CASE WHEN membership_type = 'VIP' THEN 1 END) AS vipMembers
            FROM Members WHERE active = 1;
        `;

        connection.query(statsQuery, (err, statsResults) => {
            if (err) {
                console.error('Error fetching stats:', err);
                return res.status(500).send('Error fetching statistics');
            }

            const stats = {
                totalMembers: statsResults[0].totalMembers,
                activeMembers: statsResults[0].totalMembers, // Adjust logic if needed for active/inactive
                membersByType: {
                    Basic: statsResults[0].basicMembers,
                    Premium: statsResults[0].premiumMembers,
                    VIP: statsResults[0].vipMembers,
                },
            };

            // Render the 'entity' template and pass the member data and statistics
            res.render('entity', {
                title: 'Members',
                buttonText: 'Add New Member',
                entity: 'member',
                headers: ['Member ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Join Date', 'Membership Type'],
                records: results, // Member data
                stats: stats, // Membership statistics
                idField: 'memberID',
            });
        });
    });
});

// Render the Create Screen
router.get('/create', (req, res) => {
    console.log('Create Route Hit');
    res.render('members_form', { formTitle: 'Add', buttonText: 'Create', action: '/members', record: {} });
});

// Get a Specific Member by ID
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

// Add a New Member
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

// === UPDATE: Modify a Member's Details ===
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

// === DELETE: Remove a Member ===
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
