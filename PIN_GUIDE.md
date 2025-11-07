# PIN Setup & Login Guide

## How PINs Work

This app uses **separate PINs** for Parent and Child accounts to ensure secure access control.

### Initial Setup (First Time)

1. **Launch the app** - You'll see a calculator screen
2. **Provide parental consent** - Follow the consent form
3. **Select your role** - Choose either Parent or Child
4. **Create your PIN** - Enter a 4+ digit PIN for your role
5. **Done!** - Your PIN is securely saved

### PIN Storage

- **Parent PIN** - Stored as `parent_pin` in AsyncStorage
- **Child PIN** - Stored as `child_pin` in AsyncStorage
- **Current Role** - Stored as `user_role` in AsyncStorage

### Accessing the App

#### From Calculator Screen

Type your PIN on the calculator and press **=**

- **Parent PIN** → Goes to Parent Dashboard
- **Child PIN** → Goes to Child Dashboard
- **No setup yet** → Goes to Role Selection

#### From Role Selection

1. Select your role (Parent or Child)
2. Enter your PIN
3. Press Login

### Important Notes

✅ **Each role has its own unique PIN**
- Parent sets their own PIN during setup
- Child sets their own PIN during setup
- PINs can be different or the same (though different is recommended)

✅ **PINs are device-specific**
- Each device stores its own PINs locally
- No cloud sync or remote storage
- Reset app data to clear PINs

✅ **Minimum Requirements**
- PIN must be at least 4 digits
- Numbers only (on calculator)
- No special characters needed

## Example Flows

### Scenario 1: New Parent Setup

1. Open app → Calculator appears
2. Tap info icon (ⓘ) → Consent screen
3. Fill consent form
4. Role Selection → Choose "Parent"
5. Enter PIN: `1234`
6. Parent Dashboard opens

**To access again:** Type `1234` on calculator and press `=`

### Scenario 2: New Child Setup

1. Open app → Calculator appears
2. Tap info icon (ⓘ) → Consent screen
3. Fill consent form (parent must provide)
4. Role Selection → Choose "Child"
5. Enter PIN: `5678`
6. Child Dashboard opens

**To access again:** Type `5678` on calculator and press `=`

### Scenario 3: Switching Accounts

From Parent or Child Dashboard:
1. Tap the logout button (in header)
2. Select "Change Account"
3. Enter PIN for other role
4. Dashboard switches

## Troubleshooting

### "Incorrect PIN" Error

**Cause:** The PIN you entered doesn't match the stored PIN for your role

**Solution:**
1. Make sure you're entering the correct PIN
2. Check if you set up that role's PIN
3. Verify keyboard is working (on mobile)
4. If forgotten, you may need to clear app data

### PIN Not Working After Setup

**Cause:** PIN may not have been saved properly

**Solution:**
1. Check device logs in console
2. Try logging out and back in
3. Verify AsyncStorage is working
4. Reset and set up again if needed

### Calculator Not Accepting PIN

**Cause:** Need at least 4 digits before pressing `=`

**Solution:**
1. Type 4 or more digits
2. Then press `=` button
3. Wait for verification

## Security Best Practices

🔒 **Use Different PINs**
- Parent should use a different PIN than Child
- Harder for one user to access other's account

🔒 **Don't Share PINs**
- Keep your PIN private
- Don't write it down visibly

🔒 **Use Strong PINs**
- Avoid simple patterns (1234, 0000)
- Use at least 6 digits for better security
- Mix numbers randomly

🔒 **Change PINs Regularly**
- Reset and reconfigure periodically
- Especially if PIN may be compromised

## Developer Notes

### Storage Keys

```typescript
'parent_pin'     // Parent's PIN
'child_pin'      // Child's PIN  
'user_role'      // Current active role ('parent' | 'child')
'access_pin'     // Legacy - now using role-specific PINs
```

### PIN Verification Logic

```typescript
// Check if PIN matches parent
if (storedRole === 'parent' && parentPin === pin) → /parent

// Check if PIN matches child
if (storedRole === 'child' && childPin === pin) → /child

// Check if PIN matches either (when no active role)
if (parentPin === pin) → /parent
if (childPin === pin) → /child
```

### Reset Everything

To completely reset the app:

```javascript
// In React Native code
await AsyncStorage.multiRemove([
  'parent_pin',
  'child_pin',
  'user_role',
  'access_pin',
  'parental_consent'
]);
```

Then restart the app.
