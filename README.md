# Sun Gym Management System

A comprehensive gym management system built with Node.js, Express, and MySQL.

## Quick Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd sun-gym-management-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
# Create database connector
cp database/db-connector.example.js database/db-connector.js

# Edit database credentials
nano database/db-connector.js

# Import database schema
mysql -u username -p database_name < sql/DDL.sql
```

4. **Start Server**
```bash
npm run dev  # Development with auto-reload
# or
npm start    # Production
```

5. **Access Application**
- Open browser to: `http://localhost:8999`
- Default routes are prefixed with: `/~piercebe/CS340/sun-gym-management-system`

## Project Structure

```
├── public/
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side JavaScript
│   └── html/         # Static HTML pages
├── routes/           # API route handlers
├── sql/             # Database scripts
│   ├── DDL.sql      # Schema definition
│   └── DML.sql      # Query templates
├── views/           # Handlebars templates
└── app.js           # Main application file
```

## Features

### Member Management
- Member registration and profile management
- Membership type tracking (Basic, Premium, VIP)
- Payment history tracking
- Equipment usage monitoring
- Class booking system

### Trainer Management
- Trainer profiles with specializations
- Equipment certifications
- Member assignments
- Class scheduling
- Availability tracking

### Equipment Management
- Inventory tracking
- Usage monitoring
- Maintenance scheduling
- Status tracking (Available, In Use, Under Maintenance)

### Class Management
- Class scheduling system
- Capacity management
- Trainer assignments
- Member bookings
- Attendance tracking

## API Endpoints

### Primary Entities
- `/api/members` - Member CRUD operations
- `/api/trainers` - Trainer management
- `/api/equipment` - Equipment inventory
- `/api/classes` - Class scheduling
- `/api/payments` - Payment tracking

### Relationships
- `/api/class-bookings` - Class enrollment
- `/api/member-equipment` - Equipment usage
- `/api/trainer-equipment` - Equipment certifications
- `/api/member-trainer` - Training relationships

## Technologies

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Template Engine**: Handlebars
- **Development**: Nodemon

## Development Notes

- Run tests before committing: `npm test`
- Database credentials should never be committed
- Use `npm run dev` for development with auto-reload
- All API routes include proper error handling
- Frontend includes form validation