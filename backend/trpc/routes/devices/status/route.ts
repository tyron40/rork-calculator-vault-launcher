import { publicProcedure } from '../../../create-context';
import { z } from 'zod';

interface DeviceStatus {
  deviceId: string;
  lastSeen: string;
  isOnline: boolean;
  batteryLevel?: number;
  screenOn?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

const deviceStatuses = new Map<string, DeviceStatus>();

export const updateDeviceStatusProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
    batteryLevel: z.number().optional(),
    screenOn: z.boolean().optional(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[Backend] Updating device status for:', input.deviceId);
    
    const existingStatus = deviceStatuses.get(input.deviceId);
    
    const status: DeviceStatus = {
      deviceId: input.deviceId,
      lastSeen: new Date().toISOString(),
      isOnline: true,
      batteryLevel: input.batteryLevel ?? existingStatus?.batteryLevel,
      screenOn: input.screenOn ?? existingStatus?.screenOn,
      location: input.location ?? existingStatus?.location,
    };
    
    deviceStatuses.set(input.deviceId, status);
    
    return status;
  });

export const getDeviceStatusProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
  }))
  .query(async ({ input }) => {
    const status = deviceStatuses.get(input.deviceId);
    
    if (!status) {
      return {
        deviceId: input.deviceId,
        lastSeen: new Date().toISOString(),
        isOnline: false,
      };
    }
    
    const lastSeenTime = new Date(status.lastSeen).getTime();
    const isOnline = Date.now() - lastSeenTime < 30000;
    
    return {
      ...status,
      isOnline,
    };
  });

export const getMultipleDeviceStatusProcedure = publicProcedure
  .input(z.object({
    deviceIds: z.array(z.string()),
  }))
  .query(async ({ input }) => {
    const statuses: DeviceStatus[] = [];
    
    for (const deviceId of input.deviceIds) {
      const status = deviceStatuses.get(deviceId);
      
      if (status) {
        const lastSeenTime = new Date(status.lastSeen).getTime();
        const isOnline = Date.now() - lastSeenTime < 30000;
        
        statuses.push({
          ...status,
          isOnline,
        });
      } else {
        statuses.push({
          deviceId,
          lastSeen: new Date().toISOString(),
          isOnline: false,
        });
      }
    }
    
    return statuses;
  });
