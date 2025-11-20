import { publicProcedure } from "../../../create-context";
import { z } from "zod";

type PairingData = {
  code: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'parent' | 'child';
  timestamp: number;
  expiresAt: number;
};

const pairingStore = new Map<string, PairingData>();

export const verifyCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string().length(6),
      parentDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Backend] Parent verifying pairing code:', input.code);
    
    const pairing = pairingStore.get(input.code);
    
    if (!pairing) {
      throw new Error('Invalid or expired pairing code');
    }
    
    if (Date.now() > pairing.expiresAt) {
      pairingStore.delete(input.code);
      throw new Error('Pairing code has expired');
    }
    
    pairingStore.delete(input.code);
    
    if (pairing.deviceType !== 'child') {
      throw new Error('This code is not from a child device');
    }
    
    console.log('[Backend] Pairing successful - Parent paired with:', pairing.deviceName);
    
    return {
      success: true,
      childDeviceId: pairing.deviceId,
      childName: pairing.deviceName,
      pairedAt: new Date().toISOString(),
    };
  });

export { pairingStore }
export type { PairingData }
