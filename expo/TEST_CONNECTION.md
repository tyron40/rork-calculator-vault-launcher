# Test Connection Guide

This guide helps you verify that your backend connection is working properly.

## Method 1: Browser Test (Fastest)

### Test Backend Health
Open your browser and navigate to:
```
https://your-deployed-url.vercel.app/api
```

Expected response:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

✅ If you see this → Backend is working!

---

## Method 2: Terminal Test

### Using curl
```bash
curl https://your-deployed-url.vercel.app/api
```

### Using our test script
```bash
bash scripts/test-backend.sh
```

---

## Method 3: Test from App

### Test tRPC Connection

Add this temporary code to any screen (e.g., `app/parent.tsx` or `app/child.tsx`):

```tsx
import { trpc } from '@/lib/trpc';

// Inside your component:
const hiQuery = trpc.example.hi.useQuery();

// Add this to your JSX:
{hiQuery.data && (
  <View>
    <Text>Backend Connected! ✅</Text>
    <Text>{hiQuery.data.message}</Text>
  </View>
)}

{hiQuery.error && (
  <View>
    <Text>Backend Error ❌</Text>
    <Text>{hiQuery.error.message}</Text>
  </View>
)}
```

If you see "Backend Connected!" → tRPC is working!

---

## Method 4: Check Console Logs

### In Expo Dev Tools Console

Look for these log messages:

✅ Good:
```
[Calculator] Access PIN loaded from storage
[Backend] Generated pairing code: ABCD12
```

❌ Bad:
```
No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL
Error: fetch failed
```

---

## Troubleshooting Connection Issues

### Problem: "No base url found"

**Cause**: Environment variable not loaded

**Solution**:
1. Verify `.env` exists in project root
2. Verify it contains: `EXPO_PUBLIC_RORK_API_BASE_URL=https://your-url.vercel.app`
3. Restart Expo completely:
   ```bash
   # Stop: Ctrl+C or Cmd+C
   # Clear: 
   rm -rf node_modules/.cache
   # Restart:
   bun start
   ```

---

### Problem: "Network request failed" or CORS error

**Cause**: Backend not deployed or incorrect URL

**Solution**:
1. Test backend in browser (Method 1 above)
2. If backend doesn't respond:
   ```bash
   vercel --prod
   ```
3. Update `.env` with new URL
4. Restart Expo

---

### Problem: Backend responds but tRPC errors

**Cause**: tRPC endpoint mismatch

**Solution**:
1. Check `lib/trpc.ts` endpoint matches: `${baseUrl}/api/trpc`
2. Check `backend/hono.ts` mounts tRPC at: `/trpc/*`
3. Verify routes in `backend/trpc/app-router.ts`

---

### Problem: Pairing code generation fails

**Cause**: tRPC mutation not working

**Solution**:
1. Check backend logs: `vercel logs`
2. Test the endpoint manually:
   ```bash
   curl -X POST https://your-url.vercel.app/api/trpc/pairing.generateCode \
     -H "Content-Type: application/json" \
     -d '{"parentDeviceId":"test123"}'
   ```
3. Check response for errors

---

## Connection Status Checklist

Use this checklist to verify each step:

- [ ] `.env` file exists with correct URL
- [ ] Expo restarted after creating `.env`
- [ ] Backend health endpoint returns 200 OK
- [ ] Backend health response has `"status":"ok"`
- [ ] Console shows no "No base url found" errors
- [ ] tRPC query returns data successfully
- [ ] Pairing code generation works
- [ ] Both devices can connect to backend

---

## Quick Commands Reference

```bash
# Check if backend is deployed
vercel ls

# View backend logs
vercel logs

# Redeploy backend
vercel --prod

# Test backend health
curl https://your-url.vercel.app/api

# Clear Expo cache and restart
rm -rf node_modules/.cache && bun start

# Test with script
bash scripts/test-backend.sh
```

---

## Expected Flow (All Working)

1. App starts → Loads `.env` → Gets backend URL
2. User completes consent → Calculator loads
3. User types `0000` → Redirects to role selection
4. User selects role → Creates PIN → Backend connection made
5. Child generates code → Backend stores code
6. Parent enters code → Backend verifies → Devices paired
7. Connection established → Real-time monitoring active

---

## Next Steps

Once all tests pass:
1. ✅ Mark this as complete
2. ✅ Test pairing flow end-to-end
3. ✅ Test monitoring features
4. ✅ Deploy to TestFlight/Play Store (optional)
