import 'dotenv/config';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/v1';

async function getDriverToken() {
  try {
    console.log('🔐 Logging in as driver...\n');
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'umer.aziz@zixel.cn',
      password: 'password123'
    });
    
    if (response.data.success) {
      console.log('✅ Driver logged in successfully');
      console.log('👤 Driver:', response.data.data.user.name);
      console.log('🎫 Token:', response.data.data.token);
      console.log('');
      return response.data.data.token;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

async function getActiveEmergencies(token) {
  try {
    console.log('🔍 Fetching active emergencies...\n');
    
    const response = await axios.get(`${API_URL}/emergencies?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      const emergencies = response.data.data.emergencies;
      const activeEmergencies = emergencies.filter(e => 
        ['pending', 'accepted', 'in_progress'].includes(e.status)
      );
      
      console.log(`✅ Found ${activeEmergencies.length} active emergency(ies)\n`);
      
      activeEmergencies.forEach((emergency, index) => {
        console.log(`${index + 1}. Emergency ID: ${emergency._id}`);
        console.log(`   Status: ${emergency.status}`);
        console.log(`   Patient: ${emergency.patient?.name || 'Unknown'}`);
        console.log(`   Location: ${emergency.location?.address || 'Unknown'}`);
        console.log('');
      });
      
      return activeEmergencies;
    }
  } catch (error) {
    console.error('❌ Failed to fetch emergencies:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚑 Quick Emergency Tracker Info\n');
  console.log('═'.repeat(50));
  console.log('');
  
  const driverToken = await getDriverToken();
  const emergencies = await getActiveEmergencies(driverToken);
  
  console.log('═'.repeat(50));
  console.log('\n📋 Copy these values to use with the simulator:\n');
  console.log('Driver Token:');
  console.log(driverToken);
  console.log('');
  
  if (emergencies.length > 0) {
    console.log('Emergency IDs:');
    emergencies.forEach((e, i) => {
      console.log(`${i + 1}. ${e._id} (${e.status})`);
    });
  } else {
    console.log('⚠️  No active emergencies found. Create one from the patient app first!');
  }
  
  console.log('\n═'.repeat(50));
  console.log('\n💡 Now run: node simulate-ambulance.js');
  console.log('   And paste the token and emergency ID when prompted.\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
