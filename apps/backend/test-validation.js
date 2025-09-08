import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api/v1';

async function testValidation() {
  console.log('🧪 Testing Input Validation...\n');

  // Test invalid registration
  console.log('1. Testing invalid registration data...');
  const invalidRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "a", // too short
      email: "invalid-email",
      phone: "123", // invalid format
      password: "weak", // too weak
      role: "patient"
      // missing location for patient
    })
  });
  
  const invalidData = await invalidRes.json();
  console.log('Status:', invalidRes.status);
  console.log('Validation errors:', invalidData.error);

  // Test driver registration
  console.log('\n2. Testing driver registration...');
  const driverRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Driver Test",
      email: "driver@example.com",
      phone: "+1234567891",
      password: "DriverPass123",
      role: "driver",
      driverInfo: {
        licenseNumber: "DL123456",
        ambulanceNumber: "AMB001"
      }
    })
  });
  
  const driverData = await driverRes.json();
  console.log('Status:', driverRes.status);
  console.log('Driver registered:', driverData.success);
  
  if (driverData.success) {
    // Test update profile
    console.log('\n3. Testing profile update...');
    const updateRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverData.data.token}`
      },
      body: JSON.stringify({
        name: "Updated Driver Name"
      })
    });
    
    const updateData = await updateRes.json();
    console.log('Status:', updateRes.status);
    console.log('Profile updated:', updateData.success);
  }

  console.log('\n✅ Validation tests completed!');
}

testValidation();
