import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const verifyCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string().length(6),
      childDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Backend] Verifying pairing code:', input.code);
    
    const parentDeviceId = `parent_${input.code}_verified`;
    
    const pairingResult = {
      success: true,
      parentDeviceId,
      parentDeviceName: 'Parent Device',
      pairedAt: new Date().toISOString(),
      childDeviceId: input.childDeviceId,
    };
    
    console.log('[Backend] Pairing successful');
    
    return pairingResult;
  });
