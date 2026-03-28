# Backend Deployment Guide - Option 2: Full Setup

## Overview
Your app requires a live backend to enable real-time pairing between iOS and Android devices. This guide walks you through deploying your Hono/tRPC backend.

## Architecture
- **Backend**: Hono framework with tRPC for API routes
- **Frontend**: Expo React Native app
- **Connection**: HTTP-based pairing system using generated codes

---

## Step 1: Choose Your Deployment Platform

### Option A: Vercel (Recommended - Easiest)

#### 1.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 1.2 Create `vercel.json` in project root
This file is already configured in your project.

#### 1.3 Deploy
```bash
vercel
```

Follow the prompts:
- Link to existing project? → No
- Project name? → calculator-vault-backend
- Directory? → ./
- Want to override settings? → No

#### 1.4 Get Your URL
After deployment completes, you'll see:
```
✅ Production: https://your-app-name.vercel.app
```

Copy this URL!

---

### Option B: Railway (Alternative)

#### 1.1 Install Railway CLI
```bash
npm install -g railway
```

#### 1.2 Login and Deploy
```bash
railway login
railway init
railway up
```

#### 1.3 Get Your URL
```bash
railway domain
```

---

## Step 2: Configure Environment Variable

### 2.1 Create `.env` file in project root
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-deployed-backend-url.vercel.app
```

**Important**: Replace with YOUR actual deployment URL from Step 1.

### 2.2 Restart Expo
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
bun start
```

---

## Step 3: Test Backend Connection

### 3.1 Test Backend Health
Open in browser:
```
https://your-deployed-backend-url.vercel.app/api
```

Should return:
```json
{"status":"ok","message":"API is running"}
```

### 3.2 Test from App
The app will automatically connect on next launch.

---

## Step 4: Fix Calculator PIN Logic

The app currently has complex PIN logic. Let's simplify:

### Current Issue
- Calculator expects `0000` as default PIN
- But the setup flow requires creating PINs first
- This creates a mismatch

### Solution
I'll update the calculator logic to:
1. Allow `0000` as default before setup
2. After setup, require the configured PIN
3. Properly handle parent vs child PIN scenarios

---

## Step 5: Test Pairing Flow

### 5.1 Setup Child Device
1. Launch app on Device A (child's phone)
2. Select "I am a child"
3. Complete consent form
4. Create PIN (e.g., `1234`)
5. **Save the 6-digit pairing code shown**

### 5.2 Setup Parent Device  
1. Launch app on Device B (parent's phone)
2. Select "I am a parent"
3. Create parent PIN (e.g., `5678`)
4. Create child PIN (must match child's: `1234`)
5. Complete setup

### 5.3 Pair Devices
1. On parent device, go to pairing section
2. Enter the 6-digit code from child device
3. Devices should connect

---

## Troubleshooting

### Backend Not Connecting
**Error**: "No base url found"
- **Fix**: Ensure `.env` file exists and has correct URL
- **Fix**: Restart Expo dev server after creating `.env`

### Pairing Code Expired
- **Issue**: Codes expire after 5 minutes
- **Fix**: Generate new code on child device

### PIN Not Working
- **Issue**: Calculator shows "Incorrect PIN"
- **Fix**: Wait for Step 4 implementation below

### CORS Errors
- **Issue**: Browser blocks requests
- **Fix**: Backend already has CORS enabled (line 11 in `backend/hono.ts`)

---

## What I'll Do Next

1. ✅ Create this deployment guide
2. 🔄 Simplify PIN verification logic
3. 🔄 Add better error handling
4. 🔄 Test pairing flow end-to-end

---

## Quick Start Commands

```bash
# 1. Deploy backend
vercel

# 2. Copy URL and create .env
echo "EXPO_PUBLIC_RORK_API_BASE_URL=https://your-url.vercel.app" > .env

# 3. Restart app
bun start

# 4. Test in browser
open https://your-url.vercel.app/api
```

---

## Need Help?

Common issues:
1. **"Module not found"** → Run `bun install`
2. **"Port in use"** → Change port or kill process
3. **"Network error"** → Check `.env` URL format
4. **"Pairing failed"** → Ensure both devices on internet
