import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { getGlobalStore } from '../../storage';

export const generateCodeProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
      deviceName: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAtTimestamp = Date.now() + 5 * 60 * 1000;
      
      const store = getGlobalStore();
      
      store.pairingStore.set(code, {
        code,
        deviceId: input.parentDeviceId,
        deviceName: input.deviceName || 'Parent Device',
        deviceType: 'parent',
        timestamp: Date.now(),
        expiresAt: expiresAtTimestamp,
      });
      
      setTimeout(() => {
        store.pairingStore.delete(code);
        console.log('[Backend] Parent pairing code expired:', code);
      }, 5 * 60 * 1000);
      
      const pairingData = {
        code,
        parentDeviceId: input.parentDeviceId,
        deviceName: input.deviceName || 'Parent Device',
        expiresAt: new Date(expiresAtTimestamp).toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      console.log('[Backend] Generated parent pairing code:', code);
      console.log('[Backend] Store size:', store.pairingStore.size);
      
      return pairingData;
    } catch (error) {
      console.error('[Backend] Error in generateCode:', error);
      throw new Error('Failed to generate pairing code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
