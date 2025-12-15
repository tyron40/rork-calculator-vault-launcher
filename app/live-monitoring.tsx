import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  MapPin,
  Vibrate,
  Bell,
  Info,
  Play,
  Pause,
  Radio
} from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';
import { 
  createAudioCommand,
  createCameraCommand,
  createLocationCommand,
  createVibrateCommand,
  createNotificationCommand,
  createDeviceInfoCommand,
  sendRemoteCommand,
  getDeviceCommands
} from '@/services/remoteControl';
import { getAudioStream, AudioChunk } from '@/services/audioStreaming';
import { getCameraStream, CameraSnapshot } from '@/services/cameraMonitoring';
import { Audio } from 'expo-av';

export default function LiveMonitoringScreen() {
  const router = useRouter();
  const { selectedDeviceId, connectedDevices } = useVaultStore();
  
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
  const [cameraSnapshots, setCameraSnapshots] = useState<CameraSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedDevice = connectedDevices.find(d => d.id === selectedDeviceId);

  const loadStreamData = useCallback(async () => {
    if (!selectedDevice) return;
    
    try {
      const audio = await getAudioStream(selectedDevice.deviceId);
      const camera = await getCameraStream(selectedDevice.deviceId);
      
      setAudioChunks(audio);
      setCameraSnapshots(camera);
    } catch (error) {
      console.error('[LiveMonitoring] Error loading stream data:', error);
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (!selectedDeviceId || !selectedDevice) {
      router.back();
      return;
    }

    const loadData = async () => {
      if (!selectedDevice) return;
      
      try {
        const audio = await getAudioStream(selectedDevice.deviceId);
        const camera = await getCameraStream(selectedDevice.deviceId);
        
        setAudioChunks(audio);
        setCameraSnapshots(camera);

        const commands = await getDeviceCommands(selectedDevice.deviceId);
        const audioCmd = commands.find(c => c.type === 'start_audio' && c.status === 'completed');
        const cameraCmd = commands.find(c => c.type === 'start_camera' && c.status === 'completed');
        
        setIsAudioActive(!!audioCmd);
        setIsCameraActive(!!cameraCmd);
      } catch (error) {
        console.error('[LiveMonitoring] Error loading data:', error);
      }
    };

    loadData();
    
    const interval = setInterval(() => {
      if (selectedDevice) {
        loadStreamData().catch((err: Error) => 
          console.error('[LiveMonitoring] Error in auto-refresh:', err)
        );
      }
    }, 3000);
    refreshInterval.current = interval;

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [selectedDeviceId, selectedDevice, router, loadStreamData]);

  const handleToggleAudio = async () => {
    if (!selectedDevice) return;

    try {
      setIsLoading(true);
      
      const command = await createAudioCommand(isAudioActive ? 'stop' : 'start');
      await sendRemoteCommand(selectedDevice.deviceId, command);
      
      setIsAudioActive(!isAudioActive);
      
      Alert.alert(
        'Audio Monitoring',
        `Audio monitoring ${!isAudioActive ? 'started' : 'stopped'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[LiveMonitoring] Error toggling audio:', error);
      Alert.alert('Error', 'Failed to toggle audio monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCamera = async () => {
    if (!selectedDevice) return;

    try {
      setIsLoading(true);
      
      const command = await createCameraCommand(
        isCameraActive ? 'stop' : 'start',
        cameraType
      );
      await sendRemoteCommand(selectedDevice.deviceId, command);
      
      setIsCameraActive(!isCameraActive);
      
      Alert.alert(
        'Camera Monitoring',
        `Camera monitoring ${!isCameraActive ? 'started' : 'stopped'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[LiveMonitoring] Error toggling camera:', error);
      Alert.alert('Error', 'Failed to toggle camera monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchCamera = async () => {
    if (!isCameraActive) return;
    
    const newType = cameraType === 'front' ? 'back' : 'front';
    setCameraType(newType);
    
    if (!selectedDevice) return;
    
    try {
      const stopCommand = await createCameraCommand('stop');
      await sendRemoteCommand(selectedDevice.deviceId, stopCommand);
      
      setTimeout(async () => {
        const startCommand = await createCameraCommand('start', newType);
        await sendRemoteCommand(selectedDevice.deviceId, startCommand);
      }, 1000);
    } catch (error) {
      console.error('[LiveMonitoring] Error switching camera:', error);
    }
  };

  const handlePlayAudio = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Audio playback not supported on web');
      return;
    }

    if (audioChunks.length === 0) {
      Alert.alert('No Audio', 'No audio data available');
      return;
    }

    try {
      const latestChunk = audioChunks[audioChunks.length - 1];
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: latestChunk.audioData },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setIsPlayingAudio(true);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch (error) {
      console.error('[LiveMonitoring] Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const handleGetLocation = async () => {
    if (!selectedDevice) return;

    try {
      setIsLoading(true);
      
      const command = await createLocationCommand();
      await sendRemoteCommand(selectedDevice.deviceId, command);
      
      setTimeout(async () => {
        const commands = await getDeviceCommands(selectedDevice.deviceId);
        const locationCmd = commands.find(c => c.type === 'get_location' && c.status === 'completed');
        
        if (locationCmd?.result) {
          setLocationData(locationCmd.result);
          Alert.alert(
            'Location Retrieved',
            `Lat: ${locationCmd.result.latitude}\nLng: ${locationCmd.result.longitude}`,
            [{ text: 'OK' }]
          );
        }
      }, 2000);
    } catch (error) {
      console.error('[LiveMonitoring] Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVibrate = async () => {
    if (!selectedDevice) return;

    try {
      const command = await createVibrateCommand(400);
      await sendRemoteCommand(selectedDevice.deviceId, command);
      
      Alert.alert('Command Sent', 'Vibration command sent to device');
    } catch (error) {
      console.error('[LiveMonitoring] Error sending vibrate:', error);
      Alert.alert('Error', 'Failed to send vibrate command');
    }
  };

  const handleSendNotification = async () => {
    if (!selectedDevice) return;

    Alert.prompt(
      'Send Notification',
      'Enter notification message:',
      async (message) => {
        if (message) {
          try {
            const command = await createNotificationCommand('Parent Alert', message);
            await sendRemoteCommand(selectedDevice.deviceId, command);
            
            Alert.alert('Command Sent', 'Notification sent to device');
          } catch (error) {
            console.error('[LiveMonitoring] Error sending notification:', error);
            Alert.alert('Error', 'Failed to send notification');
          }
        }
      }
    );
  };

  const handleGetDeviceInfo = async () => {
    if (!selectedDevice) return;

    try {
      setIsLoading(true);
      
      const command = await createDeviceInfoCommand();
      await sendRemoteCommand(selectedDevice.deviceId, command);
      
      setTimeout(async () => {
        const commands = await getDeviceCommands(selectedDevice.deviceId);
        const infoCmd = commands.find(c => c.type === 'get_device_info' && c.status === 'completed');
        
        if (infoCmd?.result) {
          setDeviceInfo(infoCmd.result);
          Alert.alert(
            'Device Info',
            `Platform: ${infoCmd.result.platform}\nOS: ${infoCmd.result.osVersion}\nBattery: ${Math.round(infoCmd.result.batteryLevel * 100)}%`,
            [{ text: 'OK' }]
          );
        }
      }, 2000);
    } catch (error) {
      console.error('[LiveMonitoring] Error getting device info:', error);
      Alert.alert('Error', 'Failed to get device info');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedDevice) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No device selected</Text>
      </View>
    );
  }

  const latestSnapshot = cameraSnapshots.length > 0 ? cameraSnapshots[cameraSnapshots.length - 1] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{selectedDevice.childName}</Text>
          <View style={styles.statusIndicator}>
            <Radio 
              size={12} 
              color={selectedDevice.isOnline ? '#10b981' : '#6b7280'} 
            />
            <Text style={styles.statusText}>
              {selectedDevice.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📹 Live Camera Feed</Text>
          <View style={styles.cameraContainer}>
            {isCameraActive && latestSnapshot ? (
              <Image 
                source={{ uri: latestSnapshot.imageData }} 
                style={styles.cameraPreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Camera size={64} color="#4a4e69" />
                <Text style={styles.placeholderText}>
                  {isCameraActive ? 'Waiting for feed...' : 'Camera inactive'}
                </Text>
              </View>
            )}
            
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={[styles.controlButton, isCameraActive && styles.controlButtonActive]}
                onPress={handleToggleCamera}
                disabled={isLoading}
              >
                {isCameraActive ? (
                  <CameraOff size={20} color="#ffffff" />
                ) : (
                  <Camera size={20} color="#ffffff" />
                )}
                <Text style={styles.controlButtonText}>
                  {isCameraActive ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, !isCameraActive && styles.controlButtonDisabled]}
                onPress={handleSwitchCamera}
                disabled={!isCameraActive || isLoading}
              >
                <Camera size={20} color="#ffffff" />
                <Text style={styles.controlButtonText}>
                  {cameraType === 'front' ? 'Front' : 'Back'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Live Audio</Text>
          <View style={styles.audioContainer}>
            <View style={styles.audioVisualizer}>
              {isAudioActive ? (
                <View style={styles.audioWaves}>
                  <View style={[styles.audioBar, { height: 30 }]} />
                  <View style={[styles.audioBar, { height: 50 }]} />
                  <View style={[styles.audioBar, { height: 40 }]} />
                  <View style={[styles.audioBar, { height: 60 }]} />
                  <View style={[styles.audioBar, { height: 35 }]} />
                </View>
              ) : (
                <Mic size={48} color="#4a4e69" />
              )}
              <Text style={styles.audioStatus}>
                {isAudioActive ? 'Recording...' : 'Audio inactive'}
              </Text>
              {audioChunks.length > 0 && (
                <Text style={styles.audioChunks}>
                  {audioChunks.length} audio chunks captured
                </Text>
              )}
            </View>
            
            <View style={styles.audioControls}>
              <TouchableOpacity
                style={[styles.controlButton, isAudioActive && styles.controlButtonActive]}
                onPress={handleToggleAudio}
                disabled={isLoading}
              >
                {isAudioActive ? (
                  <MicOff size={20} color="#ffffff" />
                ) : (
                  <Mic size={20} color="#ffffff" />
                )}
                <Text style={styles.controlButtonText}>
                  {isAudioActive ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, Platform.OS === 'web' && styles.controlButtonDisabled]}
                onPress={handlePlayAudio}
                disabled={audioChunks.length === 0 || Platform.OS === 'web'}
              >
                {isPlayingAudio ? (
                  <Pause size={20} color="#ffffff" />
                ) : (
                  <Play size={20} color="#ffffff" />
                )}
                <Text style={styles.controlButtonText}>
                  Play
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Remote Control</Text>
          <View style={styles.remoteGrid}>
            <TouchableOpacity style={styles.remoteButton} onPress={handleGetLocation}>
              <MapPin size={24} color="#3b82f6" />
              <Text style={styles.remoteButtonText}>Get Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.remoteButton} onPress={handleGetDeviceInfo}>
              <Info size={24} color="#8b5cf6" />
              <Text style={styles.remoteButtonText}>Device Info</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.remoteButton} onPress={handleVibrate}>
              <Vibrate size={24} color="#f59e0b" />
              <Text style={styles.remoteButtonText}>Vibrate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.remoteButton} onPress={handleSendNotification}>
              <Bell size={24} color="#10b981" />
              <Text style={styles.remoteButtonText}>Notify</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(deviceInfo || locationData) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Device Status</Text>
            {deviceInfo && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Platform: {deviceInfo.platform}</Text>
                <Text style={styles.infoLabel}>OS Version: {deviceInfo.osVersion}</Text>
                <Text style={styles.infoLabel}>Battery: {Math.round(deviceInfo.batteryLevel * 100)}%</Text>
                <Text style={styles.infoLabel}>Network: {deviceInfo.networkType}</Text>
              </View>
            )}
            {locationData && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Latitude: {locationData.latitude}</Text>
                <Text style={styles.infoLabel}>Longitude: {locationData.longitude}</Text>
                <Text style={styles.infoLabel}>Accuracy: {Math.round(locationData.accuracy)}m</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#1a1d29',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3142',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  cameraContainer: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraPreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#000000',
  },
  cameraPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#1a1d29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  cameraControls: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  controlButtonActive: {
    backgroundColor: '#ef4444',
  },
  controlButtonDisabled: {
    backgroundColor: '#4a4e69',
    opacity: 0.5,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  audioContainer: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 16,
  },
  audioVisualizer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  audioWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 60,
  },
  audioBar: {
    width: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  audioStatus: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginTop: 16,
  },
  audioChunks: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  remoteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  remoteButton: {
    width: '48%',
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  remoteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
  },
});
