#!/bin/bash

# Test Hospital Authentication Flow
# This script tests the complete hospital signup and signin process

API_BASE="http://localhost:5000/api/v1"
HOSPITAL_EMAIL="testhospital2@example.com"
HOSPITAL_PASSWORD="Password123"

echo "🏥 Testing Hospital Authentication Flow"
echo "======================================"

# Test 1: Hospital Signup
echo ""
echo "1️⃣  Testing Hospital Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST \
  "${API_BASE}/hospitals" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital 2",
    "address": "456 Test Street, Test City, TC 12345",
    "location": {
      "lat": 40.7589,
      "lng": -73.9851
    },
    "contactNumber": "+15551234568",
    "email": "testhospital2@example.com",
    "totalBeds": {
      "general": 50,
      "icu": 15,
      "emergency": 10,
      "operation": 3
    },
    "facilities": ["emergency", "cardiology", "radiology"],
    "operatingHours": {
      "isOpen24x7": true
    }
  }')

echo "Hospital Registration Response:"
echo "$SIGNUP_RESPONSE" | jq '.'

# Extract hospital ID
HOSPITAL_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.data._id // empty')

if [ -n "$HOSPITAL_ID" ]; then
  echo "✅ Hospital registered successfully with ID: $HOSPITAL_ID"
  
  # Test 2: Create Hospital User Account
  echo ""
  echo "2️⃣  Creating Hospital User Account..."
  USER_RESPONSE=$(curl -s -X POST \
    "${API_BASE}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test Hospital 2\",
      \"email\": \"${HOSPITAL_EMAIL}\",
      \"password\": \"${HOSPITAL_PASSWORD}\",
      \"phone\": \"+15551234568\",
      \"role\": \"hospital\",
      \"hospitalInfo\": {
        \"hospitalId\": \"${HOSPITAL_ID}\",
        \"position\": \"Hospital Account\",
        \"department\": \"All Departments\"
      }
    }")
  
  echo "User Registration Response:"
  echo "$USER_RESPONSE" | jq '.'
  
  # Test 3: Hospital Login
  echo ""
  echo "3️⃣  Testing Hospital Login..."
  LOGIN_RESPONSE=$(curl -s -X POST \
    "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${HOSPITAL_EMAIL}\",
      \"password\": \"${HOSPITAL_PASSWORD}\"
    }")
  
  echo "Login Response:"
  echo "$LOGIN_RESPONSE" | jq '.'
  
  # Extract token
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
  
  if [ -n "$TOKEN" ]; then
    echo "✅ Login successful! Token received."
    
    # Test 4: Profile Verification
    echo ""
    echo "4️⃣  Testing Profile Access..."
    PROFILE_RESPONSE=$(curl -s -X GET \
      "${API_BASE}/auth/profile" \
      -H "Authorization: Bearer ${TOKEN}")
    
    echo "Profile Response:"
    echo "$PROFILE_RESPONSE" | jq '.'
    
    echo ""
    echo "🎉 Hospital authentication flow test completed!"
  else
    echo "❌ Login failed!"
  fi
else
  echo "❌ Hospital registration failed!"
fi