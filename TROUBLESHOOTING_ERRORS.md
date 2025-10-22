# Troubleshooting Common Errors

## Quick Diagnosis

If the app isn't loading, check the console/terminal output for error messages. Below are common issues and their solutions.

## Error: "No base url found"

**Cause**: The app couldn't detect the backend URL.

**Solution**: This should now be auto-fixed, but if you still see it:
1. Stop the app (Ctrl+C)
2. Start again with `npm start` or `bun start`
3. Make sure you're using the tunnel URL

## Error: "Failed to fetch" or "Network request failed"

**Cause**: Backend isn't running or URL is incorrect.

**Solutions**:
1. **Check backend is running**: Open `http://localhost:8081/api` in browser
   - Should see: `{"status":"ok","message":"API is running"}`
   
2. **Check tunnel URL**: When you run `npm start`, look for tunnel URL in output:
   ```
   Tunnel ready: https://xyz123.tunnel.rork.com
   ```

3. **Restart the dev server**:
   ```bash
   # Stop with Ctrl+C, then:
   npm start
   ```

## Error: "Failed to create vault" or "Failed to verify PIN"

**Cause**: Issues with secure storage or crypto operations.

**Solutions**:

### On Web:
- Clear browser localStorage
- Open DevTools → Application → Local Storage → Clear All
- Refresh the page

### On Mobile:
- Uninstall and reinstall the app
- Clear app data from device settings

## Error: "Invalid or expired pairing code"

**Causes**:
1. Code is older than 5 minutes
2. Code was already used
3. Typo in the code

**Solutions**:
1. Generate a new pairing code on child device
2. Enter it on parent device within 5 minutes
3. Make sure you type exactly 6 characters (case-sensitive)

## App Stuck on Loading Screen

**Possible Causes**:
1. Backend not responding
2. AsyncStorage not working
3. Navigation error

**Solutions**:

1. **Check Console Logs**: Look for messages with these prefixes:
   - `[Calculator]`
   - `[Setup]`  
   - `[Consent]`
   - `[Backend]`

2. **Clear App Data**:
   ```javascript
   // Add this temporarily to app/index.tsx
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   // In component:
   useEffect(() => {
     AsyncStorage.clear().then(() => {
       console.log('Storage cleared');
     });
   }, []);
   ```

3. **Force Navigation**: If stuck, manually navigate:
   ```javascript
   // In the stuck screen:
   router.replace('/consent');
   ```

## Error: "Cannot read property of undefined"

**Cause**: Trying to access data that doesn't exist yet.

**Common scenarios**:
- Accessing store before initialization
- Reading AsyncStorage before it's loaded
- Using undefined refs

**Check these files for errors**:
1. `app/index.tsx` - Check initialization logic
2. `store/vaultStore.ts` - Verify store structure
3. Console logs - Look for specific property name

## Calculator Not Responding to PIN

**Cause**: PIN buffer not working or no PIN set up yet.

**Solutions**:
1. Make sure vault is initialized (you completed setup)
2. Check console for `[Calculator] PIN entered, checking...`
3. Verify PINs are saved:
   ```javascript
   // Add to check:
   AsyncStorage.getItem('parent_pin').then(console.log);
   AsyncStorage.getItem('child_pin').then(console.log);
   ```

## Disguise Mode Won't Exit

**Cause**: PIN check failing or not detecting PIN entry.

**Solutions**:
1. Make sure you press `=` after entering your PIN
2. Try entering PIN slowly (one number at a time)
3. Check that disguise mode flag is set:
   ```javascript
   AsyncStorage.getItem('calculator_disguise_mode').then(console.log);
   ```
4. Manually exit (for testing):
   ```javascript
   await AsyncStorage.removeItem('calculator_disguise_mode');
   router.replace('/');
   ```

## Backend tRPC Errors

### Error: "Procedure not found"

**Cause**: Procedure name mismatch.

**Solution**: Check that procedure is exported and added to router:
1. Open `backend/trpc/app-router.ts`
2. Verify all procedures are properly imported and added
3. Check the exact name used in client code matches router

### Error: "Transformer error" or "Serialization failed"

**Cause**: Data not serializable with SuperJSON.

**Solution**: 
- Don't send functions, class instances, or circular references
- Use plain objects, arrays, strings, numbers, dates

## TypeScript Errors

If you see TypeScript errors in your editor:

1. **Restart TypeScript Server**:
   - VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

2. **Check tsconfig.json** paths are correct

3. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   rm bun.lock
   bun install
   ```

## Mobile-Specific Issues

### iOS Simulator

**Permissions not working**:
- Microphone, location, etc. require permissions in Info.plist
- These are already configured in `app.json`
- Reset permissions: Device → Erase All Content and Settings

### Android Emulator

**App crashes on startup**:
1. Check logcat for errors: `adb logcat *:E`
2. Verify permissions in `app.json` → `android.permissions`
3. Try cold boot: AVD Manager → Cold Boot Now

## Still Having Issues?

1. **Enable Debug Mode**: Add this to see more logs:
   ```javascript
   // In app/_layout.tsx
   console.log('App loading...', {
     env: process.env,
     platform: Platform.OS,
   });
   ```

2. **Check File Paths**: All imports use `@/` alias:
   ```javascript
   import { something } from '@/services/storage';
   // NOT: import { something } from '../services/storage';
   ```

3. **Verify Backend Routes**: Test each endpoint:
   ```bash
   # Health check
   curl http://localhost:8081/api
   
   # tRPC endpoint
   curl http://localhost:8081/api/trpc/example.hi \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"test"}'
   ```

## Complete Reset (Nuclear Option)

If nothing works, start fresh:

```bash
# 1. Stop all processes
# Press Ctrl+C in terminal

# 2. Clear all caches
rm -rf node_modules
rm -rf .expo
rm bun.lock

# 3. Reinstall
bun install

# 4. Clear storage
# Web: Clear browser localStorage
# Mobile: Uninstall app

# 5. Start fresh
npm start
```

## Getting Help

When asking for help, include:

1. **Platform**: Web, iOS, or Android?
2. **Error message**: Full error from console
3. **Console logs**: Copy logs with `[Calculator]`, `[Backend]` prefixes
4. **What you were doing**: Step-by-step reproduction
5. **Screenshots**: If visual bug

### Example Bug Report:
```
Platform: iOS Simulator
Error: "Failed to create vault"

Console output:
[Calculator] Checking vault initialization
[Setup] Error initializing vault: Error: No salt found

Steps to reproduce:
1. Open app
2. Select "Parent" role
3. Enter name and agree to terms  
4. Create PIN "1234"
5. Confirm PIN "1234"
6. Press "Create Vault"
7. Error appears

Screenshot: [attached]
```

---

Most issues can be solved by:
1. Restarting the dev server
2. Clearing app data
3. Checking console logs for specific errors
