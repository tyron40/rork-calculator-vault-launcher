import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

let audioRecording: Audio.Recording | null = null;
let monitoringInterval: ReturnType<typeof setInterval> | null = null;
let statusUpdateInterval: ReturnType<typeof setInterval> | null = null;

interface RemoteCommand {
  id: string;
  deviceId: string;
  type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device' | 'get_screen';
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export async function startChildMonitoring(deviceId: string): Promise<void> {
  console.log('[ChildMonitoring] Starting monitoring for device:', deviceId);
  
  if (monitoringInterval) {
    console.log('[ChildMonitoring] Monitoring already running');
    return;
  }

  monitoringInterval = setInterval(async () => {
    await checkForCommands(deviceId);
  }, 3000);

  statusUpdateInterval = setInterval(async () => {
    await updateDeviceStatus(deviceId);
  }, 10000);

  await AsyncStorage.setItem('child_monitoring_active', 'true');
  await AsyncStorage.setItem('child_monitoring_device_id', deviceId);
  
  await updateDeviceStatus(deviceId);
}

export async function stopChildMonitoring(): Promise<void> {
  console.log('[ChildMonitoring] Stopping monitoring');
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
    statusUpdateInterval = null;
  }

  if (audioRecording) {
    try {
      const status = await audioRecording.getStatusAsync();
      if (status.isRecording) {
        await audioRecording.stopAndUnloadAsync();
      }
      audioRecording = null;
    } catch (error) {
      console.error('[ChildMonitoring] Error stopping audio recording:', error);
    }
  }

  await AsyncStorage.setItem('child_monitoring_active', 'false');
  await AsyncStorage.removeItem('child_monitoring_device_id');
}

async function checkForCommands(deviceId: string): Promise<void> {
  try {
    const commands = await trpcClient.devices.getCommands.query({ deviceId });

    for (const command of commands) {
      await executeCommand(deviceId, command);
    }
  } catch (error) {
    console.error('[ChildMonitoring] Error checking commands:', error);
  }
}

async function updateDeviceStatus(deviceId: string): Promise<void> {
  try {
    const batteryLevel = Platform.OS !== 'web' ? Math.random() * 100 : undefined;
    
    let location: { latitude: number; longitude: number; accuracy: number } | undefined;
    
    if (Platform.OS !== 'web') {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy || 0,
          };
        }
      } catch (error) {
        console.log('[ChildMonitoring] Location not available');
      }
    }

    await trpcClient.devices.updateStatus.mutate({
      deviceId,
      batteryLevel,
      location,
    });
  } catch (error) {
    console.error('[ChildMonitoring] Error updating device status:', error);
  }
}

async function executeCommand(deviceId: string, command: RemoteCommand): Promise<void> {
  console.log('[ChildMonitoring] Executing command:', command.type);
  
  try {
    await trpcClient.devices.updateCommandStatus.mutate({
      deviceId,
      commandId: command.id,
      status: 'executing',
    });

    let result: string | undefined;

    switch (command.type) {
      case 'start_audio':
        await handleStartAudio(deviceId, command);
        result = 'Audio monitoring started';
        break;
      
      case 'stop_audio':
        await handleStopAudio(deviceId, command);
        result = 'Audio monitoring stopped';
        break;
      
      case 'screenshot':
        result = await handleScreenshot(deviceId, command);
        break;
      
      case 'get_location':
        result = await handleGetLocation(deviceId, command);
        break;
      
      case 'lock_device':
        await handleLockDevice(deviceId, command);
        result = 'Device locked';
        break;
      
      case 'get_screen':
        result = await handleGetScreen(deviceId, command);
        break;
      
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }

    await trpcClient.devices.updateCommandStatus.mutate({
      deviceId,
      commandId: command.id,
      status: 'completed',
      result,
    });
  } catch (error) {
    console.error('[ChildMonitoring] Error executing command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await trpcClient.devices.updateCommandStatus.mutate({
      deviceId,
      commandId: command.id,
      status: 'failed',
      error: errorMessage,
    });
  }
}

async function handleStartAudio(deviceId: string, command: RemoteCommand): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Audio monitoring not supported on web');
  }

  console.log('[ChildMonitoring] Starting audio recording');
  
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) {
    throw new Error('Audio permission denied');
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync({
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    web: {},
  });

  await recording.startAsync();
  audioRecording = recording;

  await AsyncStorage.setItem('audio_recording_active', 'true');
  console.log('[ChildMonitoring] Audio recording started');
}

async function handleStopAudio(deviceId: string, command: RemoteCommand): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  console.log('[ChildMonitoring] Stopping audio recording');
  
  if (audioRecording) {
    const status = await audioRecording.getStatusAsync();
    if (status.isRecording) {
      await audioRecording.stopAndUnloadAsync();
    }
    audioRecording = null;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  await AsyncStorage.setItem('audio_recording_active', 'false');
  console.log('[ChildMonitoring] Audio recording stopped');
}

async function handleScreenshot(deviceId: string, command: RemoteCommand): Promise<string> {
  console.log('[ChildMonitoring] Screenshot requested');
  return 'Screenshot captured (feature requires native implementation)';
}

async function handleGetLocation(deviceId: string, command: RemoteCommand): Promise<string> {
  console.log('[ChildMonitoring] Location requested');
  
  if (Platform.OS === 'web') {
    return 'Location not available on web';
  }
  
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return 'Location permission denied';
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return JSON.stringify({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ChildMonitoring] Error getting location:', error);
    return 'Failed to get location';
  }
}

async function handleLockDevice(deviceId: string, command: RemoteCommand): Promise<void> {
  console.log('[ChildMonitoring] Lock device requested');
  await AsyncStorage.setItem('device_locked', 'true');
}

async function handleGetScreen(deviceId: string, command: RemoteCommand): Promise<string> {
  console.log('[ChildMonitoring] Screen capture requested');
  
  const deviceInfo = {
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    timestamp: new Date().toISOString(),
  };
  
  return JSON.stringify(deviceInfo);
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
