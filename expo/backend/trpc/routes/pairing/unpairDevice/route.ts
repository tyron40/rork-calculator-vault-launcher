import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const unpairDeviceProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
      parentDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Backend] Unpairing device:', input.childDeviceId);
    
    return {
      success: true,
      message: 'Device unpaired successfully',
      unpairedAt: new Date().toISOString(),
    };
  });
