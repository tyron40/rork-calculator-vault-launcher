import { publicProcedure } from '../../../create-context';
import { z } from 'zod';

const pairingCodes = new Map<string, {
  deviceId: string;
  childName: string;
  timestamp: number;
  expiresAt: number;
}>();

const pairedDevices = new Map<string, {
  parentDeviceId: string;
  childDeviceId: string;
  childName: string;
  deviceName: string;
  childPin: string;
  pairedAt: number;
}>();

const childPairingStatus = new Map<string, {
  paired: boolean;
  childPin: string;
  parentDeviceId: string;
}>();

export const pairDeviceProcedure = publicProcedure
  .input(z.object({
    pairingCode: z.string(),
    parentDeviceId: z.string(),
    childPin: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[Backend] Pairing device with code:', input.pairingCode);
    
    const pairingData = pairingCodes.get(input.pairingCode);
    
    if (!pairingData) {
      throw new Error('Invalid or expired pairing code');
    }
    
    if (Date.now() > pairingData.expiresAt) {
      pairingCodes.delete(input.pairingCode);
      throw new Error('Pairing code expired');
    }
    
    const deviceId = `paired_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    pairedDevices.set(deviceId, {
      parentDeviceId: input.parentDeviceId,
      childDeviceId: pairingData.deviceId,
      childName: pairingData.childName,
      deviceName: 'Child Device',
      childPin: input.childPin,
      pairedAt: Date.now(),
    });
    
    childPairingStatus.set(pairingData.deviceId, {
      paired: true,
      childPin: input.childPin,
      parentDeviceId: input.parentDeviceId,
    });
    
    pairingCodes.delete(input.pairingCode);
    
    console.log('[Backend] Device paired successfully:', deviceId);
    
    return {
      id: deviceId,
      name: 'Child Device',
      deviceId: pairingData.deviceId,
      childName: pairingData.childName,
      lastSeen: new Date().toISOString(),
      isOnline: true,
      monitoringActive: false,
    };
  });

export const generatePairingCodeProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
    childName: z.string(),
  }))
  .mutation(async ({ input }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    pairingCodes.set(code, {
      deviceId: input.deviceId,
      childName: input.childName,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    
    console.log('[Backend] Generated pairing code:', code);
    
    return {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  });

export const getParentDevicesProcedure = publicProcedure
  .input(z.object({
    childDeviceId: z.string(),
  }))
  .query(async ({ input }) => {
    const devices: typeof pairedDevices extends Map<string, infer T> ? T[] : never = [];
    
    pairedDevices.forEach((device, id) => {
      if (device.childDeviceId === input.childDeviceId) {
        devices.push(device);
      }
    });
    
    return devices;
  });

export const checkPairingStatusProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
  }))
  .query(async ({ input }) => {
    const status = childPairingStatus.get(input.deviceId);
    
    if (status) {
      return status;
    }
    
    return {
      paired: false,
      childPin: '',
      parentDeviceId: '',
    };
  });
