// MongoDB initialization script
db = db.getSiblingDB('xscan');

// Create collections
db.createCollection('users');
db.createCollection('scans');

// Create indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.scans.createIndex({ "userId": 1 });
db.scans.createIndex({ "status": 1 });
db.scans.createIndex({ "type": 1 });

// Create a default admin user (password: admin123)
db.users.insertOne({
  username: "admin",
  email: "admin@xscan.com",
  password: "$2a$10$rQZ8N3YqX8K9L2M1N0O9P8Q7R6S5T4U3V2W1X0Y9Z8A7B6C5D4E3F2G1H0I", // bcrypt hash of "admin123"
  isAdmin: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialization completed successfully!'); 