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

type PairedDevice = {
  id: string;
  parentDeviceId: string;
  childDeviceId: string;
  childName: string;
  deviceName: string;
  pairedAt: string;
  lastSeen: string;
  isOnline: boolean;
};

const pairingStore = new Map<string, PairingData>();
const pairedDevicesStore = new Map<string, PairedDevice[]>();

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
    
    const existingDevices = pairedDevicesStore.get(input.parentDeviceId) || [];
    const updatedDevices = [...existingDevices, pairedDevice];
    pairedDevicesStore.set(input.parentDeviceId, updatedDevices);
    
    console.log('[Backend] Stored paired device. Total devices for parent:', updatedDevices.length);
    
    return {
      success: true,
      childDeviceId: pairing.deviceId,
      childName: pairing.deviceName,
      pairedAt: new Date().toISOString(),
    };
  });

export { pairingStore, pairedDevicesStore }
export type { PairingData, PairedDevice }
