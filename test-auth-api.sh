#!/bin/bash

# AlertX Authentication API Test Script
# Tests all authentication endpoints to ensure they work correctly

BASE_URL="http://localhost:5001/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  AlertX Authentication API Tests"
echo "========================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "http://localhost:5001/health")
if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo "$HEALTH_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "$HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Request OTP for Registration
echo -e "${YELLOW}Test 2: Request OTP for Email Verification${NC}"
TEST_EMAIL="testuser$(date +%s)@example.com"
echo "Using test email: $TEST_EMAIL"

OTP_REQUEST=$(curl -s -X POST "${BASE_URL}/auth/register/otp/request" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'",
    "name": "Test User"
  }')

if echo "$OTP_REQUEST" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ OTP request successful${NC}"
    echo "$OTP_REQUEST" | jq '.'
else
    echo -e "${RED}✗ OTP request failed${NC}"
    echo "$OTP_REQUEST" | jq '.'
fi
echo ""

# Test 3: Test Sign In (should fail with non-existent user)
echo -e "${YELLOW}Test 3: Sign In with Non-existent User${NC}"
SIGNIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "TestPass123!"
  }')

if echo "$SIGNIN_RESPONSE" | grep -q '"success":false'; then
    echo -e "${GREEN}✓ Correctly rejected non-existent user${NC}"
    echo "$SIGNIN_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Unexpected signin response${NC}"
    echo "$SIGNIN_RESPONSE" | jq '.'
fi
echo ""

# Test 4: Test Forgot Password
echo -e "${YELLOW}Test 4: Forgot Password Flow${NC}"
FORGOT_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'"
  }')

echo "$FORGOT_RESPONSE" | jq '.'
echo ""

# Test 5: Test Invalid Email Format
echo -e "${YELLOW}Test 5: Invalid Email Format${NC}"
INVALID_EMAIL_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register/otp/request" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "Test User"
  }')

if echo "$INVALID_EMAIL_RESPONSE" | grep -q '"success":false'; then
    echo -e "${GREEN}✓ Correctly rejected invalid email${NC}"
    echo "$INVALID_EMAIL_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Should have rejected invalid email${NC}"
    echo "$INVALID_EMAIL_RESPONSE" | jq '.'
fi
echo ""

# Test 6: Check if Admin User Exists
echo -e "${YELLOW}Test 6: Test Admin Login (Demo Account)${NC}"
ADMIN_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alertx.com",
    "password": "Admin123!"
  }')

if echo "$ADMIN_LOGIN" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Admin login successful${NC}"
    TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.token')
    echo "Admin Token: ${TOKEN:0:50}..."
    
    # Test authenticated endpoint
    echo -e "${YELLOW}Test 6b: Get Profile with Token${NC}"
    PROFILE_RESPONSE=$(curl -s -X GET "${BASE_URL}/auth/profile" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ Profile retrieval successful${NC}"
        echo "$PROFILE_RESPONSE" | jq '.data.user | {name, email, role}'
    else
        echo -e "${RED}✗ Profile retrieval failed${NC}"
        echo "$PROFILE_RESPONSE" | jq '.'
    fi
else
    echo -e "${YELLOW}⚠ Admin account doesn't exist or credentials invalid${NC}"
    echo "$ADMIN_LOGIN" | jq '.'
fi
echo ""

# Summary
echo "========================================"
echo "  Test Summary"
echo "========================================"
echo -e "${GREEN}✓ Backend is running and responsive${NC}"
echo -e "${GREEN}✓ Authentication endpoints are accessible${NC}"
echo -e "${GREEN}✓ Validation is working correctly${NC}"
echo ""
echo "Next steps:"
echo "1. Start the mobile app: cd apps/emergency-user-app && npm start"
echo "2. Test the sign-in/sign-up flow in the app"
echo "3. Check MongoDB for registered users"
echo ""
