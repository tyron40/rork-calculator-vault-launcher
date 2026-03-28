import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getGlobalStore } from '../../storage';

export const getParentCommandHistoryProcedure = publicProcedure
  .input(
    z.object({
      parentDeviceId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      const store = getGlobalStore();
      const allCommands = Array.from(store.commandsStore.values()).flat();
      const parentCommands = allCommands
        .filter((cmd) => cmd.parentDeviceId === input.parentDeviceId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        success: true,
        commands: parentCommands,
      };
    } catch (error) {
      console.error('[Backend] Error in getParentCommandHistory:', error);
      throw new Error('Failed to get parent command history');
    }
  });
