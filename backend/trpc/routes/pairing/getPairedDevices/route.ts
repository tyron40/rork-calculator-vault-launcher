import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const getPairedDevicesProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Backend] Getting paired devices for:', input.parentDeviceId);
    
    return {
      devices: [],
      total: 0,
    };
  });
