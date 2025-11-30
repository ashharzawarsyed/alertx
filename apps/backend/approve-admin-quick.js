import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const approveAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not an admin:', user.role);
      process.exit(1);
    }

    console.log('📋 Current admin status:', {
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      approvalStatus: user.approvalStatus
    });

    if (user.approvalStatus === 'approved') {
      console.log('✅ Admin is already approved');
    } else {
      user.approvalStatus = 'approved';
      user.isActive = true;
      await user.save();
      console.log('✅ Admin approved and activated successfully');
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
  console.log('Usage: node approve-admin.js <email>');
  process.exit(1);
}

approveAdmin(email);
