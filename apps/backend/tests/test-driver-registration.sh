#!/bin/bash

# Test Driver Registration Flow
# Run from project root: bash apps/backend/tests/test-driver-registration.sh

echo "======================================"
echo "🚑 Driver Registration Test Suite"
echo "======================================"
echo ""

# Configuration
API_URL="http://localhost:5001/api/v1"
TEST_EMAIL="test.driver.$(date +%s)@example.com"
TEST_PHONE="+923001234567"

echo "📋 Test Configuration:"
echo "  API URL: $API_URL"
echo "  Test Email: $TEST_EMAIL"
echo "  Test Phone: $TEST_PHONE"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check API Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: API Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -s "$API_URL/../health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API is reachable${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ API is not reachable${NC}"
    exit 1
fi
echo ""

# Test 2: Invalid Registration (Missing Fields)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Invalid Registration - Missing Fields"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "Test123456"
  }')
echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q "error\|required\|validation"; then
    echo -e "${GREEN}✅ Correctly rejected invalid data${NC}"
else
    echo -e "${RED}❌ Should have rejected invalid data${NC}"
fi
echo ""

# Test 3: Invalid Phone Format
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Invalid Phone Format (No Country Code)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Driver",
    "email": "'$TEST_EMAIL'",
    "phone": "03001234567",
    "password": "Test123456",
    "role": "driver",
    "driverInfo": {
      "licenseNumber": "DL12345",
      "ambulanceNumber": "AMB001",
      "status": "offline"
    }
  }')
echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q "country code\|phone\|invalid"; then
    echo -e "${GREEN}✅ Correctly rejected phone without country code${NC}"
else
    echo -e "${YELLOW}⚠️  May have accepted invalid phone format${NC}"
fi
echo ""

# Test 4: Valid Driver Registration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Valid Driver Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Driver John",
    "email": "'$TEST_EMAIL'",
    "phone": "'$TEST_PHONE'",
    "password": "Test123456",
    "role": "driver",
    "driverInfo": {
      "licenseNumber": "DL12345",
      "ambulanceNumber": "AMB001",
      "status": "offline"
    }
  }')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
echo "HTTP Status: $HTTP_CODE"
echo "Response Body: $BODY"

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Driver registered successfully${NC}"
    
    # Extract user ID if available
    USER_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$USER_ID" ]; then
        echo "📝 User ID: $USER_ID"
    fi
else
    echo -e "${RED}❌ Registration failed with HTTP $HTTP_CODE${NC}"
    echo "Debug Info:"
    echo "  - Check if driverInfo fields are required"
    echo "  - Check phone validation regex"
    echo "  - Check password requirements"
    echo "  - Check database connection"
fi
echo ""

# Test 5: Duplicate Email Registration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Duplicate Email Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Driver",
    "email": "'$TEST_EMAIL'",
    "phone": "+923009876543",
    "password": "Test123456",
    "role": "driver",
    "driverInfo": {
      "licenseNumber": "DL99999",
      "ambulanceNumber": "AMB999",
      "status": "offline"
    }
  }')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "409" ]; then
    echo -e "${GREEN}✅ Correctly rejected duplicate email${NC}"
else
    echo -e "${RED}❌ Should have rejected duplicate email${NC}"
fi
echo ""

# Test 6: Login with Registered Driver
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Login with Registered Driver"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "Test123456"
  }')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$TOKEN" ]; then
        echo "🔑 Token received: ${TOKEN:0:20}..."
    fi
else
    echo -e "${RED}❌ Login failed with HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo "✅ Tests completed"
echo "📝 Check output above for any failures"
echo ""
echo "Common Issues:"
echo "  1. Phone validation: Must include country code (+XX...)"
echo "  2. Password requirements: 8+ chars, upper, lower, number"
echo "  3. License/Ambulance numbers: Required fields"
echo "  4. Role: Must be 'driver'"
echo "  5. driverInfo: Must include all required fields"
echo ""
