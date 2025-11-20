import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { pairingStore, pairedDevicesStore, PairedDevice } from '../verifyCode/route';

export const pairDeviceProcedure = publicProcedure
  .input(z.object({
    code: z.string().min(6).max(6),
    childDeviceId: z.string(),
    childName: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Child pairing with parent code:', input.code);
    
    const pairing = pairingStore.get(input.code);
    
    if (!pairing) {
      throw new Error('Invalid or expired pairing code');
    }
    
    if (Date.now() > pairing.expiresAt) {
      pairingStore.delete(input.code);
      throw new Error('Pairing code has expired');
    }
    
    pairingStore.delete(input.code);
    
    if (pairing.deviceType !== 'parent') {
      throw new Error('This code is not from a parent device');
    }
    
    console.log('[tRPC] Pairing successful - Child paired with:', pairing.deviceName);
    
    const pairedDevice: PairedDevice = {
      id: `paired_${Date.now()}`,
      parentDeviceId: pairing.deviceId,
      childDeviceId: input.childDeviceId,
      childName: input.childName,
      deviceName: input.childName,
      pairedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isOnline: true,
    };
    
    const existingDevices = pairedDevicesStore.get(pairing.deviceId) || [];
    const updatedDevices = [...existingDevices, pairedDevice];
    pairedDevicesStore.set(pairing.deviceId, updatedDevices);
    
    console.log('[tRPC] Stored paired device. Total devices for parent:', updatedDevices.length);
    
    return {
      success: true,
      parentDeviceId: pairing.deviceId,
      parentDeviceName: pairing.deviceName,
      timestamp: new Date().toISOString(),
    };
  });

export const storePairingCodeProcedure = publicProcedure
  .input(z.object({
    code: z.string().min(6).max(6),
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: z.enum(['parent', 'child']),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Storing pairing code for', input.deviceType, ':', input.code);
    
    const expiresAt = Date.now() + (5 * 60 * 1000);
    
    pairingStore.set(input.code, {
      code: input.code,
      deviceId: input.deviceId,
      deviceName: input.deviceName,
      deviceType: input.deviceType,
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
