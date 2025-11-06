# 🔐 Credentials Template for Team Lead

**IMPORTANT:** Use this template to securely share credentials with your teammate. Never send this via unencrypted email or public chat!

---

## 📝 How to Use This Template

1. Copy this content to a secure password manager (1Password, LastPass, Bitwarden)
2. Fill in the actual values
3. Share the secure note/vault with your teammate
4. Alternatively, send via encrypted file (e.g., password-protected ZIP)

---

## 🔑 Critical Credentials (Required)

### MongoDB Database
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alertx
```
**Note:** Your teammate needs this to connect to the database

### JWT Authentication Secret
```
JWT_SECRET=your-super-secret-jwt-key-here
GLOBAL_JWT_SECRET=your-super-secret-jwt-key-here
```
**Note:** Use the SAME secret in both root and backend .env files

---

## 📧 Email Service (Optional but Recommended)

### Gmail Configuration
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="AlertX System <your-email@gmail.com>"
```

**How to get Gmail App Password:**
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Go to App Passwords section
4. Generate password for "Mail"
5. Use that 16-character password (no spaces)

**See:** `apps/backend/GMAIL_SETUP.md` for detailed instructions

---

## 🗺️ Map Services (Optional)

### Mapbox
```
MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
```
**Get it from:** https://www.mapbox.com/
- Sign up for free account
- Go to Access Tokens
- Copy default public token

### Google Maps
```
GOOGLE_MAPS_API_KEY=your-google-maps-key-here
GOOGLE_PLACES_API_KEY=your-google-places-key-here
```
**Get it from:** https://console.cloud.google.com/
- Create new project
- Enable Maps JavaScript API
- Enable Places API
- Create API Key

---

## ☁️ Cloud Storage (Optional)

### Cloudinary (for file uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
**Get it from:** https://cloudinary.com/
- Sign up for free account
- Go to Dashboard
- Copy credentials

---

## 📱 SMS Service (Optional)

### Twilio
```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number
```
**Get it from:** https://www.twilio.com/
- Sign up for trial account
- Get free phone number
- Copy credentials from Console

---

## 📋 Quick Setup Checklist

After sharing these credentials, your teammate should:

- [ ] Clone repository
- [ ] Copy all .env.example files to .env
- [ ] Paste the credentials above into respective .env files
- [ ] Install dependencies (`npm install` in each service)
- [ ] Run services (`npm run dev`)
- [ ] Verify backend connects to MongoDB
- [ ] Test API endpoints

---

## ⚠️ Security Reminders

### DO:
- ✅ Use password manager (1Password, LastPass, Bitwarden)
- ✅ Send via encrypted channel
- ✅ Rotate credentials if compromised
- ✅ Use different credentials for production

### DON'T:
- ❌ Send via email (unencrypted)
- ❌ Post in Slack/Discord/Teams
- ❌ Commit to Git
- ❌ Screenshot and send via text
- ❌ Share the same credentials with multiple people

---

## 🔄 If Credentials Are Compromised

### MongoDB:
1. Go to MongoDB Atlas
2. Change database user password
3. Update connection string
4. Redeploy all services

### JWT Secret:
1. Generate new secret: `openssl rand -base64 32`
2. Update all .env files
3. All users will need to login again

### API Keys:
1. Go to respective service dashboard
2. Revoke compromised key
3. Generate new key
4. Update .env files

---

## 📞 Support

If your teammate has issues:
1. Check they copied credentials correctly (no extra spaces)
2. Verify they created .env files in correct locations
3. Check MongoDB IP whitelist (add 0.0.0.0/0 for testing)
4. Refer them to SETUP.md for complete guide

---

**Remember:** These credentials give full access to your development environment. Treat them like passwords!
