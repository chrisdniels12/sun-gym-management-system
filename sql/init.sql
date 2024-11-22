CREATE TABLE Members (
    memberID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15),
    joinDate DATE DEFAULT CURRENT_DATE,
    membershipType ENUM('Basic', 'Premium', 'VIP') NOT NULL
);
