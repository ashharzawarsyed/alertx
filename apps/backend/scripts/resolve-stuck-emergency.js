/**
 * Script to manually resolve a stuck emergency
 * Use this when driver app crashes and emergency is stuck in progress
 * 
 * Usage: node scripts/resolve-stuck-emergency.js <emergency-id>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const resolveStuckEmergency = async (emergencyId, action = 'cancel') => {
  try {
    console.log('\n🔧 Emergency Resolution Script');
    console.log('================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import all models to ensure they're registered
    await import('../models/User.js');
    await import('../models/Ambulance.js');
    const Emergency = (await import('../models/Emergency.js')).default;
    const Hospital = (await import('../models/Hospital.js')).default;

    if (!emergencyId) {
      console.log('📋 Fetching all stuck emergencies...\n');
      
      // Find all emergencies that are stuck in progress
      const stuckEmergencies = await Emergency.find({
        status: { $in: ['accepted', 'in_progress'] },
        createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // Older than 30 minutes
      })
        .populate('patient', 'name phone')
        .populate('assignedDriver', 'name driverInfo')
        .populate('assignedHospital', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

      if (stuckEmergencies.length === 0) {
        console.log('✅ No stuck emergencies found!');
        process.exit(0);
      }

      console.log(`⚠️ Found ${stuckEmergencies.length} potentially stuck emergencies:\n`);
      
      stuckEmergencies.forEach((emergency, index) => {
        const duration = Math.floor((Date.now() - new Date(emergency.createdAt).getTime()) / 60000);
        console.log(`${index + 1}. Emergency ID: ${emergency._id}`);
        console.log(`   Status: ${emergency.status}`);
        console.log(`   Patient: ${emergency.patient?.name || 'Unknown'}`);
        console.log(`   Driver: ${emergency.assignedDriver?.name || 'N/A'}`);
        console.log(`   Hospital: ${emergency.assignedHospital?.name || 'N/A'}`);
        console.log(`   Duration: ${duration} minutes ago`);
        console.log(`   Created: ${new Date(emergency.createdAt).toLocaleString()}`);
        console.log('');
      });

      console.log('\n💡 To resolve a specific emergency, run:');
      console.log('   node scripts/resolve-stuck-emergency.js <emergency-id> [cancel|complete]');
      console.log('\nExample:');
      console.log(`   node scripts/resolve-stuck-emergency.js ${stuckEmergencies[0]._id} cancel`);
      
      process.exit(0);
    }

    // Find the specific emergency
    console.log(`🔍 Looking for emergency: ${emergencyId}`);
    
    const emergency = await Emergency.findById(emergencyId)
      .populate('patient', 'name phone')
      .populate('assignedDriver', 'name driverInfo')
      .populate('assignedHospital', 'name');

    if (!emergency) {
      console.error('❌ Emergency not found!');
      process.exit(1);
    }

    console.log('\n📊 Emergency Details:');
    console.log(`   ID: ${emergency._id}`);
    console.log(`   Status: ${emergency.status}`);
    console.log(`   Patient: ${emergency.patient?.name || 'Unknown'}`);
    console.log(`   Phone: ${emergency.patient?.phone || 'N/A'}`);
    console.log(`   Driver: ${emergency.assignedDriver?.name || 'N/A'}`);
    console.log(`   Hospital: ${emergency.assignedHospital?.name || 'N/A'}`);
    console.log(`   Created: ${new Date(emergency.createdAt).toLocaleString()}`);
    console.log(`   Duration: ${Math.floor((Date.now() - new Date(emergency.createdAt).getTime()) / 60000)} minutes\n`);

    if (action === 'cancel') {
      console.log('🚫 Cancelling emergency...');
      
      // Release reserved bed if any
      if (emergency.assignedHospital && emergency.reservedBedType) {
        const bedField = `beds.${emergency.reservedBedType}.available`;
        await Hospital.findByIdAndUpdate(
          emergency.assignedHospital._id,
          { $inc: { [bedField]: 1 } }
        );
        console.log(`   ✅ Released ${emergency.reservedBedType} bed`);
      }

      // Update emergency status
      emergency.status = 'cancelled';
      emergency.cancellationReason = 'Manually resolved - app crash or stuck state';
      emergency.cancelledAt = new Date();
      await emergency.save();

      console.log('✅ Emergency cancelled successfully!\n');
      
    } else if (action === 'complete') {
      console.log('✅ Completing emergency...');
      
      // Update emergency status
      emergency.status = 'completed';
      emergency.completedAt = new Date();
      await emergency.save();

      console.log('✅ Emergency completed successfully!\n');
      
    } else {
      console.error('❌ Invalid action. Use "cancel" or "complete"');
      process.exit(1);
    }

    console.log('✅ Done! Emergency has been resolved.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
    process.exit(0);
  }
};

// Get command line arguments
const emergencyId = process.argv[2];
const action = process.argv[3] || 'cancel';

// Run the script
resolveStuckEmergency(emergencyId, action);
