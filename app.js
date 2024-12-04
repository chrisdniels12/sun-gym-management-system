// App.js - Sun Gym Management System
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const db = require('./database/db-connector').pool;
const handlebars = require('express-handlebars');

// Environment configuration
const ONID = process.env.ONID || 'piercebe'; // Default for development
const IS_OSU_SERVER = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 8997; // OSU engr server port

// Set base path based on environment
const BASE_PATH = IS_OSU_SERVER
    ? '' // Empty for OSU server since we're serving from root
    : `/~${ONID}/CS340/sun-gym-management-system`;
console.log('Current BASE_PATH:', BASE_PATH);
console.log('Running on:', IS_OSU_SERVER ? 'OSU Server' : 'Local Development');

// Handlebars setup
const hbs = handlebars.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        formatTime: function (time) {
            return time ? time.slice(0, 5) : '';
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

// Serve static files with environment-aware path
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));

// Root route with environment-aware path
app.get(BASE_PATH || '/', (req, res) => {
    res.render('index', {
        basePath: BASE_PATH,
        isOsuServer: IS_OSU_SERVER
    });
});

// API routes with environment-aware paths
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
        console.log('Database connection pool ready');
    } catch (error) {
        console.error('Database error:', error);
        console.error('Please ensure you are connected to the OSU VPN');
    }
}

testDatabase();

// Dynamic routes for each main page
const routes = [
    'members', 'trainers', 'classes', 'equipment', 'payments',
    'member-equipment', 'class-bookings', 'member-trainer', 'trainer-equipment'
];

routes.forEach(route => {
    app.get(`${BASE_PATH}/${route}`, async (req, res) => {
        try {
            // Common data for all routes
            const viewData = {
                basePath: BASE_PATH,
                isOsuServer: IS_OSU_SERVER,
                title: `Manage ${route.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
                customCSS: route,
                customJS: `${route.replace(/-/g, '')}Operations`
            };

            // Route-specific data fetching
            switch (route) {
                case 'members':
                    const [members] = await db.query('SELECT * FROM Members ORDER BY lastName, firstName');
                    viewData.members = members;
                    viewData.stats = {
                        totalMembers: members.length,
                        newMembers: members.filter(member => {
                            const joinDate = new Date(member.joinDate);
                            const oneMonthAgo = new Date();
                            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                            return joinDate >= oneMonthAgo;
                        }).length
                    };
                    break;

                case 'trainers':
                    const [trainers] = await db.query('SELECT * FROM Trainers');
                    viewData.trainers = trainers;
                    viewData.stats = {
                        totalTrainers: trainers.length
                    };
                    break;

                // ... rest of your route-specific cases remain the same
            }

            res.render(route, viewData);
        } catch (error) {
            console.error(`Error in ${route} route:`, error);
            res.status(500).send(`Error loading ${route}`);
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at: ${IS_OSU_SERVER
        ? `http://classwork.engr.oregonstate.edu:${PORT}`
        : `http://localhost:${PORT}${BASE_PATH}`
        }`);
});
