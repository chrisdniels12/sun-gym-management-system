// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const db = require('./database/db-connector').pool;
const handlebars = require('express-handlebars');

// Add this near the top of app.js
const ONID = process.env.ONID || 'piercebe'; // Default for development
const BASE_PATH = `/~${ONID}/CS340/sun-gym-management-system`;
console.log('Current BASE_PATH:', BASE_PATH);

// Handlebars setup
const hbs = handlebars.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        formatTime: function (time) {
            // Convert time to HH:mm format
            return time ? time.slice(0, 5) : '';  // Takes only HH:mm part
        },
        toLowerCase: function (str) {
            return str ? str.toLowerCase() : '';
        }
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(`${BASE_PATH}`, express.static(path.join(__dirname, 'public')));

// Root route - serve index.html with BASE_PATH
app.get(`${BASE_PATH}`, (req, res) => {
    res.render('index', { basePath: BASE_PATH });
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
app.use(`${BASE_PATH}/api/members`, require('./routes/members'));
app.use(`${BASE_PATH}/api/trainers`, require('./routes/trainers'));
app.use(`${BASE_PATH}/api/classes`, require('./routes/classes'));
app.use(`${BASE_PATH}/api/equipment`, require('./routes/equipment'));
app.use(`${BASE_PATH}/api/payments`, require('./routes/payments'));
app.use(`${BASE_PATH}/api/member-equipment`, require('./routes/member-equipment'));
app.use(`${BASE_PATH}/api/class-bookings`, require('./routes/class-bookings'));
app.use(`${BASE_PATH}/api/member-trainer`, require('./routes/member-trainer'));
app.use(`${BASE_PATH}/api/trainer-equipment`, require('./routes/trainer-equipment'));

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
app.get(`${BASE_PATH}/members`, async (req, res) => {
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
            title: 'Manage Members',
            customCSS: 'members',
            customJS: 'memberOperations',
            basePath: BASE_PATH,
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
app.get(`${BASE_PATH}/trainers`, async (req, res) => {
    try {
        const [trainers] = await db.query('SELECT * FROM Trainers');

        // Calculate stats
        const totalTrainers = trainers.length;
        // ... other stats ...

        res.render('trainers', {
            basePath: BASE_PATH,  // Make sure this is here
            trainers: trainers,
            stats: {
                totalTrainers,
                // ... other stats
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading trainers');
    }
});

// Classes route
app.get(`${BASE_PATH}/classes`, async (req, res) => {
    try {
        const [classes] = await db.query(`
            SELECT c.*, CONCAT(t.firstName, ' ', t.lastName) as trainerName 
            FROM Classes c
            LEFT JOIN Trainers t ON c.trainerID = t.trainerID
            ORDER BY c.scheduleDay, c.scheduleTime
        `);
        const [trainers] = await db.query('SELECT * FROM Trainers');

        // Calculate stats
        const totalClasses = classes.length;
        const activeClasses = classes.filter(c => c.status === 'active').length;
        const totalEnrollments = classes.reduce((sum, c) => sum + c.currentEnrollment, 0);
        const avgCapacity = totalClasses ?
            Math.round((totalEnrollments / (totalClasses * classes[0].maxCapacity)) * 100) : 0;

        res.render('classes', {
            basePath: BASE_PATH,
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
app.get(`${BASE_PATH}/equipment`, async (req, res) => {
    try {
        const [equipment] = await db.query('SELECT * FROM Equipments ORDER BY equipmentName');

        // Calculate stats
        const totalEquipment = equipment.length;
        const availableEquipment = equipment.filter(e => e.status === 'Available').length;
        const maintenanceEquipment = equipment.filter(e => e.status === 'Maintenance').length;
        const inUseEquipment = equipment.filter(e => e.status === 'In Use').length;

        res.render('equipment', {
            basePath: BASE_PATH,
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
app.get(`${BASE_PATH}/payments`, async (req, res) => {
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
            basePath: BASE_PATH,
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
app.get(`${BASE_PATH}/member-equipment`, async (req, res) => {
    try {
        const [usageHistory] = await db.query(`
            SELECT me.memberEquipID, CONCAT(m.firstName, ' ', m.lastName) AS memberName, 
                   e.equipmentName, me.usageDate, me.usageDuration
            FROM MemberEquipment me
            JOIN Members m ON me.memberID = m.memberID
            JOIN Equipments e ON me.equipmentID = e.equipmentID
            ORDER BY me.usageDate DESC
        `);

        const [members] = await db.query('SELECT memberID, firstName, lastName, membershipType FROM Members');
        const [equipment] = await db.query('SELECT equipmentID, equipmentName, equipmentType FROM Equipments');

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
            basePath: BASE_PATH,
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

// Add this route
app.get(`${BASE_PATH}/class-bookings`, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT cb.bookingID, 
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   c.className, c.scheduleDay, c.scheduleTime,
                   cb.bookingDate
            FROM ClassBookings cb
            JOIN Members m ON cb.memberID = m.memberID
            JOIN Classes c ON cb.classID = c.classID
            ORDER BY cb.bookingDate DESC, c.scheduleTime
        `);

        const [members] = await db.query('SELECT memberID, firstName, lastName, membershipType FROM Members');
        const [classes] = await db.query('SELECT classID, className, scheduleDay, scheduleTime FROM Classes');

        // Calculate stats
        const totalBookings = bookings.length;
        const activeMembers = new Set(bookings.map(b => b.memberName)).size;
        const classPopularity = bookings.reduce((acc, curr) => {
            acc[curr.className] = (acc[curr.className] || 0) + 1;
            return acc;
        }, {});
        const popularClass = Object.entries(classPopularity).sort((a, b) => b[1] - a[1])[0];
        const avgAttendance = Math.round((totalBookings / classes.length) * 100);

        res.render('class-bookings', {
            basePath: BASE_PATH,
            bookings,
            members,
            classes,
            stats: {
                totalBookings,
                activeMembers,
                popularClass: popularClass ? popularClass[0] : 'N/A',
                avgAttendance
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading class bookings');
    }
});

// Member-Trainer route
app.get(`${BASE_PATH}/member-trainer`, async (req, res) => {
    try {
        const [assignments] = await db.query(`
            SELECT mt.memberTrainerID, 
                   CONCAT(m.firstName, ' ', m.lastName) as memberName,
                   CONCAT(t.firstName, ' ', t.lastName) as trainerName,
                   t.specialization,
                   mt.startDate, mt.endDate,
                   CASE 
                       WHEN mt.endDate IS NULL THEN 'Active'
                       WHEN mt.endDate >= CURRENT_DATE THEN 'Active'
                       ELSE 'Completed'
                   END as status
            FROM MemberTrainer mt
            JOIN Members m ON mt.memberID = m.memberID
            JOIN Trainers t ON mt.trainerID = t.trainerID
            ORDER BY mt.startDate DESC
        `);

        const [members] = await db.query('SELECT memberID, firstName, lastName, membershipType FROM Members');
        const [trainers] = await db.query('SELECT trainerID, firstName, lastName, specialization FROM Trainers');

        // Calculate stats
        const activeAssignments = assignments.filter(a => a.status === 'Active').length;
        const membersTraining = new Set(assignments.filter(a => a.status === 'Active').map(a => a.memberName)).size;
        const trainerWorkload = assignments.reduce((acc, curr) => {
            if (curr.status === 'Active') {
                acc[curr.trainerName] = (acc[curr.trainerName] || 0) + 1;
            }
            return acc;
        }, {});
        const busiestTrainer = Object.entries(trainerWorkload).sort((a, b) => b[1] - a[1])[0];
        const avgTrainingDays = Math.round(assignments.reduce((sum, a) => {
            if (a.endDate) {
                const days = Math.round((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24));
                return sum + days;
            }
            return sum;
        }, 0) / assignments.length);

        res.render('member-trainer', {
            basePath: BASE_PATH,  // Add this line
            assignments,
            members,
            trainers,
            stats: {
                activeAssignments,
                membersTraining,
                busiestTrainer: busiestTrainer ? busiestTrainer[0] : 'N/A',
                avgTrainingDays
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading member-trainer data');
    }
});

// Add this route
app.get(`${BASE_PATH}/trainer-equipment`, async (req, res) => {
    try {
        const [certifications] = await db.query(`
            SELECT te.trainerEquipID, 
                   CONCAT(t.firstName, ' ', t.lastName) as trainerName,
                   e.equipmentName,
                   te.certificationDate, te.expiryDate,
                   CASE 
                       WHEN te.expiryDate >= CURRENT_DATE THEN 'Valid'
                       ELSE 'Expired'
                   END as status
            FROM TrainerEquipment te
            JOIN Trainers t ON te.trainerID = t.trainerID
            JOIN Equipments e ON te.equipmentID = e.equipmentID
            ORDER BY te.expiryDate DESC
        `);

        const [trainers] = await db.query('SELECT trainerID, firstName, lastName, specialization FROM Trainers');
        const [equipment] = await db.query('SELECT equipmentID, equipmentName, equipmentType FROM Equipments');

        // Calculate stats
        const totalCertifications = certifications.length;
        const certifiedTrainers = new Set(certifications.map(c => c.trainerName)).size;
        const trainerCerts = certifications.reduce((acc, curr) => {
            if (curr.status === 'Valid') {
                acc[curr.trainerName] = (acc[curr.trainerName] || 0) + 1;
            }
            return acc;
        }, {});
        const mostCertifiedTrainer = Object.entries(trainerCerts).sort((a, b) => b[1] - a[1])[0];
        const avgCertifications = Math.round(Object.values(trainerCerts).reduce((sum, count) => sum + count, 0) / certifiedTrainers);

        res.render('trainer-equipment', {
            basePath: BASE_PATH,
            certifications,
            trainers,
            equipment,
            stats: {
                totalCertifications,
                certifiedTrainers,
                mostCertifiedTrainer: mostCertifiedTrainer ? mostCertifiedTrainer[0] : 'N/A',
                avgCertifications
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading trainer-equipment data');
    }
});
