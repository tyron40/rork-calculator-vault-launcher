import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { 
  Lock, 
  Smartphone, 
  Plus, 
  Mic, 
  BarChart3, 
  Settings as SettingsIcon,
  Radio,
  QrCode,
  Search,
  Calculator,
  MapPin,
  PhoneOff,
  RefreshCw,
  Monitor
} from 'lucide-react-native';
import { useVaultStore, ConnectedDevice } from '@/store/vaultStore';
import { generateDeviceId } from '@/services/connection';
import { trpc, trpcClient } from '@/lib/trpc';

export default function ParentDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'devices' | 'connect' | 'settings'>('devices');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [childPin, setChildPin] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parentDeviceId, setParentDeviceId] = useState<string>('');
  
  const { 
    isLocked,
    currentPin,
    userRole,
    connectedDevices,
    selectedDeviceId,
    addConnectedDevice,
    removeConnectedDevice,
    setSelectedDevice,
    updateConnectedDevice,
    setLocked,
  } = useVaultStore();

  const statusQuery = trpc.devices.getMultipleStatus.useQuery(
    { deviceIds: connectedDevices.map(d => d.deviceId) },
    { 
      refetchInterval: 5000,
      enabled: connectedDevices.length > 0,
    }
  );

  const sendCommandMutation = trpc.devices.sendCommand.useMutation({
    onSuccess: (data, variables) => {
      console.log('[ParentDashboard] Command sent:', variables.type);
      pollCommandResult(variables.deviceId, data.id, variables.type);
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to send command: ${error.message}`);
    },
  });

  useEffect(() => {
    if (isLocked || !currentPin || userRole !== 'parent') {
      router.replace('/');
    }
  }, [isLocked, currentPin, userRole]);

  useEffect(() => {
    initializeParentDevice();
  }, []);

  useEffect(() => {
    if (statusQuery.data && statusQuery.data.length > 0) {
      statusQuery.data.forEach((status) => {
        const device = connectedDevices.find(d => d.deviceId === status.deviceId);
        if (device) {
          updateConnectedDevice(device.id, {
            isOnline: status.isOnline,
            lastSeen: status.lastSeen,
          });
        }
      });
    }
  }, [statusQuery.data]);

  const initializeParentDevice = async () => {
    try {
      const deviceId = await generateDeviceId();
      setParentDeviceId(deviceId);
      console.log('[ParentDashboard] Parent device ID:', deviceId);
    } catch (error) {
      console.error('[ParentDashboard] Error initializing parent device:', error);
    }
  };

  const pollCommandResult = async (deviceId: string, commandId: string, commandType: string) => {
    const maxAttempts = 20;
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const result = await trpcClient.devices.getCommandResult.query({ deviceId, commandId });
        
        if (result && (result.status === 'completed' || result.status === 'failed')) {
          clearInterval(pollInterval);
          
          if (result.status === 'completed') {
            let message = `${commandType} completed successfully`;
            
            if (result.result) {
              try {
                const parsed = JSON.parse(result.result);
                if (parsed.latitude && parsed.longitude) {
                  message = `Location:\nLat: ${parsed.latitude.toFixed(6)}\nLng: ${parsed.longitude.toFixed(6)}\nAccuracy: ${parsed.accuracy?.toFixed(0)}m`;
                } else {
                  message = result.result;
                }
              } catch {
                message = result.result;
              }
            }
            
            Alert.alert('Command Completed', message);
          } else {
            Alert.alert('Command Failed', result.error || 'Unknown error');
          }
        }
      } catch (error) {
        console.error('[ParentDashboard] Error polling command result:', error);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        Alert.alert('Timeout', 'Command is taking longer than expected');
      }
    }, 1000);
  };

  const handleLock = () => {
    setLocked(true);
    router.replace('/');
  };

  const handleToggleDisguise = async () => {
    Alert.alert(
      'Switch to Calculator',
      'This will show the calculator disguise. You can return by entering your parent PIN on the calculator and pressing =.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            try {
              console.log('[ParentDashboard] Switching to calculator disguise');
              await AsyncStorage.setItem('calculator_disguise_mode', 'true');
              router.replace('/disguise');
            } catch (error) {
              console.error('[ParentDashboard] Error entering disguise mode:', error);
            }
          },
        },
      ]
    );
  };

  const pairDeviceMutation = trpc.devices.pair.useMutation({
    onSuccess: (data) => {
      const newDevice: ConnectedDevice = {
        id: data.id,
        name: data.name,
        deviceId: data.deviceId,
        childName: data.childName,
        lastSeen: data.lastSeen,
        isOnline: data.isOnline,
        monitoringActive: data.monitoringActive,
      };
      
      addConnectedDevice(newDevice);
      setPairingCode('');
      setChildPin('');
      setActiveTab('devices');
      
      Alert.alert(
        'Device Paired',
        `Successfully connected to ${data.childName}'s device!\n\nChild PIN: ${childPin}\n\nThe child can now use this PIN on the calculator to access the app.`,
        [{ text: 'OK' }]
      );
    },
    onError: (error) => {
      Alert.alert('Pairing Failed', error.message);
    },
  });

  const handlePairDevice = async () => {
    if (!pairingCode.trim()) {
      Alert.alert('Required', 'Please enter pairing code from child device');
      return;
    }

    if (!childPin.trim() || childPin.length < 4) {
      Alert.alert('Required', 'Please enter a child PIN (min 4 digits)');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[ParentDashboard] Pairing with code:', pairingCode);
      
      await pairDeviceMutation.mutateAsync({
        pairingCode: pairingCode.trim(),
        parentDeviceId,
        childPin: childPin.trim(),
      });

      await AsyncStorage.setItem(`child_pin_${pairingCode}`, childPin.trim());
    } catch (error) {
      console.error('[ParentDashboard] Error pairing device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevicePress = (device: ConnectedDevice) => {
    setSelectedDevice(device.id);
    
    const statusInfo = statusQuery.data?.find(s => s.deviceId === device.deviceId);
    const locationText = statusInfo?.location 
      ? `\nLocation: ${statusInfo.location.latitude.toFixed(4)}, ${statusInfo.location.longitude.toFixed(4)}`
      : '';
    const batteryText = statusInfo?.batteryLevel 
      ? `\nBattery: ${statusInfo.batteryLevel.toFixed(0)}%`
      : '';
    
    Alert.alert(
      device.childName,
      `Device: ${device.name}\nStatus: ${device.isOnline ? '🟢 Online' : '🔴 Offline'}${batteryText}${locationText}`,
      [
        {
          text: 'Remote Control',
          onPress: () => handleRemoteControl(device),
        },
        {
          text: 'View Dashboard',
          onPress: () => router.push('/monitoring'),
        },
        {
          text: 'Remove Device',
          style: 'destructive',
          onPress: () => handleRemoveDevice(device.id),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRemoteControl = (device: ConnectedDevice) => {
    Alert.alert(
      'Remote Control',
      `Control ${device.childName}'s device`,
      [
        {
          text: '🎤 Start Audio Monitor',
          onPress: () => sendCommand(device.deviceId, 'start_audio'),
        },
        {
          text: '🔇 Stop Audio Monitor',
          onPress: () => sendCommand(device.deviceId, 'stop_audio'),
        },
        {
          text: '📍 Get Location',
          onPress: () => sendCommand(device.deviceId, 'get_location'),
        },
        {
          text: '📱 Get Device Info',
          onPress: () => sendCommand(device.deviceId, 'get_screen'),
        },
        {
          text: '🔒 Lock Device',
          onPress: () => sendCommand(device.deviceId, 'lock_device'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const sendCommand = async (deviceId: string, type: 'start_audio' | 'stop_audio' | 'get_location' | 'screenshot' | 'lock_device' | 'get_screen') => {
    try {
      await sendCommandMutation.mutateAsync({ deviceId, type });
    } catch (error) {
      console.error('[ParentDashboard] Error sending command:', error);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              removeConnectedDevice(deviceId);
              Alert.alert('Success', 'Device removed');
            } catch (error) {
              console.error('[ParentDashboard] Error removing device:', error);
              Alert.alert('Error', 'Failed to remove device');
            }
          },
        },
      ]
    );
  };

  const filteredDevices = useMemo(() => {
    if (!searchQuery) return connectedDevices;
    const query = searchQuery.toLowerCase();
    return connectedDevices.filter(device =>
      device.childName.toLowerCase().includes(query) ||
      device.name.toLowerCase().includes(query)
    );
  }, [connectedDevices, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👨‍👩‍👧 Parent Dashboard</Text>
          <Text style={styles.headerSubtitle}>{connectedDevices.length} devices connected</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.disguiseButton} onPress={handleToggleDisguise}>
            <Calculator size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => statusQuery.refetch()}
          >
            <RefreshCw size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.lockButton} onPress={handleLock}>
            <Lock size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'devices' && styles.tabActive]}
          onPress={() => setActiveTab('devices')}
        >
          <Smartphone size={20} color={activeTab === 'devices' ? '#3b82f6' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'devices' && styles.tabTextActive]}>
            Devices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'connect' && styles.tabActive]}
          onPress={() => setActiveTab('connect')}
        >
          <Plus size={20} color={activeTab === 'connect' ? '#3b82f6' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'connect' && styles.tabTextActive]}>
            Connect
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} color={activeTab === 'settings' ? '#3b82f6' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'devices' && (
          <View style={styles.devicesTab}>
            {connectedDevices.length > 0 && (
              <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search devices..."
                  placeholderTextColor="#6b7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}

            {filteredDevices.length === 0 ? (
              <View style={styles.emptyState}>
                <Smartphone size={64} color="#4a4e69" />
                <Text style={styles.emptyTitle}>No Devices Connected</Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'No devices match your search'
                    : 'Connect a child device to start monitoring'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setActiveTab('connect')}
                  >
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Connect Device</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.deviceList}>
                {filteredDevices.map((device) => {
                  const deviceStatus = statusQuery.data?.find(s => s.deviceId === device.deviceId);
                  
                  return (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        styles.deviceCard,
                        selectedDeviceId === device.id && styles.deviceCardSelected,
                      ]}
                      onPress={() => handleDevicePress(device)}
                    >
                      <View style={styles.deviceInfo}>
                        <View style={styles.deviceHeader}>
                          <Text style={styles.deviceName}>{device.childName}</Text>
                          <View style={[
                            styles.statusBadge,
                            device.isOnline ? styles.statusOnline : styles.statusOffline,
                          ]}>
                            <Radio size={12} color="#ffffff" />
                            <Text style={styles.statusText}>
                              {device.isOnline ? 'Online' : 'Offline'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.deviceModel}>{device.name}</Text>
                        
                        {deviceStatus && (
                          <View style={styles.deviceExtras}>
                            {deviceStatus.batteryLevel !== undefined && (
                              <View style={styles.extraItem}>
                                <Text style={styles.extraText}>
                                  🔋 {deviceStatus.batteryLevel.toFixed(0)}%
                                </Text>
                              </View>
                            )}
                            {deviceStatus.location && (
                              <View style={styles.extraItem}>
                                <MapPin size={14} color="#10b981" />
                                <Text style={styles.extraText}>Location tracked</Text>
                              </View>
                            )}
                          </View>
                        )}
                        
                        <View style={styles.deviceActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendCommand(device.deviceId, 'start_audio')}
                          >
                            <Mic size={16} color="#10b981" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendCommand(device.deviceId, 'get_location')}
                          >
                            <MapPin size={16} color="#3b82f6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendCommand(device.deviceId, 'get_screen')}
                          >
                            <Monitor size={16} color="#8b5cf6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendCommand(device.deviceId, 'lock_device')}
                          >
                            <PhoneOff size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeTab === 'connect' && (
          <View style={styles.connectTab}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <QrCode size={32} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Pair Child Device</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Enter the 6-character pairing code displayed on the child device and create a PIN for them
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="XXXXXX"
                  placeholderTextColor="#6b7280"
                  value={pairingCode}
                  onChangeText={(text) => setPairingCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <View style={styles.pinInputContainer}>
                <Lock size={20} color="#10b981" />
                <TextInput
                  style={styles.pinInput}
                  placeholder="Create Child PIN (min 4 digits)"
                  placeholderTextColor="#6b7280"
                  value={childPin}
                  onChangeText={setChildPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handlePairDevice}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Pairing...' : 'Pair Device'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>💡 How to Connect</Text>
              <Text style={styles.infoText}>
                1. Open the app on child device{'\n'}
                2. Complete setup and grant consent{'\n'}
                3. Child will see a pairing code{'\n'}
                4. Enter the code here and create a child PIN{'\n'}
                5. Child can use the PIN on calculator to access the app{'\n'}
                6. Start monitoring with remote controls
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.settingsTab}>
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={() => router.push('/monitoring')}
            >
              <BarChart3 size={20} color="#ffffff" />
              <Text style={styles.dashboardButtonText}>View Monitoring Dashboard</Text>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>🎮 Remote Control Features</Text>
              <Text style={styles.infoText}>
                • 🎤 Live audio monitoring{'\n'}
                • 📍 Real-time location tracking{'\n'}
                • 📱 Device information retrieval{'\n'}
                • 🔒 Remote device lock{'\n'}
                • 📊 Activity logging{'\n'}
                • 🔄 Automatic status updates{'\n\n'}
                All features require consent and work in real-time.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#1a1d29',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  lockButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2d3142',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disguiseButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#2d3142',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  devicesTab: {
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deviceList: {
    gap: 12,
  },
  deviceCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  deviceCardSelected: {
    borderColor: '#3b82f6',
  },
  deviceInfo: {
    gap: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  deviceModel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  deviceExtras: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  extraText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1d29',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectTab: {
    gap: 16,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  codeInputContainer: {
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    padding: 4,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 16,
    letterSpacing: 8,
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#93c5fd',
    lineHeight: 20,
  },
  settingsTab: {
    gap: 16,
    paddingBottom: 24,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});
