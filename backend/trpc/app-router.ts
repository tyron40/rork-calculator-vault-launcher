import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { 
  pairDeviceProcedure, 
  generatePairingCodeProcedure,
  getParentDevicesProcedure,
  checkPairingStatusProcedure
} from "./routes/devices/pair/route";
import { 
  sendCommandProcedure, 
  getCommandsProcedure, 
  updateCommandStatusProcedure,
  getCommandResultProcedure 
} from "./routes/devices/commands/route";
import { 
  updateDeviceStatusProcedure, 
  getDeviceStatusProcedure,
  getMultipleDeviceStatusProcedure 
} from "./routes/devices/status/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  devices: createTRPCRouter({
    pair: pairDeviceProcedure,
    generatePairingCode: generatePairingCodeProcedure,
    getParentDevices: getParentDevicesProcedure,
    checkPairingStatus: checkPairingStatusProcedure,
    sendCommand: sendCommandProcedure,
    getCommands: getCommandsProcedure,
    updateCommandStatus: updateCommandStatusProcedure,
    getCommandResult: getCommandResultProcedure,
    updateStatus: updateDeviceStatusProcedure,
    getStatus: getDeviceStatusProcedure,
    getMultipleStatus: getMultipleDeviceStatusProcedure,
  }),
});

export type AppRouter = typeof appRouter;
