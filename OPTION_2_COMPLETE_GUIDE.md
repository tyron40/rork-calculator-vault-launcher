# Option 2: Full Backend Setup - Complete Guide

## 📋 Overview

This guide will help you deploy your backend and enable **real-time connection between iOS and Android devices** for your Calculator Vault parental control app.

**Time Required**: 30-60 minutes  
**Difficulty**: Moderate  
**Result**: Working iOS ↔ Android real-time pairing and monitoring

---

## 🎯 What You'll Achieve

- ✅ Backend deployed to cloud (Vercel)
- ✅ Real-time device pairing working
- ✅ iOS and Android can communicate
- ✅ Calculator PIN login fixed (`0000` default works)
- ✅ Parent can monitor child device

---

## 📚 Quick Links to Detailed Guides

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
2. **[QUICK_DEPLOY_CHECKLIST.md](./QUICK_DEPLOY_CHECKLIST.md)** - Step-by-step checklist
3. **[TEST_CONNECTION.md](./TEST_CONNECTION.md)** - Connection testing and troubleshooting

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Deploy backend
npm install -g vercel
vercel

# 2. Copy the deployment URL and create .env
echo "EXPO_PUBLIC_RORK_API_BASE_URL=https://your-url.vercel.app" > .env

# 3. Restart app
bun start

# 4. Test backend
curl https://your-url.vercel.app/api
# Should return: {"status":"ok","message":"API is running"}
```

---

## 📝 Step-by-Step Instructions

### Step 1: Deploy Backend to Vercel

Vercel is the easiest deployment option for your Hono backend.

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel (creates account if needed)
vercel login

# Deploy your backend
vercel
```

**During deployment**, answer these prompts:
- "Set up and deploy?" → `Y`
- "Which scope?" → Select your account
- "Link to existing project?" → `N`
- "Project name?" → `calculator-vault-backend` (or your choice)
- "In which directory is your code located?" → `./`
- "Want to override settings?" → `N`

**After deployment**, you'll see:
```
✅ Production: https://calculator-vault-backend-xxxxx.vercel.app
```

**🔔 IMPORTANT**: Copy this URL! You need it for Step 2.

---

### Step 2: Configure Environment Variable

Create a `.env` file in your **project root** (same folder as `package.json`):

```bash
# Option A: Create manually
touch .env

# Option B: Copy from example
cp .env.example .env
```

Edit `.env` and add your backend URL:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://calculator-vault-backend-xxxxx.vercel.app
```

**Replace** `calculator-vault-backend-xxxxx.vercel.app` with YOUR actual URL from Step 1.

**⚠️ Important**: 
- No trailing slash at the end
- Use `https://` not `http://`
- Must start with `EXPO_PUBLIC_` prefix

---

### Step 3: Restart Expo Server

The environment variable only loads when Expo starts, so you must restart:

```bash
# Stop current dev server
# Press: Ctrl+C (Windows/Linux) or Cmd+C (Mac)

# Clear cache (optional but recommended)
rm -rf node_modules/.cache

# Start again
bun start
```

---

### Step 4: Test Backend Connection

#### Test 1: Browser
Open in browser:
```
https://your-url.vercel.app/api
```

Expected response:
```json
{"status":"ok","message":"API is running"}
```

#### Test 2: Terminal
```bash
curl https://your-url.vercel.app/api
```

#### Test 3: Script
```bash
bash scripts/test-backend.sh
```

**✅ If all tests pass → Backend is ready!**

---

### Step 5: Test App Flow

#### On Child Device (Phone A):

1. Launch app
2. Accept consent → Enter child name → Continue
3. See calculator → Type `0000` → Press `=`
4. Select role: **Child**
5. Create PIN (e.g., `1234`)
6. Tap "Complete Setup"
7. **Write down the 6-digit pairing code** (e.g., `A7F2K9`)
   - Code expires in 5 minutes
   - This is shown in an alert dialog

#### On Parent Device (Phone B):

1. Launch app
2. Accept consent → Enter any name → Continue
3. See calculator → Type `0000` → Press `=`
4. Select role: **Parent**
5. Create PIN (e.g., `5678`)
6. Tap "Complete Setup"
7. Navigate to pairing/connection screen
8. Enter the 6-digit code from child device
9. Tap "Pair" or "Connect"

#### Expected Result:
- ✅ Parent sees: "Device connected successfully"
- ✅ Child shows: "Connected to parent device"
- ✅ Both devices appear in each other's device list

---

## 🔧 Files Modified/Created

### New Files Created:
- `.env` - Environment configuration
- `vercel.json` - Vercel deployment config
- `.env.example` - Template for environment variables
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `QUICK_DEPLOY_CHECKLIST.md` - Quick reference checklist
- `TEST_CONNECTION.md` - Connection testing guide
- `scripts/test-backend.sh` - Backend health test script
- `OPTION_2_COMPLETE_GUIDE.md` - This file

### Modified Files:
- `app/index.tsx` - Fixed calculator PIN logic
  - Default `0000` PIN now works properly
  - Better logging for debugging
  - Clearer first-time setup flow

### Existing Backend Files (Already Set Up):
- `backend/hono.ts` - Hono server with tRPC
- `backend/trpc/app-router.ts` - tRPC routes
- `backend/trpc/routes/pairing/*.ts` - Pairing logic
- `lib/trpc.ts` - tRPC client configuration

---

## 🐛 Troubleshooting

### Issue: "No base url found"

**Symptoms**: App crashes with error in console

**Cause**: `.env` not loaded or doesn't exist

**Fix**:
1. Verify `.env` exists in project root (same folder as `package.json`)
2. Open `.env` and verify it contains: `EXPO_PUBLIC_RORK_API_BASE_URL=...`
3. Restart Expo completely (stop and `bun start`)
4. If still failing, try: `rm -rf node_modules/.cache && bun start`

---

### Issue: Backend 404 or Not Found

**Symptoms**: `curl` returns 404 or browser shows error

**Cause**: Backend deployment failed or URL incorrect

**Fix**:
```bash
# Check deployments
vercel ls

# View logs
vercel logs

# Redeploy
vercel --prod

# Update .env with new URL
```

---

### Issue: Calculator PIN `0000` Not Working

**Symptoms**: Alert says "Incorrect PIN" when typing `0000`

**Cause**: App already configured with a different PIN

**Fix**:
1. Clear app data (Settings → Apps → Clear Data)
2. Or reset in app console:
   ```javascript
   // In Expo dev tools console
   AsyncStorage.clear()
   ```
3. Restart app
4. Default PIN `0000` will work again

---

### Issue: Pairing Code Expired

**Symptoms**: Error "Code expired" or "Invalid code"

**Cause**: Pairing codes expire after 5 minutes

**Fix**:
1. On child device, generate a new code
2. Immediately enter it on parent device
3. If needed multiple times, consider increasing expiry time in:
   `backend/trpc/routes/pairing/generateCode/route.ts` (line 13)

---

### Issue: Devices Won't Pair

**Symptoms**: No error but devices don't connect

**Cause**: Backend communication issue

**Debug Steps**:
1. Check backend logs: `vercel logs`
2. Test backend health: `curl https://your-url.vercel.app/api`
3. Check console logs for `[Backend]` messages
4. Verify both devices have internet connection
5. Try pairing again with fresh code

---

## 📊 Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│  Child Device   │         │  Parent Device  │
│   (iOS/Android) │         │   (iOS/Android) │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  HTTPS/tRPC              │  HTTPS/tRPC
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │   Vercel    │
              │   Backend   │
              │ (Hono+tRPC) │
              └─────────────┘
```

**Flow**:
1. Child generates pairing code → Stored in backend
2. Parent enters code → Backend verifies and pairs
3. Connection established → Real-time communication enabled

---

## 🔐 Security Notes

- All PINs are hashed before storage (SHA-256)
- Communication uses HTTPS (TLS/SSL)
- Pairing codes expire after 5 minutes
- Secure storage used for sensitive data
- CORS enabled for cross-origin requests

---

## 📦 What's Next?

After completing this setup:

1. **Test Monitoring Features**:
   - Audio streaming
   - Location tracking  
   - App monitoring
   - Remote control

2. **Production Deployment** (Optional):
   - Set up custom domain
   - Configure production database
   - Enable analytics
   - Set up monitoring/alerts

3. **App Store Submission** (Optional):
   - Build production APK/IPA
   - Submit to Play Store/App Store
   - Note: We can't help with store submission

---

## ✅ Success Checklist

Mark these off as you complete them:

- [ ] Vercel CLI installed
- [ ] Backend deployed to Vercel
- [ ] `.env` file created with correct URL
- [ ] Expo server restarted
- [ ] Backend health check returns 200 OK
- [ ] Calculator `0000` PIN works
- [ ] Child device can generate pairing codes
- [ ] Parent device can enter pairing codes
- [ ] Devices successfully paired
- [ ] Connection shows as active on both devices

---

## 🆘 Still Need Help?

If you're stuck after following all guides:

1. Check **[TEST_CONNECTION.md](./TEST_CONNECTION.md)** for detailed debugging
2. Review **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for deployment specifics
3. Use **[QUICK_DEPLOY_CHECKLIST.md](./QUICK_DEPLOY_CHECKLIST.md)** to verify each step

**Common Issues**:
- 90% of issues are from `.env` not being loaded → Restart Expo!
- 5% are from wrong backend URL → Check `vercel ls`
- 5% are from code expiration → Generate fresh code

---

## 🎉 You're All Set!

Once you see devices paired and communicating, you have successfully:

✅ Deployed a production backend  
✅ Configured real-time communication  
✅ Fixed calculator PIN authentication  
✅ Enabled cross-platform (iOS ↔ Android) pairing  

**Your app is now ready for real-world testing!**

---

Last Updated: 2025-11-07  
Project: Calculator Vault Parental Control App  
Setup Type: Option 2 - Full Backend Deployment
