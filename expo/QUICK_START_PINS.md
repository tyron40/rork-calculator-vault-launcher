# 🔐 Quick Start: PINs & Access

## First Time Setup

### Step 1: Launch App
Open the app → You'll see a **Calculator** screen

### Step 2: Initial Access
Tap the **ⓘ** icon (top-left corner) OR just wait → Consent form appears

### Step 3: Provide Consent
Fill out the parental consent form and submit

### Step 4: Choose Your Role

**Option A: Parent Device**
1. Select **"Parent"** role
2. Create a PIN (e.g., `1234`)
3. Tap **"Complete Setup"**
4. ✅ Parent Dashboard opens

**Option B: Child Device**
1. Select **"Child"** role
2. Create a PIN (e.g., `5678`)
3. Tap **"Complete Setup"**
4. ✅ Child Dashboard opens

---

## Accessing Your Dashboard

### Method 1: Calculator Disguise (Recommended)

The app looks like a calculator for privacy!

**To access:**
1. Type your PIN on the calculator (e.g., `1234`)
2. Press the **=** button
3. ✅ Your dashboard opens

**Example:**
```
Parent PIN is 1234
→ Type: 1, 2, 3, 4
→ Press: =
→ Opens: Parent Dashboard
```

### Method 2: Info Button

1. Tap the **ⓘ** icon
2. It will show which role you're logged in as
3. Can access role selection from there

---

## PIN Examples

### Recommended PINs

✅ **Good PINs:**
- `147258` - Random pattern
- `982614` - Non-sequential
- `637492` - Hard to guess

❌ **Weak PINs:**
- `1234` - Too sequential
- `0000` - Too simple
- `1111` - Repetitive

### Parent vs Child

| Role | Example PIN | Dashboard |
|------|-------------|-----------|
| Parent | `1234` | Parent features, device management |
| Child | `5678` | Child features, pairing codes |

**Important:** Each role has its **own separate PIN**!

---

## Common Scenarios

### Scenario 1: Parent Monitoring Child

**Parent Device:**
1. Set up as Parent (PIN: `1234`)
2. Go to Connect tab
3. Generate pairing code → `ABC123`
4. Share code with child

**Child Device:**
1. Set up as Child (PIN: `5678`)
2. Enter parent code: `ABC123`
3. ✅ Devices connected!

**To access later:**
- Parent: Type `1234` + `=` on calculator
- Child: Type `5678` + `=` on calculator

### Scenario 2: Switching Between Roles

**From Dashboard:**
1. Tap logout button (top-right)
2. Select "Change Account"
3. Choose different role
4. Enter that role's PIN
5. ✅ Switch complete

**From Calculator:**
- Just type the other role's PIN and press `=`

### Scenario 3: Forgot PIN

**If you forgot your PIN:**

1. **Clear App Data:**
   - iOS: Settings → Apps → [App Name] → Delete App → Reinstall
   - Android: Settings → Apps → [App Name] → Clear Data
   
2. **Start Fresh:**
   - Go through setup again
   - Create new PIN
   - Reconfigure settings

⚠️ **Warning:** This will erase all local data!

---

## Tips for Mobile Devices

### iPhone/iPad
- Numeric keyboard appears automatically
- Face ID/Touch ID not enabled (PIN only)
- Works in portrait and landscape

### Android
- Number pad appears for PIN entry
- Haptic feedback on calculator buttons
- Works on all Android versions

### Both Platforms
✅ Calculator looks realistic  
✅ PIN is hidden when typing (secure entry)  
✅ Minimum 4 digits required  
✅ Maximum 8 digits allowed  
✅ Clear error messages if wrong PIN  

---

## Troubleshooting

### "Incorrect PIN" Error

**Problem:** The PIN you entered doesn't match

**Solutions:**
1. ✅ Double-check you're typing the correct PIN
2. ✅ Make sure you set up that role
3. ✅ Verify the calculator display shows your numbers
4. ✅ Try pressing `C` to clear and start over

### Calculator Not Responding

**Problem:** Pressing `=` doesn't do anything

**Solutions:**
1. ✅ Type at least 4 digits first
2. ✅ Check if numbers appear on display
3. ✅ Try pressing `C` and re-entering PIN
4. ✅ Make sure app is fully loaded

### Can't Access Role Selection

**Problem:** Stuck on calculator screen

**Solutions:**
1. ✅ Tap the **ⓘ** icon (top-left)
2. ✅ Read the popup instructions
3. ✅ Type any PIN and press `=`
4. ✅ If no roles set up, will go to role selection

---

## PIN Security

### Keep Your PIN Safe

🔒 **DO:**
- Use a strong, random PIN
- Keep it private
- Change it if someone sees it
- Use different PINs for Parent and Child

🔓 **DON'T:**
- Share your PIN with others
- Use obvious patterns (1234, 0000)
- Write it down where others can see
- Use same PIN for everything

### Why Separate PINs?

**Parent PIN** → Full control, device management  
**Child PIN** → Limited access, monitored features

This separation ensures:
- ✅ Child can't access parent features
- ✅ Parent has full oversight
- ✅ Each user has privacy
- ✅ Better security overall

---

## Quick Reference

### Default Behavior

| Action | Result |
|--------|--------|
| First app launch | Shows calculator |
| Tap ⓘ icon | Opens consent/info |
| Complete consent | Goes to role selection |
| Set up Parent | Creates parent PIN |
| Set up Child | Creates child PIN |
| Type PIN + = | Opens dashboard |
| Wrong PIN | Shows error |
| No setup | Goes to role selection |

### Storage Locations

```
Parent PIN    → AsyncStorage: 'parent_pin'
Child PIN     → AsyncStorage: 'child_pin'
Current Role  → AsyncStorage: 'user_role'
```

### Minimum Requirements

- ✅ PIN: 4+ digits
- ✅ Numbers only
- ✅ No spaces
- ✅ No special characters

---

## Need Help?

### Check the Console

On web: Open browser developer tools (F12)  
On mobile: Check Metro bundler console

Look for logs like:
```
[Calculator] Checking PIN: 1234
[Calculator] Parent PIN matched
[Calculator] PIN accepted! Redirecting to: /parent
```

### Reset Everything

If all else fails:
1. Clear app data
2. Restart app
3. Go through setup again
4. Create new PINs

---

## Summary

✅ **Setup:** Choose role → Create PIN → Access dashboard  
✅ **Access:** Type PIN on calculator → Press = → Dashboard opens  
✅ **Secure:** Separate PINs for Parent and Child  
✅ **Private:** Calculator disguise for discretion  
✅ **Simple:** Just 4+ digits, easy to remember  

**That's it!** You're now ready to use the app securely. 🎉
