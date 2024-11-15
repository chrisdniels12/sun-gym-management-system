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

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: SQL (MySQL/MariaDB)
- API: RESTful endpoints

## Setup
1. Clone repository
2. Import schema (DDL.sql)
3. Import data (DML.sql)
4. Configure database connection
5. Open index.html

## File Structure
/
├── HTML/
│   ├── index.html
│   ├── members.html
│   ├── trainers.html
│   ├── equipment.html
│   ├── classes.html
│   ├── payments.html
│   ├── class_bookings.html
│   ├── member_equipment.html
│   ├── trainer_equipment.html
│   └── member_trainer.html
├── SQL/
│   ├── DDL.sql
│   └── DML.sql
└── README.md

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