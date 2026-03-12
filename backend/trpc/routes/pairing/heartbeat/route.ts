import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getGlobalStore } from '../../storage';

export const heartbeatProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const store = getGlobalStore();
      const now = new Date().toISOString();

      for (const [parentId, devices] of store.pairedDevicesStore.entries()) {
        const updated = devices.map((device) =>
          device.childDeviceId === input.childDeviceId
            ? { ...device, lastSeen: now, isOnline: true }
            : device
        );
        store.pairedDevicesStore.set(parentId, updated);
      }

      return {
        success: true,
        childDeviceId: input.childDeviceId,
        lastSeen: now,
      };
    } catch (error) {
      console.error('[Backend] Error in heartbeat:', error);
      throw new Error('Failed to update heartbeat');
    }
  });
