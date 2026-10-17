import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { pairingRpc } from '../database';

export const getPairedDevicesProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      const devices = await pairingRpc<Record<string, unknown>[]>('get_paired_devices', {
        p_parent_device_id: input.parentDeviceId,
      });

      return {
        devices,
        total: devices.length,
      };
    } catch (error) {
      console.error('[Backend] Error in getPairedDevices:', error);
      throw new Error('Failed to get paired devices: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
