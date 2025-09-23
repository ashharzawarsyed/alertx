# Test Organization Structure

This directory contains all test files organized by category for better maintainability.

## Directory Structure

```
tests/
├── README.md                 # This file
├── integration/              # End-to-end integration tests
│   └── test-hospital-approval.js
├── email/                    # Email functionality tests
│   ├── test-professional-emails.js
│   ├── test-real-emails.js
│   ├── test-emails.js
│   ├── test-email-templates.js
│   └── show-email-templates.js
├── auth/                     # Authentication tests
│   ├── test-validation.js
│   ├── test-registration.js
│   └── test-hospital-auth.sh
└── test-error-handling.js    # Error handling tests
```

## Test Categories

### 🔄 Integration Tests (`integration/`)

- **test-hospital-approval.js**: Complete hospital approval workflow testing
  - Tests hospital registration, admin approval, email notifications, and login flow

### 📧 Email Tests (`email/`)

- **test-professional-emails.js**: Professional email workflow testing
- **test-real-emails.js**: Real email sending verification
- **test-emails.js**: General email functionality tests
- **test-email-templates.js**: Email template testing
- **show-email-templates.js**: Email template documentation

### 🔐 Authentication Tests (`auth/`)

- **test-validation.js**: Input validation testing
- **test-registration.js**: Registration process testing
- **test-hospital-auth.sh**: Hospital authentication shell script

### 🚨 Error Handling Tests

- **test-error-handling.js**: Error handling and edge cases

## Running Tests

### Individual Tests

```bash
# Run hospital approval workflow test
node tests/integration/test-hospital-approval.js

# Run email functionality test
node tests/email/test-professional-emails.js

# Run authentication tests
node tests/auth/test-validation.js
```

### All Tests (Future)

```bash
# Run all tests (when test runner is implemented)
npm test
```

## Test Requirements

- Backend server must be running on port 5001
- MongoDB connection required
- Admin user must exist (admin@alertx.com)
- Email configuration must be set in .env file

## Adding New Tests

1. Create test file in appropriate category directory
2. Follow naming convention: `test-[feature].js`
3. Include proper error handling and cleanup
4. Update this README if adding new categories

## Test Data Cleanup

Tests create temporary data with timestamps to avoid conflicts. No manual cleanup required.
