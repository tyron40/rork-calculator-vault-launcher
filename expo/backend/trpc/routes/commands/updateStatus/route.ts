import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getGlobalStore } from '../../storage';

export const updateCommandStatusProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
      commandId: z.string(),
      status: z.enum(['pending', 'executing', 'completed', 'failed']),
      result: z.string().optional(),
      error: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const store = getGlobalStore();
      const commands = store.commandsStore.get(input.childDeviceId) || [];
      const index = commands.findIndex((c) => c.id === input.commandId);

      if (index < 0) {
        throw new Error('Command not found');
      }

      const existing = commands[index];
      commands[index] = {
        ...existing,
        status: input.status,
        result: input.result ?? existing.result,
        error: input.error ?? existing.error,
      };

      store.commandsStore.set(input.childDeviceId, [...commands]);

      return {
        success: true,
        command: commands[index],
      };
    } catch (error) {
      console.error('[Backend] Error in updateCommandStatus:', error);
      throw error;
    }
  });
