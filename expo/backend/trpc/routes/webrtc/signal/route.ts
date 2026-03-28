import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

const signalingMessageSchema = z.object({
  type: z.enum(['offer', 'answer', 'ice-candidate', 'stream-request', 'stream-stop']),
  from: z.string(),
  to: z.string(),
  data: z.any().optional(),
  timestamp: z.string(),
});

const signalingMessagesStore = new Map<string, any[]>();

export default publicProcedure
  .input(signalingMessageSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[WebRTC Signaling] Received message:', input.type, 'from:', input.from, 'to:', input.to);

      const key = input.to;
      const messages = signalingMessagesStore.get(key) || [];
      messages.push(input);
      
      if (messages.length > 100) {
        messages.shift();
      }
      
      signalingMessagesStore.set(key, messages);

      return {
        success: true,
        message: 'Signal sent successfully',
      };
    } catch (error) {
      console.error('[WebRTC Signaling] Error sending signal:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send signal',
      });
    }
  });
