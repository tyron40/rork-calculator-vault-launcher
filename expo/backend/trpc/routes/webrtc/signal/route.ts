import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';
import { enqueueSignal } from '../store';

const signalingMessageSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(['offer', 'answer', 'ice-candidate', 'stream-request', 'stream-stop']),
  from: z.string().min(1),
  to: z.string().min(1),
  data: z.unknown().optional(),
  timestamp: z.string().datetime().optional(),
});

export default publicProcedure
  .input(signalingMessageSchema)
  .mutation(async ({ input }) => {
    try {
      const message = {
        ...input,
        timestamp: input.timestamp ?? new Date().toISOString(),
      };

      console.log(
        '[WebRTC Signaling] Received message:',
        message.type,
        'session:',
        message.sessionId,
        'from:',
        message.from,
        'to:',
        message.to
      );

      enqueueSignal(message);

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
