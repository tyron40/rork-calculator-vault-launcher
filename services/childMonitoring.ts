import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRemoteCommands, updateCommandStatus, RemoteCommand } from './connection';

let audioRecording: Audio.Recording | null = null;
let monitoringInterval: ReturnType<typeof setInterval> | null = null;

export async function startChildMonitoring(deviceId: string): Promise<void> {
  console.log('[ChildMonitoring] Starting monitoring for device:', deviceId);
  
  if (monitoringInterval) {
    console.log('[ChildMonitoring] Monitoring already running');
    return;
  }

  monitoringInterval = setInterval(async () => {
    await checkForCommands(deviceId);
  }, 5000);

  await AsyncStorage.setItem('child_monitoring_active', 'true');
  await AsyncStorage.setItem('child_monitoring_device_id', deviceId);
}

export async function stopChildMonitoring(): Promise<void> {
  console.log('[ChildMonitoring] Stopping monitoring');
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
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
    const commands = await getRemoteCommands(deviceId);
    const pendingCommands = commands.filter(cmd => cmd.status === 'pending');

    for (const command of pendingCommands) {
      await executeCommand(deviceId, command);
    }
  } catch (error) {
    console.error('[ChildMonitoring] Error checking commands:', error);
  }
}

async function executeCommand(deviceId: string, command: RemoteCommand): Promise<void> {
  console.log('[ChildMonitoring] Executing command:', command.type);
  
  try {
    await updateCommandStatus(deviceId, command.id, 'executing');

    switch (command.type) {
      case 'start_audio':
        await handleStartAudio(deviceId, command);
        break;
      
      case 'stop_audio':
        await handleStopAudio(deviceId, command);
        break;
      
      case 'screenshot':
        await handleScreenshot(deviceId, command);
        break;
      
      case 'get_location':
        await handleGetLocation(deviceId, command);
        break;
      
      case 'lock_device':
        await handleLockDevice(deviceId, command);
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

async function handleScreenshot(deviceId: string, command: RemoteCommand): Promise<void> {
  console.log('[ChildMonitoring] Screenshot requested');
  throw new Error('Screenshot feature not yet implemented');
}

async function handleGetLocation(deviceId: string, command: RemoteCommand): Promise<void> {
  console.log('[ChildMonitoring] Location requested');
  throw new Error('Location feature not yet implemented');
}

async function handleLockDevice(deviceId: string, command: RemoteCommand): Promise<void> {
  console.log('[ChildMonitoring] Lock device requested');
  throw new Error('Lock device feature not yet implemented');
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
