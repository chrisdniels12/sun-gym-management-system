# Sun Gym Management System

A modern gym management system built with Node.js, Express, Handlebars, and MySQL.

## Setup Instructions

1. **Clone the Repository**
```bash
# Clone the repository
git clone https://github.com/chrisdniels12/sun-gym-management-system.git

# Navigate to project directory
cd sun-gym-management-system
```

2. **Install Dependencies**
```bash
# Install all required packages
npm install
```

3. **Database Setup**
```bash
# Create database connector from example
cp database/db-connector.example.js database/db-connector.js

# Edit database credentials in db-connector.js with YOUR OSU credentials
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_[YOUR_ONID]',  // Example: cs340_smithj
    password: '[YOUR_DB_PASSWORD]',
    database: 'cs340_[YOUR_ONID]'  // Same as user
});

# Import the provided DDL and DML files into YOUR database
# Log into phpMyAdmin with YOUR credentials
# Go to the 'Import' tab
# Upload and execute these files in order:
1. database/DDL.sql  # Creates tables
2. database/DML.sql  # Adds sample data
```

**Note**: Each user needs to:
1. Use their own ONID credentials (cs340_[onid])
2. Import the DDL.sql to create tables in their database
3. Import the DML.sql to add sample data
4. Update db-connector.js with their credentials

4. **Start the Server**
```bash
# Start the server
node app.js
```

5. **Access the Application**
```bash
# Replace [your_onid] with your OSU ONID username
# Example: if your ONID is smithj, use:
# http://localhost:8999/~smithj/CS340/sun-gym-management-system
```

- Open browser to: `http://localhost:8999/~[your_onid]/CS340/sun-gym-management-system`
- All routes are prefixed with: `/~[your_onid]/CS340/sun-gym-management-system`

**Note about ONID paths:**
- Each user needs to use their own ONID username in the URL
- The app uses an environment variable `ONID` to set this path
- If not set, it defaults to 'piercebe' for development
- You can set your ONID before starting the server:
  ```bash
  # Windows Command Prompt
  set ONID=your_onid
  node app.js

  # Windows PowerShell
  $env:ONID = "your_onid"
  node app.js

  # Mac/Linux
  export ONID=your_onid
  node app.js
  ```

## Important Notes

### Base Path and ONID Setup
- Each user needs to set their ONID environment variable before starting the server
- This affects all URLs and file paths in the application
- If not set, defaults to 'piercebe' for development

### Common Issues
1. **Styling not loading:**
   - Verify ONID is set correctly
   - Check route passes `basePath` to template
   - Verify CSS file exists and is imported

2. **Links not working:**
   - Check `basePath` in template
   - Verify route handler includes `basePath`
   - Check browser console for path errors

3. **API calls failing:**
   - Verify `BASE_PATH` in JavaScript
   - Check network tab for correct URLs
   - Ensure ONID environment variable is set

## Project Structure

```
sun-gym-management-system/
├── database/                 # Database configuration
│   ├── DDL.sql              # Database schema
│   ├── DML.sql              # Sample data and queries
│   └── db-connector.js      # Database connection setup
├── public/
│   ├── css/                 # Stylesheets
│   │   ├── main.css         # Shared styles
│   │   ├── index.css        # Home page styles
│   │   └── [entity].css     # Entity-specific styles
│   ├── js/                  # Client-side JavaScript
│   │   └── [entity]Operations.js  # CRUD operations
│   └── html_archive/        # Original HTML files (reference)
├── routes/                  # Express route handlers
│   └── [entity].js         # Entity-specific routes
├── views/                   # Handlebars templates
│   ├── index.hbs           # Home page template
│   └── [entity].hbs        # Entity-specific templates
├── app.js                   # Main application file
└── package.json            # Project dependencies
```

## Features

### Primary Tables
- **Members**: Full member profile management with duplicate detection
- **Trainers**: Trainer profiles with specialization tracking
- **Classes**: Class scheduling with capacity management
- **Equipment**: Inventory with status tracking
- **Payments**: Member payment processing and history

### Relationship Management
- **Member-Equipment**: Track equipment usage by members
- **Class-Bookings**: Manage class enrollments
- **Member-Trainer**: Personal training assignments
- **Trainer-Equipment**: Equipment certifications

## API Endpoints

### Primary Tables
- `/api/members` - Member CRUD with duplicate checking
- `/api/trainers` - Trainer management with specializations
- `/api/classes` - Class scheduling with capacity checks
- `/api/equipment` - Equipment tracking with status updates
- `/api/payments` - Payment processing and history

### Relationships
- `/api/member-equipment` - Equipment usage tracking
- `/api/class-bookings` - Class enrollment management
- `/api/member-trainer` - Training relationship management
- `/api/trainer-equipment` - Certification tracking

## Technologies

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - Handlebars templating
  - Modern responsive design
  - Client-side validation

- **Backend**:
  - Node.js & Express.js
  - MySQL with connection pooling
  - RESTful API architecture
  - Server-side validation

- **Development Tools**:
  - Git for version control
  - npm for package management

## Development Notes

### Error Handling
- All forms include duplicate entry detection
- Server-side validation for all inputs
- Proper error messages displayed to users
- Database errors properly caught and handled

### Code Organization
- Handlebars templates for all pages including home page
- Modular CSS with shared styles in main.css
- Separate JavaScript files for each entity
- Consistent naming conventions
- Clear file structure

### Database
- Proper foreign key constraints
- Indexed fields for performance
- Sample data for testing
- Clear schema documentation

### Version Control
- Main branch: Current working version with Handlebars implementation
- All changes documented in commits