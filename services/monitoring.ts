import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MonitoringSession {
  id: string;
  startTime: string;
  endTime?: string;
  type: 'audio' | 'screen' | 'activity';
  status: 'active' | 'stopped' | 'paused';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'app_opened' | 'app_closed' | 'screen_on' | 'screen_off' | 'location_change';
  details: string;
}

let audioRecording: Audio.Recording | null = null;

export async function requestAudioPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[Monitoring] Audio recording not supported on web');
    return false;
  }

  try {
    console.log('[Monitoring] Requesting audio permission');
    const { granted } = await Audio.requestPermissionsAsync();
    console.log('[Monitoring] Audio permission granted:', granted);
    return granted;
  } catch (error) {
    console.error('[Monitoring] Error requesting audio permission:', error);
    return false;
  }
}

export async function startAudioMonitoring(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[Monitoring] Audio monitoring not supported on web');
    return false;
  }

  try {
    console.log('[Monitoring] Starting audio monitoring');
    
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      console.log('[Monitoring] Audio permission denied');
      return false;
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

    const session: MonitoringSession = {
      id: `audio_${Date.now()}`,
      startTime: new Date().toISOString(),
      type: 'audio',
      status: 'active',
    };

    await saveMonitoringSession(session);
    
    console.log('[Monitoring] Audio monitoring started');
    return true;
  } catch (error) {
    console.error('[Monitoring] Error starting audio monitoring:', error);
    return false;
  }
}

export async function stopAudioMonitoring(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    console.log('[Monitoring] Stopping audio monitoring');
    
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

    const sessions = await getMonitoringSessions();
    const activeSession = sessions.find(s => s.type === 'audio' && s.status === 'active');
    if (activeSession) {
      activeSession.status = 'stopped';
      activeSession.endTime = new Date().toISOString();
      await saveMonitoringSession(activeSession);
    }
    
    console.log('[Monitoring] Audio monitoring stopped');
  } catch (error) {
    console.error('[Monitoring] Error stopping audio monitoring:', error);
  }
}

export async function isAudioMonitoringActive(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    if (!audioRecording) {
      return false;
    }
    const status = await audioRecording.getStatusAsync();
    return status.isRecording;
  } catch (error) {
    console.error('[Monitoring] Error checking audio monitoring status:', error);
    return false;
  }
}

export async function logActivity(type: ActivityLog['type'], details: string): Promise<void> {
  try {
    const activity: ActivityLog = {
      id: `activity_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      details,
    };

    console.log('[Monitoring] Logging activity:', activity);

    const logs = await getActivityLogs();
    logs.push(activity);

    const maxLogs = 1000;
    if (logs.length > maxLogs) {
      logs.splice(0, logs.length - maxLogs);
    }

    await AsyncStorage.setItem('activity_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('[Monitoring] Error logging activity:', error);
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const stored = await AsyncStorage.getItem('activity_logs');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Monitoring] Error getting activity logs:', error);
    return [];
  }
}

export async function clearActivityLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem('activity_logs');
    console.log('[Monitoring] Activity logs cleared');
  } catch (error) {
    console.error('[Monitoring] Error clearing activity logs:', error);
  }
}

async function saveMonitoringSession(session: MonitoringSession): Promise<void> {
  try {
    const sessions = await getMonitoringSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    await AsyncStorage.setItem('monitoring_sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('[Monitoring] Error saving monitoring session:', error);
  }
}

export async function getMonitoringSessions(): Promise<MonitoringSession[]> {
  try {
    const stored = await AsyncStorage.getItem('monitoring_sessions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Monitoring] Error getting monitoring sessions:', error);
    return [];
  }
}

export async function clearMonitoringSessions(): Promise<void> {
  try {
    await AsyncStorage.removeItem('monitoring_sessions');
    console.log('[Monitoring] Monitoring sessions cleared');
  } catch (error) {
    console.error('[Monitoring] Error clearing monitoring sessions:', error);
  }
}

export async function getConsentInfo(): Promise<{
  parentName: string;
  childName: string;
  consentDate: string;
} | null> {
  try {
    const stored = await AsyncStorage.getItem('parental_consent');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[Monitoring] Error getting consent info:', error);
    return null;
  }
}

export async function hasParentalConsent(): Promise<boolean> {
  const consent = await getConsentInfo();
  return consent !== null && !!consent.parentName && !!consent.childName;
}
