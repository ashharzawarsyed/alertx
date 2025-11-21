#!/bin/bash

# Quick validation test for driver registration payload
# Run: bash apps/backend/tests/test-driver-validation.sh

echo "======================================"
echo "🔍 Driver Registration Validation Test"
echo "======================================"
echo ""

API_URL="http://localhost:5001/api/v1"

# Test different validation scenarios
declare -a tests=(
    # Test 1: Missing name
    '{"email":"test@ex.com","phone":"+923001234567","password":"Test123","role":"driver","driverInfo":{"licenseNumber":"DL123","ambulanceNumber":"AMB123","status":"offline"}}|Missing name'
    
    # Test 2: Invalid email
    '{"name":"Test","email":"invalid-email","phone":"+923001234567","password":"Test123456","role":"driver","driverInfo":{"licenseNumber":"DL123","ambulanceNumber":"AMB123","status":"offline"}}|Invalid email'
    
    # Test 3: Phone without country code
    '{"name":"Test","email":"test@ex.com","phone":"3001234567","password":"Test123456","role":"driver","driverInfo":{"licenseNumber":"DL123","ambulanceNumber":"AMB123","status":"offline"}}|Phone without country code'
    
    # Test 4: Short password
    '{"name":"Test","email":"test@ex.com","phone":"+923001234567","password":"test","role":"driver","driverInfo":{"licenseNumber":"DL123","ambulanceNumber":"AMB123","status":"offline"}}|Short password'
    
    # Test 5: Missing driverInfo
    '{"name":"Test","email":"test@ex.com","phone":"+923001234567","password":"Test123456","role":"driver"}|Missing driverInfo'
    
    # Test 6: Missing licenseNumber
    '{"name":"Test","email":"test@ex.com","phone":"+923001234567","password":"Test123456","role":"driver","driverInfo":{"ambulanceNumber":"AMB123","status":"offline"}}|Missing licenseNumber'
    
    # Test 7: Missing ambulanceNumber
    '{"name":"Test","email":"test@ex.com","phone":"+923001234567","password":"Test123456","role":"driver","driverInfo":{"licenseNumber":"DL123","status":"offline"}}|Missing ambulanceNumber'
    
    # Test 8: Wrong role
    '{"name":"Test","email":"test@ex.com","phone":"+923001234567","password":"Test123456","role":"patient","driverInfo":{"licenseNumber":"DL123","ambulanceNumber":"AMB123","status":"offline"}}|Wrong role'
)

counter=1
for test in "${tests[@]}"; do
    IFS='|' read -ra PARTS <<< "$test"
    PAYLOAD="${PARTS[0]}"
    DESCRIPTION="${PARTS[1]}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test $counter: $DESCRIPTION"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/auth/register" \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ]; then
        echo "✅ Correctly rejected"
    else
        echo "⚠️  Unexpected status code"
    fi
    
    echo ""
    ((counter++))
done

echo "======================================"
echo "✅ Validation tests completed"
echo "======================================"
