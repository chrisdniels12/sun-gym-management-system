// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const db = require('./database/db-connector').pool;

// Handlebars setup
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use('/~piercebe/CS340/sun-gym-management-system', express.static(path.join(__dirname, 'public')));

// Root route - serve index.html
app.get('/~piercebe/CS340/sun-gym-management-system', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Keep HTML routes commented out since files are now in html_archive
// app.get('/~piercebe/CS340/sun-gym-management-system/:page', (req, res) => {
//     const page = req.params.page;
//     // Map URL names to file names
//     const fileMap = {
//         'member-equipment': 'member_equipment',
//         'class-bookings': 'class_bookings',
//         'member-trainer': 'member_trainer',
//         'trainer-equipment': 'trainer_equipment'
//     };
//     // Use mapped filename if it exists, otherwise use the original page name
//     const fileName = fileMap[page] || page;
//     res.sendFile(path.join(__dirname, 'public', 'html_archive', `${fileName}.html`));
// });

// API routes
app.use('/~piercebe/CS340/sun-gym-management-system/api/members', require('./routes/members'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/trainers', require('./routes/trainers'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/classes', require('./routes/classes'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/equipment', require('./routes/equipment'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/payments', require('./routes/payments'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/member-equipment', require('./routes/member-equipment'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/class-bookings', require('./routes/class-bookings'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/member-trainer', require('./routes/member-trainer'));
app.use('/~piercebe/CS340/sun-gym-management-system/api/trainer-equipment', require('./routes/trainer-equipment'));

// Test database connection
async function testDatabase() {
    try {
        const [rows] = await db.query('SELECT * FROM Members LIMIT 1');
        console.log('Database test query results:', rows);
        console.log('Database connection pool ready');
    } catch (error) {
        console.error('Database error:', error);
        console.error('Continuing despite database error - Please connect to OSU VPN');
    }
}

testDatabase();

// Start server
const PORT = process.env.PORT || 8999;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Members route
app.get('/~piercebe/CS340/sun-gym-management-system/members', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Members ORDER BY lastName, firstName');

        // Calculate stats
        const totalMembers = rows.length;
        const newMembers = rows.filter(member => {
            const joinDate = new Date(member.joinDate);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return joinDate >= oneMonthAgo;
        }).length;

        // Pass both members and stats to the template
        res.render('members', {
            members: rows,
            stats: {
                totalMembers: totalMembers,
                newMembers: newMembers
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading members');
    }
});

// Trainers route
app.get('/~piercebe/CS340/sun-gym-management-system/trainers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Trainers ORDER BY lastName, firstName');

        // Calculate stats
        const totalTrainers = rows.length;
        const [classResult] = await db.query('SELECT COUNT(*) as count FROM Classes WHERE trainerID IS NOT NULL');
        const activeClasses = classResult[0].count;

        res.render('trainers', {
            trainers: rows,
            stats: {
                totalTrainers: totalTrainers,
                activeClasses: activeClasses
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading trainers');
    }
});

// Classes route
app.get('/~piercebe/CS340/sun-gym-management-system/classes', async (req, res) => {
    try {
        const [classes] = await db.query('SELECT * FROM Classes ORDER BY scheduleDay, scheduleTime');
        const [trainers] = await db.query('SELECT * FROM Trainers');

        // Calculate stats
        const totalClasses = classes.length;
        const activeClasses = classes.filter(c => c.status === 'active').length;
        const totalEnrollments = classes.reduce((sum, c) => sum + c.currentEnrollment, 0);
        const avgCapacity = totalClasses ?
            Math.round((totalEnrollments / (totalClasses * classes[0].maxCapacity)) * 100) : 0;

        res.render('classes', {
            classes: classes,
            trainers: trainers,
            stats: {
                totalClasses,
                activeClasses,
                totalEnrollments,
                avgCapacity
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading classes');
    }
});

// Equipment route
app.get('/~piercebe/CS340/sun-gym-management-system/equipment', async (req, res) => {
    try {
        const [equipment] = await db.query('SELECT * FROM Equipment ORDER BY equipmentName');

        // Calculate stats
        const totalEquipment = equipment.length;
        const availableEquipment = equipment.filter(e => e.status === 'Available').length;
        const maintenanceEquipment = equipment.filter(e => e.status === 'Maintenance').length;
        const inUseEquipment = equipment.filter(e => e.status === 'In Use').length;

        res.render('equipment', {
            equipment: equipment,
            stats: {
                totalEquipment,
                availableEquipment,
                maintenanceEquipment,
                inUseEquipment
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading equipment');
    }
});

// Payments route
app.get('/~piercebe/CS340/sun-gym-management-system/payments', async (req, res) => {
    try {
        const [payments] = await db.query(`
            SELECT p.paymentID, CONCAT(m.firstName, ' ', m.lastName) AS memberName, 
                   p.amount, p.paymentDate, p.paymentMethod
            FROM Payments p
            JOIN Members m ON p.memberID = m.memberID
            ORDER BY p.paymentDate DESC
        `);

        // Calculate stats with proper formatting
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2);
        const avgPayment = totalPayments ? (parseFloat(totalAmount) / totalPayments).toFixed(2) : '0.00';

        // Get list of members for the add payment form
        const [members] = await db.query('SELECT memberID, firstName, lastName FROM Members ORDER BY lastName, firstName');

        res.render('payments', {
            payments: payments,
            members: members,
            stats: {
                totalPayments,
                totalAmount,
                avgPayment
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading payments');
    }
});

// Add this route
app.get('/~piercebe/CS340/sun-gym-management-system/member-equipment', async (req, res) => {
    try {
        const [usageHistory] = await db.query(`
            SELECT me.memberEquipID, CONCAT(m.firstName, ' ', m.lastName) AS memberName, 
                   e.equipmentName, me.usageDate, me.usageDuration
            FROM MemberEquipment me
            JOIN Members m ON me.memberID = m.memberID
            JOIN Equipment e ON me.equipmentID = e.equipmentID
            ORDER BY me.usageDate DESC
        `);

        const [members] = await db.query('SELECT memberID, firstName, lastName, membershipType FROM Members');
        const [equipment] = await db.query('SELECT equipmentID, equipmentName, type FROM Equipment');

        // Calculate stats
        const totalUsage = usageHistory.length;
        const activeUsers = new Set(usageHistory.map(u => u.memberName)).size;
        const popularEquipment = usageHistory.reduce((acc, curr) => {
            acc[curr.equipmentName] = (acc[curr.equipmentName] || 0) + 1;
            return acc;
        }, {});
        const mostPopular = Object.entries(popularEquipment).sort((a, b) => b[1] - a[1])[0];
        const avgDuration = Math.round(usageHistory.reduce((sum, u) => sum + u.usageDuration, 0) / totalUsage);

        res.render('member-equipment', {
            usageHistory,
            members,
            equipment,
            stats: {
                totalUsage,
                activeUsers,
                popularEquipment: mostPopular ? mostPopular[0] : 'N/A',
                avgDuration
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading member-equipment data');
    }
});
