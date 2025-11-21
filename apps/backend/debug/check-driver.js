import mongoose from 'mongoose';
import User from '../models/User.js';

const DB_URI = 'mongodb+srv://umersuleman27:X9K6hPIjRzkwDZaH@cluster0.krkaqh4.mongodb.net/alertx?retryWrites=true&w=majority&appName=Cluster0';

async function checkDriver() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    const driver = await User.findOne({ email: 'fociro9669@aikunkun.com' });
    
    if (!driver) {
      console.log('❌ Driver not found');
      process.exit(1);
    }

    console.log('\n📋 Driver Details:');
    console.log('ID:', driver._id.toString());
    console.log('Name:', driver.name);
    console.log('Email:', driver.email);
    console.log('Role:', driver.role);
    console.log('\n🚑 Driver Info:');
    console.log('Status:', driver.driverInfo?.status);
    console.log('Ambulance Type:', driver.driverInfo?.ambulanceType);
    console.log('Ambulance Number:', driver.driverInfo?.ambulanceNumber);
    console.log('License:', driver.driverInfo?.licenseNumber);

    await mongoose.connection.close();
    console.log('\n✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDriver();
