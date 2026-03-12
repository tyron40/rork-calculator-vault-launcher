import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getGlobalStore, type RemoteCommand } from '../../storage';

export const createCommandProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
      childDeviceId: z.string(),
      type: z.enum(['screenshot', 'start_audio', 'stop_audio', 'get_location', 'lock_device']),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const store = getGlobalStore();
      const command: RemoteCommand = {
        id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        parentDeviceId: input.parentDeviceId,
        childDeviceId: input.childDeviceId,
        type: input.type,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      const existingCommands = store.commandsStore.get(input.childDeviceId) || [];
      const updatedCommands = [...existingCommands, command];
      store.commandsStore.set(input.childDeviceId, updatedCommands);

      return {
        success: true,
        command,
      };
    } catch (error) {
      console.error('[Backend] Error in createCommand:', error);
      throw new Error('Failed to create command');
    }
  });
