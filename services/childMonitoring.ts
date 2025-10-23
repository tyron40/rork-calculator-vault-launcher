import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { 
  getPendingCommands, 
  updateCommandStatus, 
  RemoteControlCommand,
  getDeviceLocation 
} from './remoteControl';
import { 
  startAudioStreaming, 
  stopAudioStreaming, 
  AudioStreamConfig 
} from './audioStreaming';
import { 
  startCameraMonitoring, 
  stopCameraMonitoring, 
  CameraMonitoringConfig 
} from './cameraMonitoring';

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

export async function startChildMonitoring(deviceId: string, parentDeviceId: string): Promise<void> {
  console.log('[ChildMonitoring] Starting monitoring for device:', deviceId);
  
  if (monitoringInterval) {
    console.log('[ChildMonitoring] Monitoring already running');
    return;
  }

  monitoringInterval = setInterval(async () => {
    await checkForCommands(deviceId, parentDeviceId);
  }, 3000);

  await AsyncStorage.setItem('child_monitoring_active', 'true');
  await AsyncStorage.setItem('child_monitoring_device_id', deviceId);
  await AsyncStorage.setItem('child_monitoring_parent_id', parentDeviceId);
  
  console.log('[ChildMonitoring] Monitoring started');
}

export async function stopChildMonitoring(): Promise<void> {
  console.log('[ChildMonitoring] Stopping monitoring');
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  await stopAudioStreaming();
  await stopCameraMonitoring();

  await AsyncStorage.setItem('child_monitoring_active', 'false');
  await AsyncStorage.removeItem('child_monitoring_device_id');
  await AsyncStorage.removeItem('child_monitoring_parent_id');
  
  console.log('[ChildMonitoring] Monitoring stopped');
}

async function checkForCommands(deviceId: string, parentDeviceId: string): Promise<void> {
  try {
    const pendingCommands = await getPendingCommands(deviceId);

    for (const command of pendingCommands) {
      await executeCommand(deviceId, parentDeviceId, command);
    }
  } catch (error) {
    console.error('[ChildMonitoring] Error checking commands:', error);
  }
}

async function executeCommand(
  deviceId: string, 
  parentDeviceId: string,
  command: RemoteControlCommand
): Promise<void> {
  console.log('[ChildMonitoring] Executing command:', command.type);
  
  try {
    await updateCommandStatus(deviceId, command.id, 'executing');

    switch (command.type) {
      case 'start_audio':
        await handleStartAudio(deviceId, parentDeviceId);
        break;
      
      case 'stop_audio':
        await handleStopAudio();
        break;
      
      case 'start_camera':
        await handleStartCamera(deviceId, parentDeviceId, command.payload);
        break;
      
      case 'stop_camera':
        await handleStopCamera();
        break;
      
      case 'screenshot':
        await handleScreenshot(deviceId);
        break;
      
      case 'get_location':
        await handleGetLocation(deviceId, command.id);
        break;
      
      case 'lock_device':
        await handleLockDevice();
        break;
      
      case 'unlock_device':
        await handleUnlockDevice();
        break;
      
      case 'vibrate':
        await handleVibrate(command.payload?.duration || 400);
        break;
      
      case 'send_notification':
        await handleSendNotification(command.payload);
        break;
      
      case 'get_device_info':
        await handleGetDeviceInfo(deviceId, command.id);
        break;
      
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }

    await updateCommandStatus(deviceId, command.id, 'completed');
  } catch (error) {
    console.error('[ChildMonitoring] Error executing command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateCommandStatus(deviceId, command.id, 'failed', undefined, errorMessage);
  }
}

async function handleStartAudio(deviceId: string, parentDeviceId: string): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Audio monitoring not supported on web');
  }

  const config: AudioStreamConfig = {
    deviceId,
    parentDeviceId,
    streamQuality: 'medium',
    chunkIntervalMs: 5000,
  };

  await startAudioStreaming(config);
  console.log('[ChildMonitoring] Audio streaming started');
}

async function handleStopAudio(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await stopAudioStreaming();
  console.log('[ChildMonitoring] Audio streaming stopped');
}

async function handleStartCamera(
  deviceId: string, 
  parentDeviceId: string,
  payload?: any
): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Camera monitoring not fully supported on web');
  }

  const config: CameraMonitoringConfig = {
    deviceId,
    parentDeviceId,
    cameraType: payload?.cameraType || 'front',
    captureIntervalMs: 5000,
    imageQuality: 0.7,
  };

  await startCameraMonitoring(config);
  console.log('[ChildMonitoring] Camera monitoring started');
}

async function handleStopCamera(): Promise<void> {
  await stopCameraMonitoring();
  console.log('[ChildMonitoring] Camera monitoring stopped');
}

async function handleScreenshot(deviceId: string): Promise<void> {
  console.log('[ChildMonitoring] Screenshot requested');
  throw new Error('Screenshot feature requires native module implementation');
}

async function handleGetLocation(deviceId: string, commandId: string): Promise<void> {
  console.log('[ChildMonitoring] Location requested');
  
  try {
    const location = await getDeviceLocation();
    await updateCommandStatus(deviceId, commandId, 'completed', location);
  } catch (error) {
    console.error('[ChildMonitoring] Error getting location:', error);
    throw error;
  }
}

async function handleLockDevice(): Promise<void> {
  console.log('[ChildMonitoring] Lock device requested');
  await AsyncStorage.setItem('device_locked_by_parent', 'true');
}

async function handleUnlockDevice(): Promise<void> {
  console.log('[ChildMonitoring] Unlock device requested');
  await AsyncStorage.setItem('device_locked_by_parent', 'false');
}

async function handleVibrate(duration: number): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[ChildMonitoring] Vibration not supported on web');
    return;
  }

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  console.log('[ChildMonitoring] Device vibrated');
}

async function handleSendNotification(payload?: any): Promise<void> {
  console.log('[ChildMonitoring] Send notification requested');
  
  if (payload?.title && payload?.message) {
    Alert.alert(payload.title, payload.message);
  }
}

async function handleGetDeviceInfo(deviceId: string, commandId: string): Promise<void> {
  console.log('[ChildMonitoring] Device info requested');
  
  const deviceInfo = {
    batteryLevel: 0.85,
    isCharging: false,
    networkType: 'wifi',
    storageAvailable: 5000000000,
    storageTotal: 128000000000,
    appVersion: '1.0.0',
    osVersion: Platform.Version.toString(),
    platform: Platform.OS,
  };
  
  await updateCommandStatus(deviceId, commandId, 'completed', deviceInfo);
}

export async function isMonitoringActive(): Promise<boolean> {
  try {
    const active = await AsyncStorage.getItem('child_monitoring_active');
    return active === 'true';
  } catch (error) {
    console.error('[ChildMonitoring] Error checking monitoring status:', error);
    return false;
  }
}

export async function getMonitoringDeviceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('child_monitoring_device_id');
  } catch (error) {
    console.error('[ChildMonitoring] Error getting monitoring device ID:', error);
    return null;
  }
}

export async function getMonitoringParentId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('child_monitoring_parent_id');
  } catch (error) {
    console.error('[ChildMonitoring] Error getting monitoring parent ID:', error);
    return null;
  }
}
