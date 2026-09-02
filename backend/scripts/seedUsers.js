import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@certsystem.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@certsystem.com',
        password: 'AdminPassword123!',
        role: 'ADMIN',
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

    // Check if staff already exists
    const staffExists = await User.findOne({ email: 'staff@certsystem.com' });
    if (!staffExists) {
      await User.create({
        name: 'Authorized Staff',
        email: 'staff@certsystem.com',
        password: 'StaffPassword123!',
        role: 'STAFF',
        college: 'Engineering College',
        department: 'Computer Science',
      });
      console.log('Staff user created successfully.');
    } else {
      console.log('Staff user already exists.');
    }

    process.exit();
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
