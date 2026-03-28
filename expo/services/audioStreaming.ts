import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

let audioRecording: Audio.Recording | null = null;
let audioStreamInterval: ReturnType<typeof setInterval> | null = null;
let isStreaming = false;

export interface AudioStreamConfig {
  deviceId: string;
  parentDeviceId: string;
  streamQuality: 'low' | 'medium' | 'high';
  chunkIntervalMs: number;
}

export interface AudioChunk {
  id: string;
  deviceId: string;
  timestamp: string;
  audioData: string;
  duration: number;
  format: string;
}

export async function startAudioStreaming(config: AudioStreamConfig): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Audio streaming not supported on web');
  }

  if (isStreaming) {
    console.log('[AudioStreaming] Already streaming');
    return;
  }

  console.log('[AudioStreaming] Starting audio streaming');

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
  
  const recordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: config.streamQuality === 'high' ? 44100 : config.streamQuality === 'medium' ? 22050 : 16000,
      numberOfChannels: 1,
      bitRate: config.streamQuality === 'high' ? 128000 : config.streamQuality === 'medium' ? 64000 : 32000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: config.streamQuality === 'high' ? Audio.IOSAudioQuality.HIGH : Audio.IOSAudioQuality.MEDIUM,
      sampleRate: config.streamQuality === 'high' ? 44100 : config.streamQuality === 'medium' ? 22050 : 16000,
      numberOfChannels: 1,
      bitRate: config.streamQuality === 'high' ? 128000 : config.streamQuality === 'medium' ? 64000 : 32000,
    },
    web: {},
  };

  await recording.prepareToRecordAsync(recordingOptions);
  await recording.startAsync();
  audioRecording = recording;
  isStreaming = true;

  audioStreamInterval = setInterval(async () => {
    await captureAndSendAudioChunk(config);
  }, config.chunkIntervalMs);

  await AsyncStorage.setItem('audio_streaming_active', 'true');
  await AsyncStorage.setItem('audio_streaming_config', JSON.stringify(config));
  
  console.log('[AudioStreaming] Audio streaming started');
}

export async function stopAudioStreaming(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  console.log('[AudioStreaming] Stopping audio streaming');

  if (audioStreamInterval) {
    clearInterval(audioStreamInterval);
    audioStreamInterval = null;
  }

  if (audioRecording) {
    try {
      const status = await audioRecording.getStatusAsync();
      if (status.isRecording) {
        await audioRecording.stopAndUnloadAsync();
      }
      audioRecording = null;
    } catch (error) {
      console.error('[AudioStreaming] Error stopping recording:', error);
    }
  }

  isStreaming = false;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  await AsyncStorage.setItem('audio_streaming_active', 'false');
  await AsyncStorage.removeItem('audio_streaming_config');
  
  console.log('[AudioStreaming] Audio streaming stopped');
}

async function captureAndSendAudioChunk(config: AudioStreamConfig): Promise<void> {
  if (!audioRecording || !isStreaming) return;

  try {
    const status = await audioRecording.getStatusAsync();
    if (!status.isRecording) return;

    const uri = audioRecording.getURI();
    if (!uri) return;

    const chunk: AudioChunk = {
      id: `audio_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      deviceId: config.deviceId,
      timestamp: new Date().toISOString(),
      audioData: uri,
      duration: status.durationMillis,
      format: 'm4a',
    };

    await saveAudioChunk(config.parentDeviceId, chunk);
  } catch (error) {
    console.error('[AudioStreaming] Error capturing audio chunk:', error);
  }
}

async function saveAudioChunk(parentDeviceId: string, chunk: AudioChunk): Promise<void> {
  try {
    const storageKey = `audio_stream_${parentDeviceId}`;
    const stored = await AsyncStorage.getItem(storageKey);
    const chunks = stored ? JSON.parse(stored) : [];
    
    chunks.push(chunk);
    
    if (chunks.length > 50) {
      chunks.shift();
    }
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(chunks));
  } catch (error) {
    console.error('[AudioStreaming] Error saving audio chunk:', error);
  }
}

export async function getAudioStream(parentDeviceId: string): Promise<AudioChunk[]> {
  try {
    const storageKey = `audio_stream_${parentDeviceId}`;
    const stored = await AsyncStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[AudioStreaming] Error getting audio stream:', error);
    return [];
  }
}

export async function clearAudioStream(parentDeviceId: string): Promise<void> {
  try {
    const storageKey = `audio_stream_${parentDeviceId}`;
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error('[AudioStreaming] Error clearing audio stream:', error);
  }
}

export async function isAudioStreaming(): Promise<boolean> {
  try {
    const active = await AsyncStorage.getItem('audio_streaming_active');
    return active === 'true';
  } catch (error) {
    console.error('[AudioStreaming] Error checking streaming status:', error);
    return false;
  }
}
