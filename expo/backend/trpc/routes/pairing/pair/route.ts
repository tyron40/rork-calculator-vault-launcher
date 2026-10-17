import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { pairingRpc } from '../database';

export const pairDeviceProcedure = publicProcedure
  .input(z.object({
    code: z.string().length(12),
    childDeviceId: z.string(),
    childName: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      return await pairingRpc('pair_child_with_parent_code', {
        p_code: input.code.toUpperCase(),
        p_child_device_id: input.childDeviceId,
        p_child_name: input.childName,
      });
    } catch (error) {
      console.error('[tRPC] Error in pairDevice:', error);
      throw error;
    }
  });

export const storePairingCodeProcedure = publicProcedure
  .input(z.object({
    code: z.string().min(6).max(6),
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: z.enum(['parent', 'child']),
  }))
  .mutation(async ({ input }) => {
    try {
      const persisted = await pairingRpc<{ expiresAt: string }>('create_pairing_code', {
        p_code: input.code.toUpperCase(),
        p_device_id: input.deviceId,
        p_device_name: input.deviceName,
        p_device_type: input.deviceType,
      });

      return {
        success: true,
        code: input.code.toUpperCase(),
        expiresAt: persisted.expiresAt,
      };
    } catch (error) {
      console.error('[tRPC] Error in storePairingCode:', error);
      throw new Error('Failed to store pairing code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
