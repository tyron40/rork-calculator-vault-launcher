import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

const signalingMessagesStore = new Map<string, any[]>();

export default publicProcedure
  .input(z.object({
    deviceId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      console.log('[WebRTC Signaling] Getting signals for device:', input.deviceId);

      const messages = signalingMessagesStore.get(input.deviceId) || [];
      
      signalingMessagesStore.delete(input.deviceId);

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
