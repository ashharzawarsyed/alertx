# 🚀 AlertX - Team Setup Guide

## 📋 Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **MongoDB** (local or Atlas account) - [Download](https://www.mongodb.com/)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - Install with `npm install -g expo-cli`

### Optional but Recommended:
- **Yarn** - Install with `npm install -g yarn`
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Expo Go App** - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🔧 Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ashharzawarsyed/alertx.git
cd alertx
```

### 2️⃣ Install Root Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Setup Environment Variables

**IMPORTANT:** The project uses environment variables for configuration. You need to create `.env` files from the provided templates.

#### Root Configuration
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` - Your MongoDB connection string (Ask team lead)
- `GLOBAL_JWT_SECRET` - JWT secret key (Ask team lead)
- `MAPBOX_ACCESS_TOKEN` - Get from [Mapbox](https://www.mapbox.com/)
- `GOOGLE_MAPS_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/)

#### Backend Service
```bash
cd apps/backend
cp .env.example .env
```

**Critical backend variables:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Same as root JWT secret
- `EMAIL_USER` & `EMAIL_PASS` - Gmail credentials (see `GMAIL_SETUP.md`)
- `CLOUDINARY_*` - For file uploads (optional for testing)

#### AI Service
```bash
cd apps/ai-service
cp .env.example .env
```

Set `PORT=8000` or your preferred port.

#### Dashboard (Admin)
```bash
cd apps/dashboard
cp .env.example .env
```

Update `VITE_API_URL` to match your backend URL.

#### Hospital Dashboard
```bash
cd apps/hospital-dashboard
cp .env.example .env
```

Update `VITE_API_URL` to match your backend URL.

---

### 4️⃣ Install Service Dependencies

#### Backend Service
```bash
cd apps/backend
npm install
```

#### AI Service
```bash
cd apps/ai-service
npm install  # Node.js dependencies
pip install -r requirements.txt  # Python dependencies
```

#### Admin Dashboard
```bash
cd apps/dashboard
npm install
```

#### Hospital Dashboard
```bash
cd apps/hospital-dashboard
npm install
```

#### Emergency User App (React Native)
```bash
cd apps/emergency-user-app
npm install
```

#### Emergency Driver App (React Native)
```bash
cd apps/emergency-driver-app
npm install
```

---

## 🚀 Running the Project

### Option 1: Run All Services (Recommended)

From the root directory:
```bash
npm run dev
```

This will start all services concurrently.

### Option 2: Run Services Individually

#### Backend Server
```bash
cd apps/backend
npm run dev
# Server runs on http://localhost:5000
```

#### AI Service
```bash
cd apps/ai-service
npm start
# Service runs on http://localhost:8000
```

#### Admin Dashboard
```bash
cd apps/dashboard
npm run dev
# Dashboard runs on http://localhost:5173
```

#### Hospital Dashboard
```bash
cd apps/hospital-dashboard
npm run dev
# Dashboard runs on http://localhost:5174
```

#### Emergency User App (Mobile)
```bash
cd apps/emergency-user-app
npx expo start
# Scan QR code with Expo Go app
```

#### Emergency Driver App (Mobile)
```bash
cd apps/emergency-driver-app
npx expo start
# Scan QR code with Expo Go app
```

---

## 📦 Project Structure

```
alertx/
├── apps/
│   ├── backend/              # Node.js + Express API
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB models (Mongoose)
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Auth, validation, error handling
│   │   └── services/         # Business logic
│   │
│   ├── ai-service/           # Python + Flask AI service
│   │   ├── services/         # Triage & scoring logic
│   │   └── controllers/      # AI endpoints
│   │
│   ├── dashboard/            # React + Vite admin dashboard
│   │   └── src/
│   │       ├── components/   # React components
│   │       ├── pages/        # Dashboard pages
│   │       └── services/     # API calls
│   │
│   ├── hospital-dashboard/   # React + Vite hospital interface
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       └── services/
│   │
│   ├── emergency-user-app/   # React Native user app
│   │   ├── app/              # Expo Router screens
│   │   ├── components/       # Reusable components
│   │   └── src/
│   │       ├── services/     # API services
│   │       └── types/        # TypeScript types
│   │
│   └── emergency-driver-app/ # React Native driver app
│       ├── app/
│       ├── components/
│       └── src/
│
├── .env.example              # Root environment template
└── package.json              # Root package configuration
```

---

## 🔑 Getting Required Credentials

### MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. **Ask team lead** for the actual project database credentials

### Mapbox (Maps & Location)
1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Get your access token from the dashboard
3. Add to `.env` files

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Add to `.env` files

### Gmail (Email Notifications)
1. Enable 2-Factor Authentication on your Gmail
2. Generate an App Password
3. See `apps/backend/GMAIL_SETUP.md` for detailed instructions

### Cloudinary (Optional - File Uploads)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and secret
3. Add to backend `.env`

---

## ⚠️ Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Check your `MONGO_URI` in `.env`. Ask team lead for correct credentials.

### Issue: "Port already in use"
**Solution:** 
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Or use different ports in .env files
```

### Issue: "Module not found" errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Expo app won't start
**Solution:**
```bash
cd apps/emergency-user-app
npx expo start --clear
```

### Issue: Backend throws JWT errors
**Solution:** Make sure `JWT_SECRET` in `apps/backend/.env` matches `GLOBAL_JWT_SECRET` in root `.env`

---

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
npm test
```

### AI Service Tests
```bash
cd apps/ai-service
npm test
```

---

## 👥 Team Collaboration

### Shared Settings
- `.vscode` folder is tracked for shared editor settings
- Install recommended VS Code extensions when prompted
- Use the same code formatting (ESLint + Prettier)

### Git Workflow
1. Always pull latest changes: `git pull origin main`
2. Create feature branches: `git checkout -b feature/your-feature`
3. Commit often with clear messages
4. Push to your branch: `git push origin feature/your-feature`
5. Create Pull Request on GitHub

### Code Style
- Use ESLint for JavaScript/TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Write meaningful commit messages

---

## 📞 Getting Help

### Contacts
- **Project Lead:** Ask for credentials and access
- **Repository Issues:** [GitHub Issues](https://github.com/ashharzawarsyed/alertx/issues)

### Documentation
- Backend API: See `apps/backend/README.md` (if exists)
- Frontend: See individual app README files
- Gmail Setup: `apps/backend/GMAIL_SETUP.md`

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Root `npm install` completed without errors
- [ ] All `.env` files created from templates
- [ ] Backend server starts successfully (port 5000)
- [ ] AI service starts successfully (port 8000)
- [ ] Admin dashboard loads in browser (port 5173)
- [ ] Hospital dashboard loads in browser (port 5174)
- [ ] User app runs in Expo Go
- [ ] Driver app runs in Expo Go
- [ ] Can connect to MongoDB (check backend logs)
- [ ] API endpoints respond (test with `curl http://localhost:5000/api/v1/health`)

---

## 🚀 You're All Set!

If you've completed all steps above, you should have a fully working development environment.

**Happy Coding! 🎉**

For any issues not covered here, please reach out to the team lead or create an issue on GitHub.
