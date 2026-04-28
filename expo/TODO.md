# TODO - Render Production Critical Path Fix

## Plan-approved execution checklist

- [x] Gather production diagnostics from Render CLI (workspace/services/logs)
- [ ] Normalize tRPC request paths in `expo/backend/hono.ts` for `/trpc/*` and `/api/trpc/*`
- [ ] Align peer deps in `expo/package.json` (`react`/`react-dom` -> `19.2.1`)
- [ ] Commit and push fixes to `main`
- [ ] Trigger/confirm Render deploy for updated commit
- [ ] Re-test critical endpoints on hosted backend:
  - [ ] `GET /healthz`
  - [ ] `POST /api/trpc/pairing.generateCode`
  - [ ] `POST /api/trpc/pairing.pairDevice`
  - [ ] `GET /api/trpc/pairing.getPairedDevices`
  - [ ] `POST /api/trpc/pairing.heartbeat`
- [ ] Capture final pass/fail test summary
