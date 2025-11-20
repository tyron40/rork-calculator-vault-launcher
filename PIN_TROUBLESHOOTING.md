# PIN Troubleshooting Guide

## Problem: Calculator PIN Not Working

If you're getting "Incorrect PIN" errors when trying to access the app through the calculator disguise, follow these steps:

### Quick Fix Steps

1. **Check Your Setup**
   - Tap the info button (ⓘ) in the top-left corner of the calculator
   - This will show you what PINs are configured and your current role

2. **Verify Your PIN**
   - Make sure you're entering the correct PIN for your role:
     - **Parent role**: Use the Parent PIN you set up
     - **Child role**: Use the Child PIN you set up
   - PINs must be 4+ digits (numbers only)
   - The default child PIN is `0000` if you didn't set a custom one

3. **How to Enter PIN**
   - Type your PIN on the calculator (e.g., `1234`)
   - Press the `=` button to login
   - Do NOT press any other operator buttons before `=`

4. **Check Console Logs**
   - Open developer console/logs on your device
   - Look for `[Calculator] PIN VALIDATION` messages
   - This will show you what PIN was entered vs what was stored

### Reset Device (If PIN Is Forgotten)

If you forgot your PIN or continue having issues:

1. **From Calculator Screen**:
   - Tap the info button (ⓘ) in top-left corner
   - Select "Reset Device" from the alert
   - Confirm the reset
   - You'll be taken back to the setup process

2. **Alternative Method**:
   - When you get "Incorrect PIN" error
   - Select "Reset Device" button from the alert
   - Confirm the reset

3. **After Reset**:
   - You'll need to go through the consent process again
   - Select your role (Parent or Child)
   - Set up new PINs
   - The device will be completely fresh

## Common Issues

### Issue 1: "PIN doesn't work on all phones"
**Cause**: Different PIN was set up for each device
**Solution**: Each device has its own PIN. Make sure you're using the correct PIN for each device.

### Issue 2: "Default 0000 doesn't work"
**Cause**: A different PIN was set during setup
**Solution**: 
- Check if you set a custom PIN during setup
- Use the info button to verify if a PIN is set
- Reset the device if you forgot the PIN

### Issue 3: "I set up a PIN but it doesn't work"
**Cause**: Possible whitespace or special character issue
**Solution**: PINs are automatically normalized (only numbers, no spaces). If you're still having issues, reset and set up again.

## Setup Tips

To avoid PIN issues in the future:

1. **Use Simple PINs**: Stick to 4-6 digits (e.g., `1234`, `5678`)
2. **Write Down PINs**: Keep a secure note of your parent and child PINs
3. **Test Immediately**: After setup, immediately test the calculator PIN entry
4. **Different PINs**: Use different PINs for parent and child roles

## For Developers

### Debug PIN Issues

1. Check console logs when entering PIN
2. Look for these log messages:
   ```
   [Calculator] PIN VALIDATION START
   [Calculator] Entered PIN: "XXXX" length: X
   [Calculator] Parent PIN (normalized): "XXXX" length: X
   [Calculator] Child PIN (normalized): "XXXX" length: X
   ```

3. Verify PIN normalization is working correctly
4. Check AsyncStorage for stored PIN values:
   ```javascript
   await AsyncStorage.getItem('parent_pin');
   await AsyncStorage.getItem('child_pin');
   await AsyncStorage.getItem('user_role');
   ```

### PIN Storage

PINs are stored in AsyncStorage with these keys:
- `parent_pin`: Parent's PIN (normalized, numbers only)
- `child_pin`: Child's PIN (normalized, numbers only)
- `user_role`: Current active role ('parent' or 'child')
- `access_pin`: Last used PIN

All PINs are normalized before storage and validation:
```javascript
const normalizePin = (pin: string): string => {
  return String(pin || '').trim().replace(/[^0-9]/g, '');
};
```

## Need More Help?

If you're still having issues after trying these steps:
1. Check all console logs for detailed error messages
2. Verify the device completed the initial setup flow
3. Try resetting the device and setting up from scratch
4. Make sure you're not mixing up parent and child PINs
