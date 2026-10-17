import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { pairingRpc } from '../database';

export const generateCodeProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
      deviceName: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const code = randomBytes(6).toString('hex').toUpperCase();
      const deviceName = input.deviceName || 'Parent Device';
      const persisted = await pairingRpc<{ expiresAt: string; createdAt: string }>('create_pairing_code', {
        p_code: code,
        p_device_id: input.parentDeviceId,
        p_device_name: deviceName,
        p_device_type: 'parent',
      });

      const pairingData = {
        code,
        parentDeviceId: input.parentDeviceId,
        deviceName,
        expiresAt: persisted.expiresAt,
        createdAt: persisted.createdAt,
      };

      return pairingData;
    } catch (error) {
      console.error('[Backend] Error in generateCode:', error);
      throw new Error('Failed to generate pairing code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
