-- ********************************************
-- Sun Gym Management System DML Queries
-- ********************************************

-- ********************************************
-- MEMBER OPERATIONS
-- ********************************************

-- SELECT OPERATIONS
-- Get all members (with index usage)
SELECT memberID, firstName, lastName, email, phoneNumber, joinDate, membershipType 
FROM Members
ORDER BY lastName, firstName;

-- Get a specific member by ID
SELECT memberID, firstName, lastName, email, phoneNumber, joinDate, membershipType 
FROM Members 
WHERE memberID = :memberID_input;

-- Search members by name (utilizing name index)
SELECT memberID, firstName, lastName, email, phoneNumber, joinDate, membershipType 
FROM Members 
WHERE lastName LIKE CONCAT(:search_input, '%')
   OR firstName LIKE CONCAT(:search_input, '%')
ORDER BY lastName, firstName;

-- Get members by membership type (using membership index)
SELECT memberID, firstName, lastName, email, membershipType 
FROM Members 
WHERE membershipType = :membershipType_input
ORDER BY lastName, firstName;

-- Get members who joined in date range (using join_date index)
SELECT memberID, firstName, lastName, joinDate, membershipType
FROM Members
WHERE joinDate BETWEEN :start_date AND :end_date
ORDER BY joinDate DESC;

-- Get member statistics
SELECT membershipType, 
       COUNT(*) as memberCount,
       MIN(joinDate) as earliestJoin,
       MAX(joinDate) as latestJoin
FROM Members
GROUP BY membershipType;

-- INSERT OPERATIONS
-- Add a new member (with email validation)
INSERT INTO Members (firstName, lastName, email, phoneNumber, joinDate, membershipType) 
VALUES (:firstName_input, :lastName_input, :email_input, :phoneNumber_input, :joinDate_input, :membershipType_input);

-- UPDATE OPERATIONS
-- Update member information
UPDATE Members 
SET firstName = :firstName_input,
    lastName = :lastName_input,
    email = :email_input,
    phoneNumber = :phoneNumber_input,
    membershipType = :membershipType_input
WHERE memberID = :memberID_input;

-- Update member's membership type only
UPDATE Members 
SET membershipType = :membershipType_input 
WHERE memberID = :memberID_input;

-- DELETE OPERATIONS
-- Delete a member (cascades to related records)
DELETE FROM Members 
WHERE memberID = :memberID_input;

-- ********************************************
-- TRAINER OPERATIONS
-- ********************************************

-- SELECT OPERATIONS
-- Get all trainers (with index usage)
SELECT trainerID, firstName, lastName, email, phoneNumber, hireDate, specialization 
FROM Trainers
ORDER BY lastName, firstName;

-- Get trainers by specialization (using specialization index)
SELECT trainerID, firstName, lastName, specialization 
FROM Trainers 
WHERE specialization = :specialization_input
ORDER BY lastName, firstName;

-- Search trainers by name (utilizing name index)
SELECT trainerID, firstName, lastName, specialization
FROM Trainers
WHERE lastName LIKE CONCAT(:search_input, '%')
   OR firstName LIKE CONCAT(:search_input, '%')
ORDER BY lastName, firstName;

-- Get trainer workload
SELECT t.trainerID, 
       CONCAT(t.firstName, ' ', t.lastName) as trainerName,
       t.specialization,
       COUNT(DISTINCT c.classID) as classCount,
       COUNT(DISTINCT mt.memberID) as memberCount
FROM Trainers t
LEFT JOIN Classes c ON t.trainerID = c.trainerID
LEFT JOIN MemberTrainer mt ON t.trainerID = mt.trainerID
GROUP BY t.trainerID, t.firstName, t.lastName, t.specialization;

-- INSERT/UPDATE/DELETE operations remain the same...

-- ********************************************
-- CLASS OPERATIONS
-- ********************************************

-- SELECT OPERATIONS
-- Get all classes with trainer names (optimized join)
SELECT c.classID, c.className, c.scheduleTime, c.scheduleDay, c.maxCapacity,
       CONCAT(t.firstName, ' ', t.lastName) as trainerName,
       (SELECT COUNT(*) FROM ClassBookings cb WHERE cb.classID = c.classID) as currentBookings
FROM Classes c
LEFT JOIN Trainers t ON c.trainerID = t.trainerID
ORDER BY c.scheduleDay, c.scheduleTime;

-- Get classes with availability
SELECT c.classID, c.className, c.scheduleDay, c.scheduleTime, 
       c.maxCapacity,
       (SELECT COUNT(*) FROM ClassBookings cb WHERE cb.classID = c.classID) as currentBookings,
       (c.maxCapacity - (SELECT COUNT(*) FROM ClassBookings cb WHERE cb.classID = c.classID)) as availableSpots
FROM Classes c
HAVING availableSpots > 0
ORDER BY c.scheduleDay, c.scheduleTime;

-- Get class attendance statistics
SELECT c.classID, c.className,
       COUNT(cb.bookingID) as totalBookings,
       COUNT(DISTINCT cb.memberID) as uniqueMembers,
       c.maxCapacity,
       (c.maxCapacity - COUNT(cb.bookingID)) as availableSpots
FROM Classes c
LEFT JOIN ClassBookings cb ON c.classID = cb.classID
GROUP BY c.classID, c.className, c.maxCapacity;

-- INSERT/UPDATE/DELETE operations remain the same...

-- ********************************************
-- EQUIPMENT OPERATIONS
-- ********************************************

-- SELECT OPERATIONS
-- Get all equipment with usage statistics
SELECT e.equipmentID, e.equipmentName, e.equipmentType, e.status,
       COUNT(DISTINCT me.memberID) as uniqueUsers,
       SUM(me.usageDuration) as totalUsageMinutes,
       e.lastMaintenanceDate,
       DATEDIFF(CURRENT_DATE, e.lastMaintenanceDate) as daysSinceLastMaintenance
FROM Equipments e
LEFT JOIN MemberEquipment me ON e.equipmentID = me.equipmentID
GROUP BY e.equipmentID, e.equipmentName, e.equipmentType, e.status, e.lastMaintenanceDate;

-- Get equipment needing maintenance
SELECT equipmentID, equipmentName, lastMaintenanceDate,
       DATEDIFF(CURRENT_DATE, lastMaintenanceDate) as daysSinceLastMaintenance
FROM Equipments
WHERE lastMaintenanceDate IS NULL
   OR DATEDIFF(CURRENT_DATE, lastMaintenanceDate) > 90
ORDER BY lastMaintenanceDate ASC NULLS FIRST;

-- Get equipment usage by type
SELECT e.equipmentType,
       COUNT(DISTINCT e.equipmentID) as equipmentCount,
       COUNT(DISTINCT me.memberID) as uniqueUsers,
       SUM(me.usageDuration) as totalUsageMinutes
FROM Equipments e
LEFT JOIN MemberEquipment me ON e.equipmentID = me.equipmentID
GROUP BY e.equipmentType;

-- INSERT/UPDATE/DELETE operations remain the same...

-- ********************************************
-- PAYMENT OPERATIONS
-- ********************************************

-- SELECT OPERATIONS
-- Get payment summary by member
SELECT m.memberID, 
       CONCAT(m.firstName, ' ', m.lastName) as memberName,
       m.membershipType,
       COUNT(*) as paymentCount,
       SUM(p.amount) as totalAmount,
       MAX(p.paymentDate) as lastPaymentDate
FROM Members m
JOIN Payments p ON m.memberID = p.memberID
GROUP BY m.memberID, m.firstName, m.lastName, m.membershipType;

-- Get payments by date range with member details
SELECT p.paymentID, 
       CONCAT(m.firstName, ' ', m.lastName) as memberName,
       p.amount, p.paymentDate, p.paymentMethod
FROM Payments p
JOIN Members m ON p.memberID = m.memberID
WHERE p.paymentDate BETWEEN :start_date AND :end_date
ORDER BY p.paymentDate DESC;

-- Get payment statistics by method
SELECT paymentMethod,
       COUNT(*) as transactionCount,
       SUM(amount) as totalAmount,
       AVG(amount) as averageAmount
FROM Payments
GROUP BY paymentMethod;

-- INSERT/UPDATE/DELETE operations remain the same...

-- ********************************************
-- INTERSECTION TABLE OPERATIONS
-- ********************************************

-- CLASS BOOKINGS OPERATIONS
-- Get class bookings with availability check
SELECT cb.bookingID, 
       CONCAT(m.firstName, ' ', m.lastName) as memberName,
       c.className, c.scheduleDay, c.scheduleTime,
       cb.bookingDate,
       c.maxCapacity,
       (SELECT COUNT(*) FROM ClassBookings WHERE classID = c.classID) as currentBookings
FROM ClassBookings cb
JOIN Members m ON cb.memberID = m.memberID
JOIN Classes c ON cb.classID = c.classID
ORDER BY cb.bookingDate DESC;

-- Check class availability before booking
SELECT c.classID, c.className, c.maxCapacity,
       (SELECT COUNT(*) FROM ClassBookings WHERE classID = c.classID) as currentBookings,
       (c.maxCapacity - (SELECT COUNT(*) FROM ClassBookings WHERE classID = c.classID)) as availableSpots
FROM Classes c
WHERE c.classID = :classID_input
HAVING availableSpots > 0;

-- MEMBER EQUIPMENT OPERATIONS
-- Get equipment usage history with duration statistics
SELECT me.memberEquipID,
       CONCAT(m.firstName, ' ', m.lastName) as memberName,
       e.equipmentName, e.equipmentType,
       me.usageDate, me.usageDuration,
       AVG(me.usageDuration) OVER (PARTITION BY e.equipmentID) as avgDurationForEquipment
FROM MemberEquipment me
JOIN Members m ON me.memberID = m.memberID
JOIN Equipments e ON me.equipmentID = e.equipmentID
ORDER BY me.usageDate DESC;

-- TRAINER EQUIPMENT OPERATIONS
-- Get trainer equipment certifications with usage stats
SELECT te.equipTrainID,
       CONCAT(t.firstName, ' ', t.lastName) as trainerName,
       e.equipmentName, e.equipmentType,
       te.assignmentDate,
       COUNT(DISTINCT me.memberID) as membersSupervised
FROM TrainerEquipment te
JOIN Trainers t ON te.trainerID = t.trainerID
JOIN Equipments e ON te.equipmentID = e.equipmentID
LEFT JOIN MemberEquipment me ON e.equipmentID = me.equipmentID
GROUP BY te.equipTrainID, t.firstName, t.lastName, e.equipmentName, e.equipmentType, te.assignmentDate;

-- MEMBER TRAINER OPERATIONS
-- Get active training relationships with session counts
SELECT mt.memberTrainerID,
       CONCAT(m.firstName, ' ', m.lastName) as memberName,
       CONCAT(t.firstName, ' ', t.lastName) as trainerName,
       t.specialization,
       mt.startDate,
       mt.endDate,
       CASE 
           WHEN mt.endDate IS NULL THEN 'Active'
           WHEN mt.endDate >= CURRENT_DATE THEN 'Active'
           ELSE 'Completed'
       END as status,
       DATEDIFF(COALESCE(mt.endDate, CURRENT_DATE), mt.startDate) as daysAssigned
FROM MemberTrainer mt
JOIN Members m ON mt.memberID = m.memberID
JOIN Trainers t ON mt.trainerID = t.trainerID
ORDER BY mt.startDate DESC;

-- Get trainer availability (trainers with fewer than 5 active clients)
SELECT t.trainerID,
       CONCAT(t.firstName, ' ', t.lastName) as trainerName,
       t.specialization,
       COUNT(CASE WHEN mt.endDate IS NULL OR mt.endDate >= CURRENT_DATE THEN 1 END) as activeClients
FROM Trainers t
LEFT JOIN MemberTrainer mt ON t.trainerID = mt.trainerID
GROUP BY t.trainerID, t.firstName, t.lastName, t.specialization
HAVING activeClients < 5 OR activeClients IS NULL
ORDER BY activeClients ASC;
