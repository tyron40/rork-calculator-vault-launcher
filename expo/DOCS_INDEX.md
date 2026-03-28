# 📚 Documentation Index

## Calculator Vault Launcher - Development Builds Guide

Welcome! This app requires **Expo Development Builds** to run. We've created comprehensive documentation to help you get started.

---

## 🎯 Start Here

### New to This App?
**→ [START_HERE.md](./START_HERE.md)**
- What this app does
- Why development builds are required
- Platform support
- Quick overview

### Ready to Build?
**→ [GETTING_STARTED.md](./GETTING_STARTED.md)**
- Step-by-step setup
- Prerequisites checklist
- Local and cloud build walkthroughs
- Testing instructions

### Need Quick Reference?
**→ [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)**
- TL;DR setup (5 minutes)
- Essential commands
- Quick troubleshooting
- Command reference

---

## 📖 Complete Guides

### Development Builds Deep Dive
**→ [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)**
- What are development builds
- Why you need them
- Complete setup guide
- Development workflow
- Debugging
- Production builds

**Time**: 20 minutes  
**Level**: Beginner to Advanced

---

### Build Options Comparison
**→ [BUILD_OPTIONS.md](./BUILD_OPTIONS.md)**
- Local vs Cloud builds
- Feature comparison
- Cost analysis
- Recommendations by use case
- When to rebuild

**Time**: 10 minutes  
**Level**: All levels

---

### EAS Build Setup
**→ [EAS_SETUP.md](./EAS_SETUP.md)**
- EAS CLI installation
- Configuration guide
- Build profiles
- Credentials management
- CI/CD integration
- Troubleshooting

**Time**: 15 minutes  
**Level**: Intermediate to Advanced

---

### Development Builds Summary
**→ [DEVELOPMENT_BUILDS_SUMMARY.md](./DEVELOPMENT_BUILDS_SUMMARY.md)**
- Quick overview of all docs
- Essential commands
- Common workflows
- Success criteria
- Documentation map

**Time**: 5 minutes  
**Level**: All levels

---

### Development Builds Info
**→ [DEV_BUILDS_INFO.md](./DEV_BUILDS_INFO.md)**
- Quick reference card
- Installation confirmation
- Next steps
- Documentation links

**Time**: 2 minutes  
**Level**: All levels

---

## 🗺️ Documentation Map

```
START_HERE.md
    ↓
GETTING_STARTED.md ──→ Build & Test
    ↓
DEV_BUILD_QUICKSTART.md ──→ Quick Reference
    ↓
DEVELOPMENT_BUILDS.md ──→ Deep Dive
    ↓
BUILD_OPTIONS.md ──→ Compare Options
    ↓
EAS_SETUP.md ──→ Cloud Builds
    ↓
DEVELOPMENT_BUILDS_SUMMARY.md ──→ Summary
```

---

## 🎓 Learning Paths

### Path 1: Beginner (Total: 30 minutes)
1. [START_HERE.md](./START_HERE.md) - 5 min
2. [GETTING_STARTED.md](./GETTING_STARTED.md) - 10 min
3. [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md) - 5 min
4. Build and test - 10 min
5. **Result**: Working development build

### Path 2: Intermediate (Total: 45 minutes)
1. [START_HERE.md](./START_HERE.md) - 5 min
2. [BUILD_OPTIONS.md](./BUILD_OPTIONS.md) - 10 min
3. [GETTING_STARTED.md](./GETTING_STARTED.md) - 10 min
4. [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md) - 20 min
5. **Result**: Deep understanding + working build

### Path 3: Advanced (Total: 60 minutes)
1. [DEVELOPMENT_BUILDS_SUMMARY.md](./DEVELOPMENT_BUILDS_SUMMARY.md) - 5 min
2. [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md) - 20 min
3. [BUILD_OPTIONS.md](./BUILD_OPTIONS.md) - 10 min
4. [EAS_SETUP.md](./EAS_SETUP.md) - 15 min
5. Set up CI/CD - 10 min
6. **Result**: Production-ready setup

### Path 4: Quick Start (Total: 10 minutes)
1. [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md) - 5 min
2. Run commands - 5 min
3. **Result**: Working build (minimal understanding)

---

## 🎯 By Use Case

### "I just want to test the app"
1. [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)
2. Use EAS Cloud Build
3. Install and test

### "I'm developing this app daily"
1. [GETTING_STARTED.md](./GETTING_STARTED.md)
2. [BUILD_OPTIONS.md](./BUILD_OPTIONS.md)
3. Use Local Builds
4. Set up workflow

### "I'm working with a team"
1. [EAS_SETUP.md](./EAS_SETUP.md)
2. [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)
3. Use EAS Cloud Builds
4. Set up CI/CD

### "I need to understand everything"
1. Read all docs in order
2. Try both local and cloud builds
3. Set up production pipeline
4. Contribute to project

---

## 📋 Quick Reference

### Essential Commands

**Setup:**
```bash
npx expo install expo-dev-client
```

**Local Build:**
```bash
npx expo prebuild --platform android
npx expo run:android
```

**Cloud Build:**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
```

**Develop:**
```bash
npx expo start --dev-client
```

---

## 🔍 Find What You Need

### Setup & Installation
- [START_HERE.md](./START_HERE.md) - Overview
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Step-by-step
- [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md) - Quick setup

### Understanding Development Builds
- [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md) - Complete guide
- [DEVELOPMENT_BUILDS_SUMMARY.md](./DEVELOPMENT_BUILDS_SUMMARY.md) - Summary
- [DEV_BUILDS_INFO.md](./DEV_BUILDS_INFO.md) - Quick info

### Choosing Build Method
- [BUILD_OPTIONS.md](./BUILD_OPTIONS.md) - Comparison
- [EAS_SETUP.md](./EAS_SETUP.md) - Cloud builds

### Troubleshooting
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- Each guide has troubleshooting section

### Project Information
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Architecture
- [NATIVE_MODULE.md](./NATIVE_MODULE.md) - Native code
- [APP_CONFIG.md](./APP_CONFIG.md) - Configuration

---

## 🆘 Getting Help

### Documentation
Start with the appropriate guide above based on your needs.

### External Resources
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native Docs](https://reactnative.dev/)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

## ✅ Quick Checklist

### Before You Start
- [ ] Read [START_HERE.md](./START_HERE.md)
- [ ] Understand why Expo Go won't work
- [ ] Choose build method (local or cloud)
- [ ] Have prerequisites ready

### Setup
- [ ] Install expo-dev-client
- [ ] Update app.json
- [ ] Configure build system
- [ ] Create first build

### Testing
- [ ] App launches
- [ ] Launcher functionality works
- [ ] Can hide/launch apps
- [ ] Dev server connects

### Development
- [ ] Fast Refresh works
- [ ] Can make changes
- [ ] Understand rebuild triggers
- [ ] Know troubleshooting steps

---

## 🎉 Success Criteria

You're ready when:
- ✅ Development build installed on device
- ✅ App set as default launcher
- ✅ Can hide and launch apps
- ✅ Dev server connects
- ✅ Fast Refresh works
- ✅ Understand when to rebuild

---

## 📊 Documentation Stats

| Document | Words | Time | Level |
|----------|-------|------|-------|
| START_HERE.md | ~2000 | 5 min | Beginner |
| GETTING_STARTED.md | ~3000 | 10 min | Beginner |
| DEV_BUILD_QUICKSTART.md | ~1500 | 5 min | All |
| DEVELOPMENT_BUILDS.md | ~4000 | 20 min | All |
| BUILD_OPTIONS.md | ~3500 | 10 min | All |
| EAS_SETUP.md | ~3000 | 15 min | Intermediate |
| DEVELOPMENT_BUILDS_SUMMARY.md | ~2500 | 5 min | All |
| DEV_BUILDS_INFO.md | ~500 | 2 min | All |

**Total**: ~20,000 words, ~72 minutes of reading

---

## 🚀 Ready to Start?

### Recommended First Steps

1. **Read** [START_HERE.md](./START_HERE.md) (5 min)
2. **Follow** [GETTING_STARTED.md](./GETTING_STARTED.md) (10 min)
3. **Build** using chosen method (5-20 min)
4. **Test** launcher functionality (5 min)
5. **Develop** with Fast Refresh (ongoing)

### Quick Commands

**Local build:**
```bash
npx expo prebuild --platform android && npx expo run:android
```

**Cloud build:**
```bash
eas build --profile development --platform android
```

**Start developing:**
```bash
npx expo start --dev-client
```

---

## 📝 Notes

- All documentation is up-to-date as of the latest commit
- Commands assume you're in the project root directory
- Android is the primary platform (iOS has limited functionality)
- Web preview uses mock data only

---

**Happy building! 🎉**

Need help? Start with [START_HERE.md](./START_HERE.md)
