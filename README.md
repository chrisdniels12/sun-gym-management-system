# Sun Gym Management System

A comprehensive gym management system that handles member relationships, equipment tracking, class scheduling, and trainer certifications.

## Core Features

### Member Management
- Member registration and profiles
- Membership tracking
- Payment history
- Equipment usage
- Class bookings

### Trainer Management
- Trainer profiles and specializations
- Equipment certifications
- Member assignments
- Class scheduling
- Availability tracking

### Equipment Management
- Inventory tracking
- Usage monitoring
- Maintenance scheduling
- Certification requirements
- Status tracking

### Class Management
- Scheduling system
- Capacity management
- Trainer assignments
- Member bookings
- Attendance tracking

## Database Structure
- Members
- Trainers
- Equipment
- Classes
- Payments
- ClassBookings
- MemberEquipment
- TrainerEquipment
- MemberTrainer

## Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- ORM: Sequelize
- Template Engine: Handlebars

## Setup
1. Clone repository

git clone https://github.com/your-username/sun-gym-management-system.git
cd sun-gym-management-system

2. Install dependencies:

npm install

3. Database Configuration:
- Copy the example database connector file:
  ```
  cp database/db-connector.example.js database/db-connector.js
  ```
- Open `database/db-connector.js` and update the following fields with your OSU database credentials:
  ```javascript
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
  ```

4. Start the server:

npm start

5. Open a web browser and navigate to `http://localhost:9999` (or whatever port you've configured).

## Notes
- Make sure not to commit `database/db-connector.js` as it contains sensitive information.
- Always pull the latest changes before starting work: `git pull origin main`

## File Structure
/
HTML/
   index.html
   members.html
   trainers.html
   equipment.html
   classes.html
   payments.html
   class_bookings.html
   member_equipment.html
   trainer_equipment.html
   member_trainer.html
SQL/
   DDL.sql
   DML.sql
README.md

## API Endpoints
- `/api/members`
- `/api/trainers`
- `/api/equipment`
- `/api/classes`
- `/api/payments`
- `/api/class-bookings`
- `/api/member-equipment`
- `/api/trainer-equipment`
- `/api/member-trainer`