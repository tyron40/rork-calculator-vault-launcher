import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';
import { dequeueSignalsForDevice } from '../store';

export default publicProcedure
  .input(
    z.object({
      deviceId: z.string().min(1),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('[WebRTC Signaling] Getting signals for device:', input.deviceId);
      const messages = dequeueSignalsForDevice(input.deviceId);

      return {
        messages,
      };
    } catch (error) {
      console.error('[WebRTC Signaling] Error getting signals:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get signals',
      });
    }
  });
