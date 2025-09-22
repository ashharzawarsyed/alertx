// Simple test script to add multiple test patients using the existing Test Alert functionality
console.log("🚀 Starting enhanced navigation test...");

// Function to add test patient (simulating the test alert button)
function addTestPatient(name, condition, priority, eta) {
  const testPatient = {
    id: Date.now() + Math.random(),
    patientName: name,
    patientAge: 30 + Math.floor(Math.random() * 50),
    patientGender: Math.random() > 0.5 ? "Male" : "Female",
    condition,
    priority,
    emergencyType: priority,
    location: {
      current: `${Math.floor(Math.random() * 900) + 100} Medical Ave`,
    },
    vitals: {
      hr: 60 + Math.floor(Math.random() * 80),
      bp: `${120 + Math.floor(Math.random() * 40)}/${80 + Math.floor(Math.random() * 20)}`,
      spo2: 85 + Math.floor(Math.random() * 15),
    },
    paramedic: {
      name: `Dr. ${["Smith", "Johnson", "Williams", "Brown", "Jones"][Math.floor(Math.random() * 5)]}`,
      phone: "+1-555-0000",
    },
    estimatedArrival: eta,
    ambulanceId: `AMB-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
  };
  return testPatient;
}

// Test data for navigation
const testPatients = [
  addTestPatient("John Critical", "Heart Attack", "critical", 5),
  addTestPatient("Sarah Urgent", "Car Accident", "urgent", 8),
  addTestPatient("Robert Emergency", "Stroke Symptoms", "critical", 3),
  addTestPatient("Lisa Moderate", "Broken Bone", "moderate", 15),
  addTestPatient("David Severe", "Respiratory Distress", "urgent", 12),
];

console.log("📋 Test patients created:", testPatients.length);
console.log("🎯 Navigation features to test:");
console.log("   ← → Arrow key navigation");
console.log("   🔄 Previous/Next buttons");
console.log("   📍 Pagination dots");
console.log("   📊 Priority color coding");
console.log("   📱 Responsive full-width layout");

// If this was running in the browser, we would add these to the dashboard
// For now, this serves as a reference for manual testing
console.log("\\n🌐 Manual Testing Guide:");
console.log('1. Click "Test Alert" button 5 times to create multiple patients');
console.log("2. Observe the new full-width carousel layout");
console.log("3. Use arrow keys to navigate between patients");
console.log("4. Click the left/right arrow buttons");
console.log("5. Click pagination dots to jump to specific patients");
console.log(
  "6. Verify priority colors: red=critical, yellow=urgent, blue=moderate"
);
console.log("7. Check responsive behavior on different screen sizes");

export { testPatients };
