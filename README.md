# Sun Gym Management System

A modern gym management system built with Node.js, Express, Handlebars, and MySQL.

[Previous content remains the same until OSU Engineering Server Setup section]

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

[Rest of the README remains exactly the same...]
