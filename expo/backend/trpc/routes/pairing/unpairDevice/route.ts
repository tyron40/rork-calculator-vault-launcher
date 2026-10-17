import { publicProcedure } from "../../../create-context";
import { pairingRpc } from '../database';
import { z } from "zod";

export const unpairDeviceProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
      parentDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await pairingRpc('unpair_device', {
      p_parent_device_id: input.parentDeviceId,
      p_child_device_id: input.childDeviceId,
    });
    return {
      success: true,
      message: 'Device unpaired successfully',
      unpairedAt: new Date().toISOString(),
    };
  });
