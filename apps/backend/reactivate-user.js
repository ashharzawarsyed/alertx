import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const reactivateUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    console.log('📋 Current user status:', {
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      approvalStatus: user.approvalStatus
    });

    if (user.isActive) {
      console.log('✅ User is already active');
    } else {
      user.isActive = true;
      await user.save();
      console.log('✅ User reactivated successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node reactivate-user.js <email>');
  process.exit(1);
}

reactivateUser(email);
