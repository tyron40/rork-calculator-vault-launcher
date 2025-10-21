import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { ConnectedDevice, UserRole } from '@/store/vaultStore';

export interface PairingRequest {
  deviceId: string;
  deviceName: string;
  childName: string;
  timestamp: string;
}

export interface ConnectionConfig {
  userRole: UserRole;
  parentPin: string | null;
  childPin: string | null;
  deviceId: string;
  deviceName: string;
}

export async function generateDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('[Connection] Error generating device ID:', error);
    return `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

export async function getDeviceName(): Promise<string> {
  try {
    const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
    return deviceName;
  } catch (error) {
    console.error('[Connection] Error getting device name:', error);
    return 'Unknown Device';
  }
}

export async function saveConnectionConfig(config: ConnectionConfig): Promise<void> {
  try {
    console.log('[Connection] Saving connection config for role:', config.userRole);
    await AsyncStorage.setItem('connection_config', JSON.stringify(config));
  } catch (error) {
    console.error('[Connection] Error saving connection config:', error);
    throw error;
  }
}

export async function getConnectionConfig(): Promise<ConnectionConfig | null> {
  try {
    const stored = await AsyncStorage.getItem('connection_config');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[Connection] Error getting connection config:', error);
    return null;
  }
}

export async function saveConnectedDevices(devices: ConnectedDevice[]): Promise<void> {
  try {
    console.log('[Connection] Saving connected devices:', devices.length);
    await AsyncStorage.setItem('connected_devices', JSON.stringify(devices));
  } catch (error) {
    console.error('[Connection] Error saving connected devices:', error);
    throw error;
  }
}

export async function getConnectedDevices(): Promise<ConnectedDevice[]> {
  try {
    const stored = await AsyncStorage.getItem('connected_devices');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Connection] Error getting connected devices:', error);
    return [];
  }
}

export async function generatePairingCode(): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return code;
}

export async function savePairingCode(code: string, deviceId: string, childName: string): Promise<void> {
  try {
    const pairingData = {
      code,
      deviceId,
      childName,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    await AsyncStorage.setItem('pairing_code', JSON.stringify(pairingData));
    console.log('[Connection] Pairing code saved:', code);
  } catch (error) {
    console.error('[Connection] Error saving pairing code:', error);
    throw error;
  }
}

export async function getPairingCode(): Promise<{
  code: string;
  deviceId: string;
  childName: string;
  timestamp: string;
  expiresAt: string;
} | null> {
  try {
    const stored = await AsyncStorage.getItem('pairing_code');
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    if (new Date(data.expiresAt) < new Date()) {
      await AsyncStorage.removeItem('pairing_code');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Connection] Error getting pairing code:', error);
    return null;
  }
}

export async function saveParentDeviceId(parentDeviceId: string): Promise<void> {
  try {
    console.log('[Connection] Saving parent device ID');
    await AsyncStorage.setItem('parent_device_id', parentDeviceId);
  } catch (error) {
    console.error('[Connection] Error saving parent device ID:', error);
    throw error;
  }
}

export async function getParentDeviceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('parent_device_id');
  } catch (error) {
    console.error('[Connection] Error getting parent device ID:', error);
    return null;
  }
}

export interface RemoteCommand {
  id: string;
  type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device';
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export async function sendCommandToChild(deviceId: string, command: RemoteCommand): Promise<void> {
  try {
    console.log('[Connection] Sending command to child:', command.type);
    const commands = await getRemoteCommands(deviceId);
    commands.push(command);
    await AsyncStorage.setItem(`remote_commands_${deviceId}`, JSON.stringify(commands));
  } catch (error) {
    console.error('[Connection] Error sending command:', error);
    throw error;
  }
}

export async function getRemoteCommands(deviceId: string): Promise<RemoteCommand[]> {
  try {
    const stored = await AsyncStorage.getItem(`remote_commands_${deviceId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Connection] Error getting remote commands:', error);
    return [];
  }
}

export async function updateCommandStatus(
  deviceId: string, 
  commandId: string, 
  status: RemoteCommand['status'],
  result?: string,
  error?: string
): Promise<void> {
  try {
    const commands = await getRemoteCommands(deviceId);
    const commandIndex = commands.findIndex(c => c.id === commandId);
    if (commandIndex >= 0) {
      commands[commandIndex].status = status;
      if (result) commands[commandIndex].result = result;
      if (error) commands[commandIndex].error = error;
      await AsyncStorage.setItem(`remote_commands_${deviceId}`, JSON.stringify(commands));
    }
  } catch (error) {
    console.error('[Connection] Error updating command status:', error);
    throw error;
  }
}
