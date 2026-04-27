import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generateCodeProcedure } from "./routes/pairing/generateCode/route";
import { verifyCodeProcedure } from "./routes/pairing/verifyCode/route";
import { getPairedDevicesProcedure } from "./routes/pairing/getPairedDevices/route";
import { unpairDeviceProcedure } from "./routes/pairing/unpairDevice/route";
import { pairDeviceProcedure, storePairingCodeProcedure } from "./routes/pairing/pair/route";
import { heartbeatProcedure } from "./routes/pairing/heartbeat/route";
import { createCommandProcedure } from "./routes/commands/create/route";
import { getChildCommandsProcedure } from "./routes/commands/getChildCommands/route";
import { updateCommandStatusProcedure } from "./routes/commands/updateStatus/route";
import { getParentCommandHistoryProcedure } from "./routes/commands/getParentHistory/route";
import webrtcSignalProcedure from "./routes/webrtc/signal/route";
import webrtcGetSignalsProcedure from "./routes/webrtc/getSignals/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  pairing: createTRPCRouter({
    generateCode: generateCodeProcedure,
    verifyCode: verifyCodeProcedure,
    getPairedDevices: getPairedDevicesProcedure,
    unpairDevice: unpairDeviceProcedure,
    pairDevice: pairDeviceProcedure,
    storePairingCode: storePairingCodeProcedure,
    heartbeat: heartbeatProcedure,
  }),
  commands: createTRPCRouter({
    create: createCommandProcedure,
    getChildCommands: getChildCommandsProcedure,
    updateStatus: updateCommandStatusProcedure,
    getParentHistory: getParentCommandHistoryProcedure,
  }),
  webrtc: createTRPCRouter({
    signal: webrtcSignalProcedure,
    getSignals: webrtcGetSignalsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
