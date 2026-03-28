# Setup Flowchart - Visual Guide

## 🗺️ Your Journey to Working Real-Time Connection

```
┌─────────────────────────────────────────────────────────────────┐
│                     START: You Are Here                         │
│                   (Option 2 Selected)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │  Install Vercel │
                   │   npm i -g      │
                   │    vercel       │
                   └────────┬────────┘
                            │ 1 min
                            ▼
                   ┌─────────────────┐
                   │  Deploy Backend │
                   │     vercel      │
                   └────────┬────────┘
                            │ 3 min
                            ▼
                   ┌─────────────────┐
                   │   Copy URL      │
                   │  https://...    │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Create .env    │
                   │  Add Backend URL│
                   └────────┬────────┘
                            │ 1 min
                            ▼
                   ┌─────────────────┐
                   │  Restart Expo   │
                   │   bun start     │
                   └────────┬────────┘
                            │ 30 sec
                            ▼
                   ┌─────────────────┐
                   │  Test Backend   │
                   │  curl /api      │
                   └────────┬────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌─────────────┐        ┌─────────────┐
        │   200 OK    │        │    Error    │
        │  Continue   │        │   Debug     │────┐
        └──────┬──────┘        └─────────────┘    │
               │                                   │
               │                         ┌─────────▼──────────┐
               │                         │ Check URL in .env  │
               │                         │ Redeploy: vercel   │
               │                         │ Check logs         │
               │                         └─────────┬──────────┘
               │                                   │
               │◄──────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Setup Child Device  │
    │   (Phone/Tablet A)   │
    └──────────┬───────────┘
               │ 5 min
               ▼
    ┌──────────────────────┐
    │  1. Launch App       │
    │  2. Accept Consent   │
    │  3. Calculator: 0000 │
    │  4. Select "Child"   │
    │  5. Create PIN       │
    │  6. Get Pairing Code │
    └──────────┬───────────┘
               │
               │  Write down code: ___________
               │
               ▼
    ┌──────────────────────┐
    │  Setup Parent Device │
    │   (Phone/Tablet B)   │
    └──────────┬───────────┘
               │ 5 min
               ▼
    ┌──────────────────────┐
    │  1. Launch App       │
    │  2. Accept Consent   │
    │  3. Calculator: 0000 │
    │  4. Select "Parent"  │
    │  5. Create PIN       │
    │  6. Enter Child Code │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   Devices Paired!    │
    │   ✅ Success         │
    └──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  You can now:                        │
│  - Monitor child device              │
│  - Track location                    │
���  - View app usage                    │
│  - Stream audio (if enabled)         │
│  - Remote control features           │
└──────────────────────────────────────┘
```

---

## 🔍 Decision Points

### At Each Step, Ask Yourself:

#### After Deploying Backend
**Question**: Does `curl https://your-url.vercel.app/api` return 200 OK?
- ✅ **Yes** → Continue to next step
- ❌ **No** → Check [TEST_CONNECTION.md](./TEST_CONNECTION.md)

#### After Creating .env
**Question**: Did you restart Expo after creating .env?
- ✅ **Yes** → Continue to testing
- ❌ **No** → **MUST RESTART**: `bun start`

#### After Child Setup
**Question**: Did you write down the 6-digit pairing code?
- ✅ **Yes** → Proceed to parent setup
- ❌ **No** → Code expires in 5 min! Generate new one

#### After Parent Setup
**Question**: Are both devices showing "Connected"?
- ✅ **Yes** → 🎉 Success! Test features
- ❌ **No** → Check console logs, regenerate code

---

## 🚦 Status Indicators

### Green Light (Ready to Continue) ✅
- Backend returns `{"status":"ok"}`
- `.env` file exists with correct URL
- Expo restarted successfully
- No console errors
- Pairing code generated
- Code entered before expiration

### Yellow Light (Warning) ⚠️
- Backend slow to respond → May need better hosting plan
- Code about to expire → Use it quickly
- Connection intermittent → Check internet on both devices

### Red Light (Stop and Fix) 🛑
- Backend returns 404/500 → Redeploy
- "No base url found" error → Create/fix .env and restart
- "Incorrect PIN" with 0000 → Clear app data
- "Code expired" → Generate fresh code
- No internet on device → Connect to WiFi

---

## 📊 Progress Tracker

Copy this and check off as you go:

```
Setup Progress:
[ ] Vercel CLI installed
[ ] Backend deployed
[ ] Backend URL copied
[ ] .env file created
[ ] Expo restarted
[ ] Backend health check passed
[ ] Child device set up
[ ] Pairing code obtained
[ ] Parent device set up  
[ ] Code entered on parent
[ ] Devices paired successfully
[ ] Connection confirmed on both

Current Status: ___/12 complete
```

---

## ⏱️ Time Checkpoints

If you're taking longer than these times, check the troubleshooting guides:

- **0-5 min**: Vercel deployment
  - Stuck? → Check if Vercel CLI installed
- **5-7 min**: .env configuration
  - Stuck? → Verify URL format
- **7-10 min**: Backend testing
  - Stuck? → See [TEST_CONNECTION.md](./TEST_CONNECTION.md)
- **10-15 min**: Child device setup
  - Stuck? → Verify consent screen completed
- **15-20 min**: Parent device setup
  - Stuck? → Ensure fresh pairing code
- **20-30 min**: Pairing and testing
  - Stuck? → Check both devices have internet

**Total Expected Time**: 20-30 minutes

---

## 🎯 Quick Wins

Small victories along the way:

1. ✅ Vercel CLI installed
2. ✅ Deployment started
3. ✅ Got deployment URL
4. ✅ .env file created
5. ✅ Expo restarted without errors
6. ✅ Backend health check passed
7. ✅ Calculator PIN 0000 worked
8. ✅ Role selected successfully
9. ✅ PIN created and saved
10. ✅ Pairing code generated
11. ✅ Code entered on parent
12. ✅ Devices paired!

**Celebrate each win!** 🎉

---

## 🗺️ Alternative Paths

### If Vercel Doesn't Work

```
Vercel Failed
      │
      ▼
Try Railway
      │
railway up
      │
      ▼
Get Railway URL
      │
      ▼
Continue from
"Create .env" step
```

### If Backend Keeps Failing

```
Backend Issues
      │
      ▼
Check Documentation:
- DEPLOYMENT_GUIDE.md
- TEST_CONNECTION.md
      │
      ▼
Still failing?
      │
      ▼
Check logs:
vercel logs
      │
      ▼
Fix issues and
redeploy
```

### If Pairing Fails

```
Pairing Failed
      │
      ├─ Code Expired?
      │  └─► Generate new code
      │
      ├─ Backend not responding?
      │  └─► Test health endpoint
      │
      ├─ Network issue?
      │  └─► Check WiFi/data
      │
      └─ Wrong code?
         └─► Verify code carefully
```

---

## 🎓 What You'll Learn

By completing this setup, you'll understand:

1. **Backend deployment** with Vercel
2. **Environment variables** in React Native
3. **tRPC** for type-safe APIs
4. **Device pairing** flows
5. **Real-time connections** architecture
6. **Debugging** mobile apps

---

## 📍 Where to Go Next

After successful setup:

1. **Test Features**
   - Location tracking
   - App monitoring
   - Audio streaming (if enabled)

2. **Customize**
   - Adjust monitoring settings
   - Configure notifications
   - Set up custom alerts

3. **Production** (Optional)
   - Custom domain
   - Better hosting
   - Analytics setup

---

## 🆘 Emergency Exits

**Completely stuck?**

1. **Quick fix**: Clear everything and start over
   ```bash
   rm .env
   rm -rf node_modules/.cache
   vercel --prod
   # Then start from Step 2
   ```

2. **Read troubleshooting**: [TEST_CONNECTION.md](./TEST_CONNECTION.md)

3. **Check specific guides**:
   - Backend issues → [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - Setup questions → [OPTION_2_COMPLETE_GUIDE.md](./OPTION_2_COMPLETE_GUIDE.md)
   - Quick reference → [QUICK_DEPLOY_CHECKLIST.md](./QUICK_DEPLOY_CHECKLIST.md)

---

**You've got this! Follow the flowchart and you'll be up and running soon. 🚀**
