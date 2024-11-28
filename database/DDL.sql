-- disable commits and foreign key checks 
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Drop Tables if they exist
DROP TABLE IF EXISTS ClassBookings, MemberEquipment, TrainerEquipment, MemberTrainer, Payments, Classes, Equipments, Trainers, Members;

-- Members Table creation with improved constraints and indexes
CREATE TABLE Members (
    memberID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),  -- Increased length for international numbers
    joinDate DATE NOT NULL,
    membershipType ENUM('Basic', 'Premium', 'VIP') NOT NULL,
    UNIQUE KEY unique_email (email),
    INDEX idx_member_name (lastName, firstName),
    INDEX idx_membership (membershipType),
    INDEX idx_join_date (joinDate),
    CONSTRAINT chk_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Trainers Table creation with improved constraints and indexes
CREATE TABLE Trainers (
    trainerID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),  -- Increased length for international numbers
    hireDate DATE NOT NULL,
    specialization ENUM('Yoga', 'Strength Training', 'Pilates', 'CrossFit', 'Cycling') NOT NULL,
    UNIQUE KEY unique_trainer_email (email),
    INDEX idx_trainer_name (lastName, firstName),
    INDEX idx_specialization (specialization),
    INDEX idx_hire_date (hireDate),
    CONSTRAINT chk_trainer_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Classes Table creation with improved constraints and indexes
CREATE TABLE Classes (
    classID INT AUTO_INCREMENT PRIMARY KEY,
    className VARCHAR(100) NOT NULL,
    trainerID INT NULL,
    scheduleTime TIME NOT NULL,
    scheduleDay ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    maxCapacity INT NOT NULL,
    FOREIGN KEY (trainerID) REFERENCES Trainers(trainerID) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_schedule (scheduleDay, scheduleTime),
    INDEX idx_trainer (trainerID),
    CONSTRAINT chk_capacity CHECK (maxCapacity > 0)
);

-- Payments Table with improved constraints and indexes
CREATE TABLE Payments (
    paymentID INT AUTO_INCREMENT PRIMARY KEY,
    memberID INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paymentDate DATE NOT NULL,
    paymentMethod ENUM('Credit Card', 'Debit Card', 'Cash', 'Bank Transfer') NOT NULL,
    FOREIGN KEY (memberID) REFERENCES Members(memberID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_payment_date (paymentDate),
    INDEX idx_member (memberID),
    INDEX idx_payment_method (paymentMethod),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

-- Equipments Table with improved constraints and indexes
CREATE TABLE Equipments (
    equipmentID INT AUTO_INCREMENT PRIMARY KEY,
    equipmentName VARCHAR(255) NOT NULL,
    equipmentType VARCHAR(50) NOT NULL,
    purchaseDate DATE NOT NULL,
    lastMaintenanceDate DATE,
    status ENUM('Available', 'In Use', 'Under Maintenance', 'Out of Order') NOT NULL,
    location VARCHAR(100),
    INDEX idx_equipment_type (equipmentType),
    INDEX idx_status (status),
    INDEX idx_maintenance (lastMaintenanceDate),
    CONSTRAINT chk_maintenance_date CHECK (lastMaintenanceDate IS NULL OR lastMaintenanceDate >= purchaseDate)
);

-- ClassBookings Intersection Table with improved constraints and indexes
CREATE TABLE ClassBookings (
    bookingID INT AUTO_INCREMENT PRIMARY KEY,
    memberID INT NOT NULL,
    classID INT NOT NULL,
    bookingDate DATE NOT NULL,
    FOREIGN KEY (memberID) REFERENCES Members(memberID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (classID) REFERENCES Classes(classID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_booking_date (bookingDate),
    INDEX idx_member_class (memberID, classID),
    UNIQUE KEY unique_member_class_date (memberID, classID, bookingDate)
);

-- MemberEquipment Intersection Table with improved constraints and indexes
CREATE TABLE MemberEquipment (
    memberEquipID INT AUTO_INCREMENT PRIMARY KEY,
    memberID INT NOT NULL,
    equipmentID INT NOT NULL,
    usageDate DATE NOT NULL,
    usageDuration INT NOT NULL,  -- Duration in minutes
    FOREIGN KEY (memberID) REFERENCES Members(memberID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (equipmentID) REFERENCES Equipments(equipmentID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_usage_date (usageDate),
    INDEX idx_member_equipment (memberID, equipmentID),
    CONSTRAINT chk_usage_duration CHECK (usageDuration > 0)
);

-- TrainerEquipment Intersection Table with improved constraints and indexes
CREATE TABLE TrainerEquipment (
    equipTrainID INT AUTO_INCREMENT PRIMARY KEY,
    trainerID INT NOT NULL,
    equipmentID INT NOT NULL,
    assignmentDate DATE NOT NULL,
    FOREIGN KEY (trainerID) REFERENCES Trainers(trainerID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (equipmentID) REFERENCES Equipments(equipmentID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_assignment_date (assignmentDate),
    INDEX idx_trainer_equipment (trainerID, equipmentID),
    UNIQUE KEY unique_trainer_equipment (trainerID, equipmentID)
);

-- MemberTrainer Intersection Table with improved constraints and indexes
CREATE TABLE MemberTrainer (
    memberTrainerID INT AUTO_INCREMENT PRIMARY KEY,
    memberID INT NOT NULL,
    trainerID INT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE,  -- Optional end date for ongoing training relationships
    FOREIGN KEY (memberID) REFERENCES Members(memberID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (trainerID) REFERENCES Trainers(trainerID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_date_range (startDate, endDate),
    INDEX idx_member_trainer (memberID, trainerID),
    CONSTRAINT chk_date_range CHECK (endDate IS NULL OR endDate >= startDate)
);

-- Insert example data (unchanged from original)
-- Members
INSERT INTO Members (memberID, firstName, lastName, email, phoneNumber, joinDate, membershipType) VALUES
(1, 'John', 'Doe', 'john.doe@email.com', '123-456-7890', '2023-01-15', 'Premium'),
(2, 'Jane', 'Smith', 'jane.smith@email.com', NULL, '2022-02-20', 'Basic'),
(3, 'Michael', 'Brown', 'mbrown@examlpe.com', '987-654-3210', '2021-05-25', 'VIP');

-- Trainers
INSERT INTO Trainers (trainerID, firstName, lastName, email, phoneNumber, hireDate, specialization) VALUES
(1, 'Alice', 'Green', 'alice.green@email.com', '234-567-8901', '2022-03-01', 'Yoga'),
(2, 'Bob', 'White', 'bob.white@email.com', NULL, '2021-06-10', 'Strength Training'),
(3, 'Clara', 'Black', 'clara.black@email.com', '345-678-9012', '2023-09-15', 'Pilates');

-- Classes
INSERT INTO Classes (classID, className, trainerID, scheduleTime, scheduleDay, maxCapacity) VALUES
(1, 'Yoga', 1, '10:00:00', 'Monday', 20),
(2, 'Strength Training', 2, '11:00:00', 'Tuesday', 15),
(3, 'Pilates', 1, '17:00:00', 'Wednesday', 10);

-- Payments
INSERT INTO Payments (paymentID, memberID, amount, paymentDate, paymentMethod) VALUES
(1, 1, 50.00, '2023-01-15', 'Credit Card'),
(2, 1, 50.00, '2023-02-15', 'Debit Card'),
(3, 2, 30.00, '2023-02-20', 'Cash');

-- Equipments
INSERT INTO Equipments (equipmentID, equipmentName, equipmentType, purchaseDate, lastMaintenanceDate, status, location) VALUES
(1, 'Treadmill', 'Cardio', '2020-01-01', '2024-10-01', 'Available', 'Location1'),
(2, 'Dumbbells', 'Strength', '2021-02-15', NULL, 'In Use', 'Location2'),
(3, 'Rowing Machine', 'Cardio', '2021-11-15', '2023-03-01', 'Under Maintenance', 'Location3');

-- MemberEquipment
INSERT INTO MemberEquipment (memberEquipID, memberID, equipmentID, usageDate, usageDuration) VALUES
(1, 1, 1, '2023-01-20', 30),
(2, 2, 2, '2023-02-15', 45),
(3, 3, 3, '2023-03-10', 60);

-- ClassBookings
INSERT INTO ClassBookings (bookingID, memberID, classID, bookingDate) VALUES
(1, 1, 1, '2023-01-15'),
(2, 1, 2, '2023-02-01'),
(3, 2, 1, '2023-02-20');

-- TrainerEquipment
INSERT INTO TrainerEquipment (equipTrainID, trainerID, equipmentID, assignmentDate) VALUES
(1, 1, 1, '2022-03-01'),
(2, 2, 2, '2021-06-10'),
(3, 3, 3, '2023-01-15');

-- MemberTrainer
INSERT INTO MemberTrainer (memberTrainerID, memberID, trainerID, startDate, endDate) VALUES
(1, 1, 1, '2023-01-15', NULL),
(2, 2, 2, '2023-02-01', '2023-04-01'),
(3, 3, 3, '2023-03-05', NULL);

-- Re-enable Foreign Key Checks and Commit Transactions
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
