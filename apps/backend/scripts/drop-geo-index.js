import 'dotenv/config';
import mongoose from 'mongoose';
import Emergency from '../models/Emergency.js';

const dropGeoIndex = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📋 Listing all indexes on Emergency collection...');
    const indexes = await Emergency.collection.getIndexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    console.log('\n🗑️ Attempting to drop location_2dsphere index...');
    try {
      await Emergency.collection.dropIndex('location_2dsphere');
      console.log('✅ Successfully dropped location_2dsphere index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Index location_2dsphere does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping index:', error.message);
      }
    }

    console.log('\n📋 Final indexes:');
    const finalIndexes = await Emergency.collection.getIndexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log('\n✅ Done! Disconnecting...');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropGeoIndex();
