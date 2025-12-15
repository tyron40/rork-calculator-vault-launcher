import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { getGlobalStore, type PairedDevice } from '../../storage';

export const verifyCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string().length(6),
      parentDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Backend] Parent verifying pairing code:', input.code);
      
      const store = getGlobalStore();
      const pairing = store.pairingStore.get(input.code);
      
      if (!pairing) {
        throw new Error('Invalid or expired pairing code');
      }
      
      if (Date.now() > pairing.expiresAt) {
        store.pairingStore.delete(input.code);
        throw new Error('Pairing code has expired');
      }
      
      store.pairingStore.delete(input.code);
      
      if (pairing.deviceType !== 'child') {
        throw new Error('This code is not from a child device');
      }
      
      console.log('[Backend] Pairing successful - Parent paired with:', pairing.deviceName);
      
      const pairedDevice: PairedDevice = {
        id: `paired_${Date.now()}`,
        parentDeviceId: input.parentDeviceId,
        childDeviceId: pairing.deviceId,
        childName: pairing.deviceName,
        deviceName: pairing.deviceName,
        pairedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isOnline: true,
      };
      
      const existingDevices = store.pairedDevicesStore.get(input.parentDeviceId) || [];
      const updatedDevices = [...existingDevices, pairedDevice];
      store.pairedDevicesStore.set(input.parentDeviceId, updatedDevices);
      
      console.log('[Backend] Stored paired device. Total devices for parent:', updatedDevices.length);
      
      return {
        success: true,
        childDeviceId: pairing.deviceId,
        childName: pairing.deviceName,
        pairedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Backend] Error in verifyCode:', error);
      throw error;
    }
  });
