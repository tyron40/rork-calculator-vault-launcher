import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getGlobalStore } from '../../storage';

export const getChildCommandsProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
      since: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    try {
      const store = getGlobalStore();
      const commands = store.commandsStore.get(input.childDeviceId) || [];

      const filtered = input.since
        ? commands.filter((c) => new Date(c.timestamp).getTime() > new Date(input.since as string).getTime())
        : commands;

      return {
        success: true,
        commands: filtered,
      };
    } catch (error) {
      console.error('[Backend] Error in getChildCommands:', error);
      throw new Error('Failed to get child commands');
    }
  });
