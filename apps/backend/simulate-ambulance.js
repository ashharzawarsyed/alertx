import 'dotenv/config';
import io from 'socket.io-client';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Simulate ambulance moving from point A to point B
async function simulateAmbulanceMovement() {
  console.log('🚑 Ambulance Location Simulator\n');
  console.log('⚠️  IMPORTANT: You need a DRIVER token, not a patient token!\n');
  
  // Get driver token
  const token = await question('Enter driver auth token: ');
  const emergencyId = await question('Enter emergency ID (from patient app): ');
  
  // Starting location (e.g., driver location)
  const startLat = parseFloat(await question('Start Latitude (e.g., 33.6844): '));
  const startLng = parseFloat(await question('Start Longitude (e.g., 73.0479): '));
  
  // Destination (e.g., patient location)
  const endLat = parseFloat(await question('End Latitude: '));
  const endLng = parseFloat(await question('End Longitude: '));
  
  const steps = parseInt(await question('Number of steps (e.g., 50): ') || '50');
  const intervalMs = parseInt(await question('Interval in ms (e.g., 2000): ') || '2000');
  
  console.log('\n🔄 Connecting to socket server...');
  
  // Connect to socket
  const socket = io('http://localhost:5001', {
    auth: { token: token.trim() },
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('✅ Connected to socket server\n');
    console.log('📍 Starting simulation...\n');
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep >= steps) {
        console.log('\n✅ Simulation complete!');
        clearInterval(interval);
        socket.disconnect();
        rl.close();
        process.exit(0);
        return;
      }
      
      // Calculate current position (linear interpolation)
      const progress = currentStep / steps;
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;
      
      // Calculate speed (in km/h, simulated)
      const speed = 40 + Math.random() * 20; // 40-60 km/h
      
      // Calculate heading (bearing)
      const dLng = endLng - startLng;
      const dLat = endLat - startLat;
      const heading = Math.atan2(dLng, dLat) * (180 / Math.PI);
      
      const locationData = {
        emergencyId,
        location: {
          lat: currentLat,
          lng: currentLng,
          speed: speed,
          heading: heading >= 0 ? heading : heading + 360,
          accuracy: 10,
          altitude: 500 + Math.random() * 100,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
      
      socket.emit('driver:updateLocation', locationData);
      
      console.log(`Step ${currentStep + 1}/${steps}: [${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}] @ ${speed.toFixed(1)} km/h`);
      
      currentStep++;
    }, intervalMs);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    rl.close();
    process.exit(1);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
  });
  
  socket.on('location:updated', (data) => {
    console.log('✅ Location update acknowledged:', data.message);
  });
}

simulateAmbulanceMovement().catch((error) => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
