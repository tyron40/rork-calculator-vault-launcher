import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { pairingRpc } from '../database';

export const heartbeatProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      return await pairingRpc('record_child_heartbeat', {
        p_child_device_id: input.childDeviceId,
      });
    } catch (error) {
      console.error('[Backend] Error in heartbeat:', error);
      throw new Error('Failed to update heartbeat');
    }
  });
