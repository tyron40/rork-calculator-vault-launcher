import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generateCodeProcedure } from "./routes/pairing/generateCode/route";
import { verifyCodeProcedure } from "./routes/pairing/verifyCode/route";
import { getPairedDevicesProcedure } from "./routes/pairing/getPairedDevices/route";
import { unpairDeviceProcedure } from "./routes/pairing/unpairDevice/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  pairing: createTRPCRouter({
    generateCode: generateCodeProcedure,
    verifyCode: verifyCodeProcedure,
    getPairedDevices: getPairedDevicesProcedure,
    unpairDevice: unpairDeviceProcedure,
  }),
});

export type AppRouter = typeof appRouter;
