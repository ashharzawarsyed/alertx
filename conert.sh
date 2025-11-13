# Save this as convert-submodules.sh and run: bash convert-submodules.sh

#!/bin/bash

echo "🔍 Step 1: Checking current state..."
find apps/emergency-user-app apps/emergency-driver-app -name ".git" -type d

echo ""
echo "🧹 Step 2: Cleaning submodule configuration..."
git config --file .gitmodules --remove-section submodule.apps/emergency-user-app 2>/dev/null || true
git config --file .gitmodules --remove-section submodule.apps/emergency-driver-app 2>/dev/null || true
[ ! -s .gitmodules ] && rm -f .gitmodules || true
git config --remove-section submodule.apps/emergency-user-app 2>/dev/null || true
git config --remove-section submodule.apps/emergency-driver-app 2>/dev/null || true
git rm --cached apps/emergency-user-app 2>/dev/null || true
git rm --cached apps/emergency-driver-app 2>/dev/null || true

echo ""
echo "🗑️  Step 3: Removing nested .git directories..."
rm -rf apps/emergency-user-app/.git
rm -rf apps/emergency-driver-app/.git
rm -rf .git/modules/apps/emergency-user-app 2>/dev/null || true
rm -rf .git/modules/apps/emergency-driver-app 2>/dev/null || true

echo ""
echo "➕ Step 4: Adding directories to main repo..."
git add apps/emergency-user-app
git add apps/emergency-driver-app

echo ""
echo "✅ Step 5: Verifying..."
echo "Checking for remaining nested .git folders:"
find apps/emergency-user-app apps/emergency-driver-app -name ".git" -type d

echo ""
echo "Git status:"
git status

echo ""
echo "✅ Done! Review the changes above, then run:"
echo "   git commit -m 'Convert emergency apps from submodules to regular directories'"
echo "   git push origin main"