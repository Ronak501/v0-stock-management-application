/**
 * Database Setup Script
 * Creates a demo admin user and sample data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get models
    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, unique: true, required: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
      createdAt: { type: Date, default: Date.now }
    }));

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const adminUser = new User({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: password123');
    }

    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
