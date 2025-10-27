import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const pairingStore = new Map<string, {
  code: string;
  deviceId: string;
  childName: string;
  timestamp: number;
  expiresAt: number;
}>();

export const pairDeviceProcedure = publicProcedure
  .input(z.object({
    code: z.string().min(6).max(6),
    parentDeviceId: z.string(),
    parentName: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Pairing device with code:', input.code);
    
    const pairing = pairingStore.get(input.code);
    
    if (!pairing) {
      throw new Error('Invalid pairing code');
    }
    
    if (Date.now() > pairing.expiresAt) {
      pairingStore.delete(input.code);
      throw new Error('Pairing code has expired');
    }
    
    pairingStore.delete(input.code);
    
    return {
      success: true,
      childDeviceId: pairing.deviceId,
      childName: pairing.childName,
      timestamp: new Date().toISOString(),
    };
  });

export const storePairingCodeProcedure = publicProcedure
  .input(z.object({
    code: z.string().min(6).max(6),
    deviceId: z.string(),
    childName: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Storing pairing code:', input.code);
    
    const expiresAt = Date.now() + (5 * 60 * 1000);
    
    pairingStore.set(input.code, {
      code: input.code,
      deviceId: input.deviceId,
      childName: input.childName,
      timestamp: Date.now(),
      expiresAt,
    });
    
    setTimeout(() => {
      pairingStore.delete(input.code);
      console.log('[tRPC] Pairing code expired:', input.code);
    }, 5 * 60 * 1000);
    
    return {
      success: true,
      code: input.code,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  });
