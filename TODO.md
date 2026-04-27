# TODO - Full Phased Build (WebRTC + Remote Control + AI Automation)

## Phase 1 - Signaling Foundation
- [x] Create shared signaling message store module for WebRTC routes
- [x] Update `backend/trpc/routes/webrtc/signal/route.ts` to use shared store + robust schema
- [x] Update `backend/trpc/routes/webrtc/getSignals/route.ts` to read/clear from shared store
- [x] Register WebRTC routes in `backend/trpc/app-router.ts`

## Phase 2 - API Client + Service Integration
- [x] Extend `lib/api-client.ts` with typed `webrtc.signal()` and `webrtc.getSignals()`
- [x] Refactor `services/webrtc.ts` to use backend signaling endpoints instead of local AsyncStorage queue
- [ ] Add session helpers for offer/answer/ice and stream start/stop messaging

## Phase 3 - Child Live Capture + Background Scaffolding
- [ ] Add child-side stream session manager hooks in `app/child.tsx`
- [ ] Wire command-driven stream start/stop behavior for paired child flow
- [ ] Add lifecycle/background-safe scaffolding notes and guards

## Phase 4 - Parent Live Monitoring
- [ ] Wire parent request/start/stop stream controls in `app/parent.tsx` / live monitoring screen
- [ ] Render stream state and improve error/status handling

## Phase 5 - Android Remote Control (Scaffolding)
- [ ] Add Android Accessibility Service scaffolding (native files + manifest declarations)
- [ ] Add native bridge module stubs for remote actions
- [ ] Extend command model/types to include remote actions (tap/back/home/open_app/etc.)

## Phase 6 - AI Automation Scaffolding
- [ ] Add backend AI automation route scaffolding for queued action plans
- [ ] Add parent dashboard controls for dispatching AI automation requests
- [ ] Add explicit consent/safety toggles for automation actions

## Phase 7 - Validation
- [ ] Run lint/type checks and resolve issues
- [ ] Run targeted API verification (pairing/commands/webrtc)
- [ ] Summarize tested areas, remaining risk, and next release steps
