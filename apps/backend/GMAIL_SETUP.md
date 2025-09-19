# Gmail Setup Instructions for AlertX Email Service

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate App Password

1. Go to Google Account settings → Security
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Name it "AlertX System"
5. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

## Step 3: Update Environment Variables

Update your `.env` file with:

```
EMAIL_USER=ashharzawarsyedwork@gmail.com
EMAIL_PASS=your_16_character_app_password_here_no_spaces
EMAIL_FROM=AlertX System <ashharzawarsyedwork@gmail.com>
```

## Step 4: Test Email Service

After updating the .env file, restart the backend server and test:

```bash
# Test with a new admin registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test.admin@example.com",
    "phone": "+1234567999",
    "password": "TestPass123!",
    "role": "admin"
  }'
```

## Current Implementation Features:

✅ Gmail SMTP configuration ready
✅ Professional HTML email templates
✅ Admin approval workflow in dashboard
✅ Email links navigate to dashboard controls
✅ Approve/reject buttons with API integration
✅ Automatic email notifications on approval/rejection

## Next Steps:

1. Set up Gmail App Password (follow steps above)
2. Update .env file with real credentials
3. Restart backend server
4. Test with admin registration
5. Check admin dashboard → Controls → Users → Pending Approvals
