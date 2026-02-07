// Migration script to hash existing plain text passwords
import './db.js'; // Connect to MongoDB
import User from './modelus/Users.js';
import bcrypt from 'bcryptjs';

// Function to check if a string is already a bcrypt hash
function isBcryptHash(str) {
  // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[ayb]\$.{56}$/.test(str);
}

async function migratePasswords() {
  try {
    console.log('Starting password migration...');
    
    // Wait a moment for database connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find all users
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users to check`);
    
    let updatedCount = 0;
    let alreadyHashedCount = 0;
    
    for (const user of users) {
      // Check if password is already hashed
      if (isBcryptHash(user.password)) {
        console.log(`User "${user.name}" already has hashed password`);
        alreadyHashedCount++;
        continue;
      }
      
      // Hash the plain text password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      // Update user with hashed password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`✓ Updated password for user: ${user.name}`);
      updatedCount++;
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total users checked: ${users.length}`);
    console.log(`Passwords hashed: ${updatedCount}`);
    console.log(`Already hashed: ${alreadyHashedCount}`);
    console.log('Migration completed successfully!');
    
    // Close database connection
    process.exit(0);
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migratePasswords();

