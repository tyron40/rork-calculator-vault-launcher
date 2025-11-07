# 🚀 Quick Deploy Checklist for Real-Time Connection

Follow these steps in order to get your app working with real iOS-Android connection.

---

## ✅ Step 1: Deploy Backend (5 minutes)

### Using Vercel (Easiest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy your backend
vercel

# Answer prompts:
# - Link to existing project? → No
# - Project name? → calculator-vault-backend (or your choice)
# - Directory? → ./ 
# - Override settings? → No

# After deployment, copy the URL shown:
# ✅ Production: https://your-app-XXXXX.vercel.app
```

**Save this URL! You'll need it in Step 2.**

---

## ✅ Step 2: Configure Environment Variable (1 minute)

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your deployed URL
# Replace the URL with YOUR actual Vercel URL from Step 1
```

Your `.env` should look like:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-app-XXXXX.vercel.app
```

**Important**: Use the exact URL from Step 1, no trailing slash!

---

## ✅ Step 3: Restart App (30 seconds)

```bash
# Stop the current dev server (Ctrl+C or Cmd+C)

# Restart
bun start
```

---

## ✅ Step 4: Test Backend Connection (1 minute)

Open your browser and visit:
```
https://your-app-XXXXX.vercel.app/api
```

You should see:
```json
{"status":"ok","message":"API is running"}
```

If you see this ✅ → Backend is working!  
If you see an error ❌ → Check deployment logs: `vercel logs`

---

## ✅ Step 5: Test App on First Device (Child Device)

### Initial Setup
1. Open the app on Device A (will be the child device)
2. You'll see the consent screen - tap "I Accept"
3. Enter child's name (e.g., "Alex")
4. Tap "Continue"

### Calculator Default PIN
5. You'll see a calculator
6. Type: `0000` (four zeros)
7. Press `=` button
8. This will open role selection

### Select Role
9. Select "Child"
10. Create a PIN (e.g., `1234`)
11. Tap "Complete Setup"

### Get Pairing Code
12. After setup, the app will show a message with a **6-digit pairing code**
13. **Write down this code** (expires in 5 minutes)
14. Example: `A3F8K9`

---

## ✅ Step 6: Test App on Second Device (Parent Device)

### Initial Setup
1. Open the app on Device B (will be the parent device)
2. Complete consent screen
3. Enter any name (e.g., "Parent")
4. Tap "Continue"

### Calculator Default PIN
5. Type: `0000` on the calculator
6. Press `=`

### Select Role
7. Select "Parent"
8. Create your parent PIN (e.g., `5678`)
9. Tap "Complete Setup"

---

## ✅ Step 7: Pair the Devices

### On Parent Device
1. Look for "Pair Device" or "Connect Child Device" option
2. Enter the **6-digit code** from Step 5 (from child device)
3. Tap "Pair"

### Expected Result
- ✅ Parent device should show: "Device paired successfully"
- ✅ Parent should see child device in connected devices list
- ✅ Child device should show: "Connected to parent"

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ Backend health check returns `{"status":"ok"}`
2. ✅ Child device can generate pairing codes
3. ✅ Parent device can enter pairing codes
4. ✅ Devices show as "Connected" on both sides
5. ✅ No "No base url found" errors in console

---

## ⚠️ Common Issues & Fixes

### Issue: "No base url found"
**Fix**: 
1. Make sure `.env` file exists in project root
2. Restart Expo dev server completely
3. Check `.env` URL has no typos or trailing slash

### Issue: "Pairing code expired"
**Fix**: 
1. Codes expire after 5 minutes
2. Generate a new code on child device
3. Use it immediately on parent device

### Issue: Backend returns 404
**Fix**:
1. Check vercel deployment: `vercel ls`
2. Redeploy: `vercel --prod`
3. Update `.env` with new URL

### Issue: Calculator PIN not working
**Fix**:
1. After consent, default PIN is always `0000`
2. Once you set up a role and PIN, use your configured PIN
3. Clear app data and restart if stuck

---

## 📱 Testing Flow Summary

```
Child Device:
1. Consent → 2. Calculator (0000) → 3. Select "Child" → 4. Set PIN → 5. Get Code

Parent Device:  
1. Consent → 2. Calculator (0000) → 3. Select "Parent" → 4. Set PIN → 5. Enter Code

Result: 
✅ Both devices connected via backend
```

---

## 🔍 Debugging

### View Backend Logs
```bash
vercel logs
```

### View App Logs
- Open Expo Dev Tools in browser
- Check Metro bundler console
- Look for `[Backend]` and `[Calculator]` prefixed logs

### Test Backend Directly
```bash
# Test health endpoint
curl https://your-app-XXXXX.vercel.app/api

# Expected response:
# {"status":"ok","message":"API is running"}
```

---

## 📞 Still Stuck?

Check these in order:
1. Is `.env` file in the project root?
2. Did you restart Expo after creating `.env`?
3. Is the backend URL in `.env` correct?
4. Does the backend health check work in browser?
5. Are both devices connected to internet?
6. Did the pairing code expire (5 min limit)?

---

**Next Steps**: Once pairing works, test the monitoring features!
