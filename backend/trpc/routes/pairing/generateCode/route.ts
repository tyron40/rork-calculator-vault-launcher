import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const generateCodeProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
      deviceName: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const pairingData = {
      code,
      parentDeviceId: input.parentDeviceId,
      deviceName: input.deviceName || 'Parent Device',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    console.log('[Backend] Generated pairing code:', code);
    
    return pairingData;
  });
