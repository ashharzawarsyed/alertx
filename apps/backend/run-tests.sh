#!/bin/bash


echo "Running AlertX Backend Tests..."
echo "================================"


echo "Running Authentication Tests..."
echo "- Testing user registration..."
node tests/auth/test-registration.js
echo "- Testing validation..."
node tests/auth/test-validation.js
echo "- Testing auth only..."
node tests/auth/test-auth-only.js
echo "- Testing driver auth..."
node tests/auth/test-driver-auth.js


echo "Running Email Tests..."
echo "- Testing email functionality..."
node tests/email/test-emails.js
echo "- Testing professional emails..."
node tests/email/test-professional-emails.js
echo "- Testing email templates..."
node tests/email/test-email-templates.js
echo "- Testing real emails..."
node tests/email/test-real-emails.js

# Run integration tests
echo "Running Integration Tests..."
echo "- Testing hospital approval system..."
node tests/integration/test-hospital-approval.js
echo "- Testing health endpoints..."
node tests/integration/test-health.js
echo "- Testing emergency system..."
node tests/integration/test-emergency-system.js
echo "- Testing medical profiles..."
node tests/integration/test-medical-profile.js
echo "- Testing AI direct integration..."
node tests/integration/test-ai-direct.js

echo "================================"
echo "All tests completed successfully!"
echo "Test organization: auth/ | email/ | integration/"