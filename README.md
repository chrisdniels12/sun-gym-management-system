# Sun Gym Management System

A modern gym management system built with Node.js, Express, Handlebars, and MySQL.

## Setup Instructions

### Local Development Setup
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

**Note about ONID paths:**
- Each user needs to use their own ONID username in the URL
- The app uses an environment variable `ONID` to set this path
- If not set, it defaults to 'piercebe' for development
- You can set your ONID before starting the server:
  ```bash
   # Windows PowerShell
  $env:ONID = "your_onid"
  node app.js

  # Windows Command Prompt
  set ONID=your_onid
  node app.js

  # Mac/Linux
  export ONID=your_onid
  node app.js
  ```

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

### OSU Engineering Server Setup
1. **Switch to Engineering Server Branch**
```bash
# Switch to the osu-engr-server branch
git checkout osu-engr-server
```

This branch includes enhanced modal functionality for editing records, consistent styling across all pages, and improved error handling.

2. **SSH into Engineering Server**
```bash
# SSH into flip server (replace [onid] with your ONID)
ssh [onid]@access.engr.oregonstate.edu
```

3. **Clone Repository on Server**
```bash
# Navigate to your public_html/CS340 directory
cd public_html/CS340

# Clone the repository
git clone -b osu-engr-server https://github.com/chrisdniels12/sun-gym-management-system.git
```

4. **Install Dependencies and Forever**
```bash
# Navigate to project directory
cd sun-gym-management-system

# Install project dependencies
npm install

# Install forever globally if not already installed
npm install -g forever
```

5. **Start the Application**
```bash
# Start the application using forever
forever start app.js

# To restart after changes
forever restartall

# To stop the application
forever stopall

# To list running processes
forever list
```

6. **Access the Application**
- Open browser to: `http://classwork.engr.oregonstate.edu:8997/~[your_onid]/CS340/sun-gym-management-system`
- Replace [your_onid] with your ONID username

**Note**: The engineering server uses port 8997 and requires the forever process manager to keep the application running.

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
├── helpers/                 # Helper functions
│   └── handlebars-helpers.js # Custom Handlebars helpers
├── public/
│   ├── css/                 # Stylesheets
│   │   ├── main.css         # Shared styles
│   │   ├── index.css        # Home page styles
│   │   └── [entity].css     # Entity-specific styles
│   ├── js/                  # Client-side JavaScript
│   │   ├── notifications.js # Notification system
│   │   └── [entity]Operations.js  # CRUD operations
│   ├── js_archive/         # Archived JavaScript files
│   └── html_archive/       # Original HTML files (reference)
├── routes/                  # Express route handlers
│   └── [entity].js         # Entity-specific routes
├── views/                   # Handlebars templates
│   ├── layouts/            # Layout templates
│   │   └── main.hbs        # Main layout template
│   ├── index.hbs           # Home page template
│   └── [entity].hbs        # Entity-specific templates
├── .foreverignore         # Forever process manager ignore file
├── .gitignore             # Git ignore file
├── app.js                 # Main application file
└── package.json          # Project dependencies
