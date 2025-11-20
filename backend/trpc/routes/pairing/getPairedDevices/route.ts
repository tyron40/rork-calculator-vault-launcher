import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { pairedDevicesStore } from '../verifyCode/route';

export const getPairedDevicesProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Backend] Getting paired devices for:', input.parentDeviceId);
    
    const devices = pairedDevicesStore.get(input.parentDeviceId) || [];
    
    console.log('[Backend] Found devices:', devices.length);
    
    return {
      devices,
      total: devices.length,
    };
  });
