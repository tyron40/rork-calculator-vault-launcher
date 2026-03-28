import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { getGlobalStore } from '../../storage';

export const getPairedDevicesProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('[Backend] Getting paired devices for:', input.parentDeviceId);
      
      const store = getGlobalStore();
      const devices = store.pairedDevicesStore.get(input.parentDeviceId) || [];
      
      console.log('[Backend] Found devices:', devices.length);
      
      return {
        devices,
        total: devices.length,
      };
    } catch (error) {
      console.error('[Backend] Error in getPairedDevices:', error);
      throw new Error('Failed to get paired devices: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
