# Authentication Flow Testing Checklist

## 🔄 **RESTART BACKEND FIRST!**

```bash
cd apps/backend
npm start
```

---

## 📝 **Sign Up Flow Test**

### Test 1: Happy Path - Complete Registration

- [ ] **Step 1: Email Entry**
  - Enter valid email: `test@example.com`
  - Click "Send Verification Code"
  - ✅ Should show success alert
  - ✅ Should advance to Step 2
  - Check console for: `POST /api/v1/auth/register/otp/request 200`

- [ ] **Step 2: OTP Verification**
  - Check your email OR use backend console for OTP
  - Enter 6-digit code
  - ✅ Button should be disabled until all 6 digits entered
  - Click "Verify Code"
  - ✅ Should call validation endpoint
  - ✅ Should advance to Step 3
  - Check console for: `POST /api/v1/auth/register/otp/validate 200`

- [ ] **Step 3: Basic Information**
  - First Name: `John`
  - Last Name: `Doe`
  - Phone: `+1234567890`
  - Date of Birth: `1990-01-15`
  - Gender: Select any option
  - Password: `TestPass123` (must have uppercase, lowercase, number)
  - Confirm Password: `TestPass123`
  - ✅ All fields should validate in real-time
  - ✅ Password strength indicator should work
  - Click "Continue"
  - ✅ Should advance to Step 4

- [ ] **Step 4: Address Information**
  - Street: `123 Main St`
  - City: `New York`
  - State: `NY`
  - ZIP: `10001`
  - Country: `United States` (default)
  - Click "Continue"
  - ✅ Should advance to Step 5

- [ ] **Step 5: Emergency Contacts**
  - Blood Type: Select any (optional)
  - Primary Contact Name: `Jane Doe`
  - Relationship: Select `Spouse`
  - Phone: `+1987654321`
  - Email: `jane@example.com` (optional)
  - Click "Complete Registration"
  - ✅ Should show loading state
  - ✅ Should create user in database
  - ✅ Should return JWT token
  - ✅ Should navigate to main app
  - Check console for: `POST /api/v1/auth/register/otp/verify 200`

### Test 2: Validation Tests

- [ ] **Invalid Email**
  - Try: `notanemail`
  - ✅ Should show error message
- [ ] **Weak Password**
  - Try: `password` (no uppercase/number)
  - ✅ Should show validation error
- [ ] **Password Mismatch**
  - Password: `TestPass123`
  - Confirm: `TestPass456`
  - ✅ Should show "Passwords must match"
- [ ] **Invalid Phone Format**
  - Try: `1234567890` (no country code)
  - ✅ Should show error
  - Correct: `+1234567890`

### Test 3: Navigation Tests

- [ ] **Back Button**
  - Go to Step 3, click back
  - ✅ Should return to Step 2 with OTP preserved
  - ✅ Form data should persist
- [ ] **Resend OTP**
  - On Step 2, click "Resend"
  - ✅ Should request new OTP
  - ✅ Should show success message
  - ✅ Old OTP should be invalidated

### Test 4: Error Handling

- [ ] **Invalid OTP**
  - Enter wrong 6-digit code
  - ✅ Should show "Invalid or expired OTP"
- [ ] **Expired OTP**
  - Wait 10+ minutes, try to verify
  - ✅ Should show expiration error
- [ ] **Duplicate Email**
  - Try to register same email twice
  - ✅ Should show "User already exists"
- [ ] **Duplicate Phone**
  - Try same phone number
  - ✅ Should show appropriate error

---

## 🔐 **Sign In Flow Test**

### Test 1: Happy Path - Successful Login

- [ ] **Valid Credentials**
  - Email: Use registered email from sign-up
  - Password: Use registered password
  - Click "Sign In"
  - ✅ Should show loading state
  - ✅ Should receive JWT token
  - ✅ Should navigate to main app
  - Check console for: `POST /api/v1/auth/login 200`

### Test 2: Invalid Credentials

- [ ] **Wrong Email**
  - Email: `wrong@example.com`
  - Password: `TestPass123`
  - ✅ Should show "Invalid credentials"
- [ ] **Wrong Password**
  - Email: Correct email
  - Password: `WrongPass123`
  - ✅ Should show "Invalid credentials"
- [ ] **Empty Fields**
  - Try submitting empty form
  - ✅ Should show validation errors

### Test 3: Navigation

- [ ] **Go to Sign Up**
  - Click "Don't have an account? Sign Up"
  - ✅ Should navigate to sign-up screen
- [ ] **Forgot Password**
  - Click "Forgot Password?"
  - ✅ Should navigate to forgot password screen

---

## 🧪 **Backend Verification**

### MongoDB Checks

```bash
# Connect to MongoDB
mongosh <your-mongodb-uri>

# Check created users
db.users.find({email: "test@example.com"}).pretty()

# Verify fields:
# ✅ name: "John Doe"
# ✅ email: "test@example.com"
# ✅ phone: "+1234567890"
# ✅ role: "patient"
# ✅ emailVerified: true
# ✅ emergencyContacts array present
# ✅ medicalProfile.bloodType present if selected
# ✅ address object present
# ✅ location: optional (can be null)
# ✅ password: hashed (not plain text)
```

### API Logs to Check

```bash
# Backend console should show:
✅ POST /auth/register/otp/request 200 - OTP sent
✅ POST /auth/register/otp/validate 200 - OTP verified
✅ POST /auth/register/otp/verify 201 - User created
✅ POST /auth/login 200 - Login successful
```

---

## 🐛 **Common Issues & Fixes**

### Issue 1: "JSON Parse error: Unexpected character: <"

**Cause:** Backend returning HTML instead of JSON (usually 500 error)
**Check:**

- Backend console for error stack trace
- Missing required fields
- Database connection issues

**Fix:**

- ✅ Made location optional in User model
- ✅ Improved error logging in authService

### Issue 2: Button Disabled After Success

**Cause:** `isLoading` state not being reset
**Check:**

- Console for successful API call
- Navigation occurring

**Fix:**

- Ensure `finally` block resets loading state

### Issue 3: OTP Not Received

**Cause:** Gmail App Password not configured
**Solutions:**

- Check backend `.env` for EMAIL_PASS
- OR use backend console for OTP code
- OR test without email (use console OTP)

### Issue 4: Network Request Failed

**Cause:** Backend not accessible
**Check:**

- Backend running on port 5001
- Firewall not blocking
- Correct IP address in authService.ts

**Fix:**

- Update `LOCAL_NETWORK_IP` to your computer's IP
- Restart backend
- Clear Expo cache: `npx expo start -c`

---

## ✅ **Success Criteria**

### Sign Up Flow

- ✅ All 5 steps complete without errors
- ✅ User created in MongoDB
- ✅ JWT token received
- ✅ Navigation to main app
- ✅ All validations working
- ✅ Back navigation preserves data

### Sign In Flow

- ✅ Successful login with valid credentials
- ✅ Error messages for invalid credentials
- ✅ JWT token stored
- ✅ Navigation to main app
- ✅ "Remember me" (if implemented)

### General

- ✅ No console errors
- ✅ No UI glitches
- ✅ Smooth animations
- ✅ Loading states work
- ✅ Error messages clear and helpful

---

## 📊 **Test Results Log**

Date: ****\_\_\_****
Tester: ****\_****

| Test Case               | Pass | Fail | Notes |
| ----------------------- | ---- | ---- | ----- |
| Sign Up - Happy Path    | [ ]  | [ ]  |       |
| Sign Up - Validations   | [ ]  | [ ]  |       |
| Sign Up - Navigation    | [ ]  | [ ]  |       |
| Sign Up - Errors        | [ ]  | [ ]  |       |
| Sign In - Happy Path    | [ ]  | [ ]  |       |
| Sign In - Invalid Creds | [ ]  | [ ]  |       |
| MongoDB Data            | [ ]  | [ ]  |       |
| API Logs                | [ ]  | [ ]  |       |

**Overall Status:**

- [ ] ✅ All tests passed - Ready for main screen
- [ ] ⚠️ Some issues - Need fixes
- [ ] ❌ Critical failures - Debug required

---

**Next Steps After All Tests Pass:**

1. Clean up console logs (optional - keep for debugging)
2. Add loading animations (Lottie)
3. Implement "Remember Me" functionality
4. Add biometric auth (Face ID / Fingerprint)
5. **Move to main screen development** 🚀
