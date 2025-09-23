# Hospital Registration Test
# Testing the /auth/register/hospital endpoint

# Test data for hospital registration
curl -X POST http://localhost:5000/auth/register/hospital \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalName": "Test General Hospital",
    "email": "admin@testgeneral.com",
    "password": "Test123!@#",
    "licenseNumber": "HL-2024-001",
    "phone": "+1234567890",
    "address": "123 Hospital St, Medical City, MC 12345",
    "type": "General",
    "emergencyContact": "+1234567899",
    "totalBeds": 150,
    "availableBeds": 75
  }'