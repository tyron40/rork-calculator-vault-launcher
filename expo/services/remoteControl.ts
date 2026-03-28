import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export type RemoteCommandType = 
  | 'screenshot' 
  | 'start_audio' 
  | 'stop_audio' 
  | 'start_camera'
  | 'stop_camera'
  | 'get_location' 
  | 'lock_device'
  | 'unlock_device'
  | 'screen_on'
  | 'screen_off'
  | 'volume_up'
  | 'volume_down'
  | 'vibrate'
  | 'send_notification'
  | 'get_device_info'
  | 'clear_cache';

export interface RemoteControlCommand {
  id: string;
  type: RemoteCommandType;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  payload?: any;
}

export interface DeviceInfo {
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  storageAvailable: number;
  storageTotal: number;
  appVersion: string;
  osVersion: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  timestamp: string;
}

export async function sendRemoteCommand(
  deviceId: string,
  command: RemoteControlCommand
): Promise<void> {
  try {
    console.log('[RemoteControl] Sending command:', command.type);
    const commands = await getDeviceCommands(deviceId);
    commands.push(command);
    await AsyncStorage.setItem(`remote_commands_${deviceId}`, JSON.stringify(commands));
  } catch (error) {
    console.error('[RemoteControl] Error sending command:', error);
    throw error;
  }
}

export async function getDeviceCommands(deviceId: string): Promise<RemoteControlCommand[]> {
  try {
    const stored = await AsyncStorage.getItem(`remote_commands_${deviceId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[RemoteControl] Error getting commands:', error);
    return [];
  }
}

export async function updateCommandStatus(
  deviceId: string,
  commandId: string,
  status: RemoteControlCommand['status'],
  result?: any,
  error?: string
): Promise<void> {
  try {
    const commands = await getDeviceCommands(deviceId);
    const commandIndex = commands.findIndex(c => c.id === commandId);
    if (commandIndex >= 0) {
      commands[commandIndex].status = status;
      if (result !== undefined) commands[commandIndex].result = result;
      if (error) commands[commandIndex].error = error;
      await AsyncStorage.setItem(`remote_commands_${deviceId}`, JSON.stringify(commands));
    }
  } catch (error) {
    console.error('[RemoteControl] Error updating command status:', error);
    throw error;
  }
}

export async function createScreenshotCommand(): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'screenshot',
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
}

export async function createAudioCommand(action: 'start' | 'stop'): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: action === 'start' ? 'start_audio' : 'stop_audio',
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
}

export async function createCameraCommand(
  action: 'start' | 'stop',
  cameraType: 'front' | 'back' = 'front'
): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: action === 'start' ? 'start_camera' : 'stop_camera',
    timestamp: new Date().toISOString(),
    status: 'pending',
    payload: { cameraType },
  };
}

export async function createLocationCommand(): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'get_location',
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
}

export async function createLockCommand(action: 'lock' | 'unlock'): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: action === 'lock' ? 'lock_device' : 'unlock_device',
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
}

export async function createVibrateCommand(duration: number = 400): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'vibrate',
    timestamp: new Date().toISOString(),
    status: 'pending',
    payload: { duration },
  };
}

export async function createNotificationCommand(
  title: string,
  message: string
): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'send_notification',
    timestamp: new Date().toISOString(),
    status: 'pending',
    payload: { title, message },
  };
}

export async function createDeviceInfoCommand(): Promise<RemoteControlCommand> {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'get_device_info',
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
}

export async function getDeviceLocation(): Promise<LocationData> {
  if (Platform.OS === 'web') {
    throw new Error('Location not supported on web');
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy || 0,
    altitude: location.coords.altitude,
    timestamp: new Date(location.timestamp).toISOString(),
  };
}

export async function clearDeviceCommands(deviceId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`remote_commands_${deviceId}`);
  } catch (error) {
    console.error('[RemoteControl] Error clearing commands:', error);
  }
}

export async function getPendingCommands(deviceId: string): Promise<RemoteControlCommand[]> {
  try {
    const commands = await getDeviceCommands(deviceId);
    return commands.filter(cmd => cmd.status === 'pending');
  } catch (error) {
    console.error('[RemoteControl] Error getting pending commands:', error);
    return [];
  }
}

export async function getCompletedCommands(deviceId: string): Promise<RemoteControlCommand[]> {
  try {
    const commands = await getDeviceCommands(deviceId);
    return commands.filter(cmd => cmd.status === 'completed');
  } catch (error) {
    console.error('[RemoteControl] Error getting completed commands:', error);
    return [];
  }
}

export async function getFailedCommands(deviceId: string): Promise<RemoteControlCommand[]> {
  try {
    const commands = await getDeviceCommands(deviceId);
    return commands.filter(cmd => cmd.status === 'failed');
  } catch (error) {
    console.error('[RemoteControl] Error getting failed commands:', error);
    return [];
  }
}
