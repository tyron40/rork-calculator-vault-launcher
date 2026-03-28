import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CameraType = 'back' | 'front';

let cameraStreamInterval: ReturnType<typeof setInterval> | null = null;
let isMonitoring = false;

export interface CameraMonitoringConfig {
  deviceId: string;
  parentDeviceId: string;
  cameraType: CameraType;
  captureIntervalMs: number;
  imageQuality: number;
}

export interface CameraSnapshot {
  id: string;
  deviceId: string;
  timestamp: string;
  imageData: string;
  cameraType: CameraType;
}

export async function startCameraMonitoring(config: CameraMonitoringConfig): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Camera monitoring not fully supported on web');
  }

  if (isMonitoring) {
    console.log('[CameraMonitoring] Already monitoring');
    return;
  }

  console.log('[CameraMonitoring] Starting camera monitoring');

  isMonitoring = true;

  await AsyncStorage.setItem('camera_monitoring_active', 'true');
  await AsyncStorage.setItem('camera_monitoring_config', JSON.stringify(config));
  
  console.log('[CameraMonitoring] Camera monitoring started');
}

export async function stopCameraMonitoring(): Promise<void> {
  console.log('[CameraMonitoring] Stopping camera monitoring');

  if (cameraStreamInterval) {
    clearInterval(cameraStreamInterval);
    cameraStreamInterval = null;
  }

  isMonitoring = false;

  await AsyncStorage.setItem('camera_monitoring_active', 'false');
  await AsyncStorage.removeItem('camera_monitoring_config');
  
  console.log('[CameraMonitoring] Camera monitoring stopped');
}

export async function captureSnapshot(
  cameraRef: any,
  config: CameraMonitoringConfig
): Promise<void> {
  if (!cameraRef || !isMonitoring) return;

  try {
    const photo = await cameraRef.takePictureAsync({
      quality: config.imageQuality,
      base64: true,
    });

    const snapshot: CameraSnapshot = {
      id: `camera_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      deviceId: config.deviceId,
      timestamp: new Date().toISOString(),
      imageData: photo.uri,
      cameraType: config.cameraType,
    };

    await saveCameraSnapshot(config.parentDeviceId, snapshot);
  } catch (error) {
    console.error('[CameraMonitoring] Error capturing snapshot:', error);
  }
}

async function saveCameraSnapshot(parentDeviceId: string, snapshot: CameraSnapshot): Promise<void> {
  try {
    const storageKey = `camera_stream_${parentDeviceId}`;
    const stored = await AsyncStorage.getItem(storageKey);
    const snapshots = stored ? JSON.parse(stored) : [];
    
    snapshots.push(snapshot);
    
    if (snapshots.length > 30) {
      snapshots.shift();
    }
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(snapshots));
  } catch (error) {
    console.error('[CameraMonitoring] Error saving snapshot:', error);
  }
}

export async function getCameraStream(parentDeviceId: string): Promise<CameraSnapshot[]> {
  try {
    const storageKey = `camera_stream_${parentDeviceId}`;
    const stored = await AsyncStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[CameraMonitoring] Error getting camera stream:', error);
    return [];
  }
}

export async function clearCameraStream(parentDeviceId: string): Promise<void> {
  try {
    const storageKey = `camera_stream_${parentDeviceId}`;
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error('[CameraMonitoring] Error clearing camera stream:', error);
  }
}

export async function isCameraMonitoring(): Promise<boolean> {
  try {
    const active = await AsyncStorage.getItem('camera_monitoring_active');
    return active === 'true';
  } catch (error) {
    console.error('[CameraMonitoring] Error checking monitoring status:', error);
    return false;
  }
}

export async function getCameraMonitoringConfig(): Promise<CameraMonitoringConfig | null> {
  try {
    const stored = await AsyncStorage.getItem('camera_monitoring_config');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[CameraMonitoring] Error getting config:', error);
    return null;
  }
}
