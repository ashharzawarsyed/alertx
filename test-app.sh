#!/bin/bash

echo "======================================"
echo "   AlertX - Testing Script"
echo "======================================"
echo ""

echo "📋 Pre-flight Checklist:"
echo "  ✓ Backend server must be running on port 5001"
echo "  ✓ MongoDB must be connected"
echo "  ✓ User account must be created and verified"
echo "  ✓ Device must have Expo Go installed"
echo "  ✓ Location permissions must be enabled"
echo ""

# Check if backend is running
echo "1️⃣  Checking backend server..."
if curl -s http://localhost:5001/ > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5001"
else
    echo "   ❌ Backend is NOT running!"
    echo "   → Start it with: cd apps/backend && npm start"
    exit 1
fi

echo ""
echo "2️⃣  Checking MongoDB connection..."
if curl -s http://localhost:5001/ | grep -q "healthy"; then
    echo "   ✅ MongoDB is connected"
else
    echo "   ⚠️  Could not verify MongoDB connection"
fi

echo ""
echo "3️⃣  Running frontend..."
echo "   Starting Expo development server..."
echo "   → Open Expo Go on your device and scan the QR code"
echo ""

cd apps/emergency-user-app && npx expo start

