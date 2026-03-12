import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { 
  Lock, 
  Smartphone, 
  Plus, 
  Mic, 
  Activity, 
  BarChart3, 
  Settings as SettingsIcon,
  Radio,
  QrCode,
  Search,
  Calculator,
  LogOut
} from 'lucide-react-native';
import { useVaultStore, ConnectedDevice } from '@/store/vaultStore';
import { apiClient } from '@/lib/api-client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { sendCommandToChild } from '@/services/connection';

export default function ParentDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'devices' | 'connect' | 'settings'>('devices');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { 
    connectedDevices,
    selectedDeviceId,
    addConnectedDevice,
    removeConnectedDevice,
    setSelectedDevice,
    updateConnectedDevice,
    setLocked,
    setCurrentPin,
    setUserRole: setStoreUserRole,
  } = useVaultStore();

  useEffect(() => {
    const initializeParent = async () => {
      try {
        const role = await AsyncStorage.getItem('user_role');
        
        if (role !== 'parent') {
          console.log('[ParentDashboard] Wrong role, redirecting to role selection');
          router.replace('/role-selection');
          return;
        }
        
        const pin = await AsyncStorage.getItem('parent_pin');
        if (pin) {
          setCurrentPin(pin);
        }
        setStoreUserRole('parent');
        console.log('[ParentDashboard] Initialized successfully as parent');
      } catch (error) {
        console.error('[ParentDashboard] Error initializing:', error);
        router.replace('/role-selection');
      }
    };
    
    initializeParent();
  }, [router, setCurrentPin, setStoreUserRole]);

  const [parentDeviceId, setParentDeviceIdState] = useState<string>('');

  const getPairedDevicesQuery = useQuery({
    queryKey: ['pairing.getPairedDevices', parentDeviceId],
    queryFn: async () => {
      const response = await apiClient.pairing.getPairedDevices(parentDeviceId);
      return response.result.data.json;
    },
    enabled: !!parentDeviceId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    const loadParentId = async () => {
      const id = await AsyncStorage.getItem('parent_device_id');
      if (id) {
        console.log('[ParentDashboard] Loaded parent device ID:', id);
        setParentDeviceIdState(id);
      }
    };
    loadParentId();
  }, []);

  const loadLocalDevices = useCallback(async () => {
    console.log('[ParentDashboard] Local devices are no longer source of truth; using backend only');
  }, []);

  useEffect(() => {
    if (getPairedDevicesQuery.data) {
      const backendDevices = getPairedDevicesQuery.data.devices || [];
      console.log('[ParentDashboard] Received backend devices:', backendDevices.length);
      
      backendDevices.forEach((backendDevice: any) => {
        const device: ConnectedDevice = {
          id: backendDevice.id,
          name: backendDevice.deviceName,
          deviceId: backendDevice.childDeviceId,
          childName: backendDevice.childName,
          lastSeen: backendDevice.lastSeen,
          isOnline: backendDevice.isOnline,
          monitoringActive: false,
        };
        addConnectedDevice(device);
      });
    }
  }, [getPairedDevicesQuery.data, addConnectedDevice]);

  useEffect(() => {
    loadLocalDevices();
  }, [loadLocalDevices]);

  const handleLock = () => {
    setLocked(true);
    router.replace('/');
  };

  const handleChangeAccount = async () => {
    Alert.alert(
      'Change Account',
      'Return to role selection to login with a different account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change Account',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user_role');
              setStoreUserRole(null);
              console.log('[ParentDashboard] Returning to role selection');
              router.replace('/role-selection');
            } catch (error) {
              console.error('[ParentDashboard] Error changing account:', error);
              Alert.alert('Error', 'Failed to change account');
            }
          },
        },
      ]
    );
  };

  const handleToggleDisguise = async () => {
    Alert.alert(
      'Switch to Calculator',
      'This will show the calculator disguise. You can return by entering your parent PIN on the calculator and pressing =.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            console.log('[ParentDashboard] Switching to calculator disguise');
            router.replace('/');
          },
        },
      ]
    );
  };

  const generateCodeMutation = useMutation({
    mutationFn: async (params: { parentDeviceId: string; deviceName: string }) => {
      return await apiClient.pairing.generateCode(params.parentDeviceId, params.deviceName);
    },
  });

  const { mutateAsync: generateCodeMutateAsync } = generateCodeMutation;

  const handleGenerateCode = useCallback(async () => {
    setIsGeneratingCode(true);
    try {
      const parentId = await AsyncStorage.getItem('parent_device_id') || `parent_${Date.now()}`;
      await AsyncStorage.setItem('parent_device_id', parentId);
      
      const result = await generateCodeMutateAsync({
        parentDeviceId: parentId,
        deviceName: 'Parent Device',
      });
      
      if (!result) {
        throw new Error('Failed to generate code');
      }
      
      setGeneratedCode(result.code);
      
      console.log('[ParentDashboard] Generated pairing code:', result.code);
      
      setTimeout(() => {
        setGeneratedCode('');
        Alert.alert('Code Expired', 'The pairing code has expired. Generate a new one to pair.');
      }, 300000);
      
    } catch (error) {
      console.error('[ParentDashboard] Error generating code:', error);
      Alert.alert('Error', 'Failed to generate pairing code');
    } finally {
      setIsGeneratingCode(false);
    }
  }, [generateCodeMutateAsync]);

  const verifyCodeMutation = useMutation({
    mutationFn: async (params: { code: string; parentDeviceId: string }) => {
      const response = await apiClient.pairing.verifyCode(params.code, params.parentDeviceId);
      return response.result.data.json;
    },
  });

  const handlePairDevice = async () => {
    if (!pairingCode.trim()) {
      Alert.alert('Required', 'Please enter pairing code from child device');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[ParentDashboard] Verifying pairing code:', pairingCode);
      
      const parentId = await AsyncStorage.getItem('parent_device_id') || `parent_${Date.now()}`;
      await AsyncStorage.setItem('parent_device_id', parentId);
      
      const result = await verifyCodeMutation.mutateAsync({
        code: pairingCode,
        parentDeviceId: parentId,
      });
      
      console.log('[ParentDashboard] Verification result:', result);
      
      const newDevice: ConnectedDevice = {
        id: result.childDeviceId || `device_${Date.now()}`,
        name: result.childName || 'Child Device',
        deviceId: result.childDeviceId || `child_${pairingCode}`,
        childName: result.childName || 'Child',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        monitoringActive: false,
      };

      addConnectedDevice(newDevice);
      
      const allDevices = [...connectedDevices, newDevice];
      console.log('[ParentDashboard] Updated local in-memory device list:', allDevices.length);
      
      setPairingCode('');
      setActiveTab('devices');
      
      Alert.alert(
        'Device Paired',
        `Successfully connected to ${newDevice.childName}!\n\nYou can now monitor this device.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[ParentDashboard] Error pairing device:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pair device');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevicePress = (device: ConnectedDevice) => {
    setSelectedDevice(device.id);
    Alert.alert(
      device.childName,
      `Device: ${device.name}\nStatus: ${device.isOnline ? 'Online' : 'Offline'}\nMonitoring: ${device.monitoringActive ? 'Active' : 'Inactive'}`,
      [
        {
          text: 'Live Monitoring',
          onPress: () => {
            setSelectedDevice(device.id);
            router.push('/live-monitoring');
          },
        },
        {
          text: 'Start Monitoring',
          onPress: () => handleStartMonitoring(device.id),
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

  const handleStartMonitoring = async (deviceId: string) => {
    try {
      console.log('[ParentDashboard] Starting monitoring for device:', deviceId);
      
      updateConnectedDevice(deviceId, { 
        monitoringActive: true,
        lastSeen: new Date().toISOString(),
      });
      
      const command = {
        id: `cmd_${Date.now()}`,
        type: 'start_audio' as const,
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
      };
      
      const parentId = await AsyncStorage.getItem('parent_device_id') || '';
      if (!parentId) {
        throw new Error('Missing parent device ID');
      }
      await sendCommandToChild(parentId, deviceId, command);
      
      Alert.alert('Monitoring Started', 'Audio monitoring has been enabled on child device');
    } catch (error) {
      console.error('[ParentDashboard] Error starting monitoring:', error);
      Alert.alert('Error', 'Failed to start monitoring');
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
              const updatedDevices = connectedDevices.filter(d => d.id !== deviceId);
              console.log('[ParentDashboard] Updated local in-memory device list after remove:', updatedDevices.length);
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
                {filteredDevices.map((device) => (
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
                      <View style={styles.deviceStats}>
                        <View style={styles.statItem}>
                          <Mic size={16} color={device.monitoringActive ? '#10b981' : '#6b7280'} />
                          <Text style={styles.statText}>
                            {device.monitoringActive ? 'Monitoring' : 'Inactive'}
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Activity size={16} color="#9ca3af" />
                          <Text style={styles.statText}>
                            {new Date(device.lastSeen).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'connect' && (
          <View style={styles.connectTab}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <QrCode size={32} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Generate Pairing Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Generate a code that the child device can use to connect
              </Text>

              {generatedCode ? (
                <View style={styles.codeDisplayContainer}>
                  <Text style={styles.codeDisplayLabel}>Share this code with child device</Text>
                  <View style={styles.codeDisplay}>
                    <Text style={styles.codeDisplayText}>{generatedCode}</Text>
                  </View>
                  <Text style={styles.codeExpiry}>
                    ⏱️ Code expires in 5 minutes
                  </Text>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setGeneratedCode('')}
                  >
                    <Text style={styles.secondaryButtonText}>Generate New Code</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, isGeneratingCode && styles.primaryButtonDisabled]}
                  onPress={handleGenerateCode}
                  disabled={isGeneratingCode}
                >
                  <QrCode size={20} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>
                    {isGeneratingCode ? 'Generating...' : 'Generate Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Plus size={32} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Enter Child Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Enter the 6-character pairing code from the child device
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

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handlePairDevice}
                disabled={isLoading}
              >
                <Plus size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Pairing...' : 'Pair Device'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>💡 Two Ways to Connect</Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' as const }}>Option 1: Generate Code Here{'\n'}</Text>
                • Generate a pairing code on this device{'\n'}
                • Child enters the code to connect{'\n'}
                • Automatic pairing{'\n'}{'\n'}
                <Text style={{ fontWeight: '700' as const }}>Option 2: Enter Child Code{'\n'}</Text>
                • Child generates code on their device{'\n'}
                • Enter that code here to pair{'\n'}
                • Start monitoring immediately
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

            <TouchableOpacity
              style={styles.changeAccountButton}
              onPress={handleChangeAccount}
            >
              <LogOut size={20} color="#f59e0b" />
              <Text style={styles.changeAccountButtonText}>Change Account</Text>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ About Parent Mode</Text>
              <Text style={styles.infoText}>
                Parent mode allows you to monitor connected child devices with full consent. Features include:{'\n\n'}
                • Real-time audio monitoring{'\n'}
                • Activity logging and tracking{'\n'}
                • Remote control capabilities{'\n'}
                • Multi-device management{'\n\n'}
                All monitoring is legal and consensual.
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
  deviceStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#9ca3af',
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
  codeDisplayContainer: {
    alignItems: 'center',
  },
  codeDisplayLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  codeDisplay: {
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    marginBottom: 12,
  },
  codeDisplayText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#8b5cf6',
    letterSpacing: 8,
  },
  codeExpiry: {
    fontSize: 13,
    color: '#f59e0b',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8b5cf6',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3f4453',
  },
  dividerText: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 16,
    fontWeight: '600' as const,
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
  changeAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  changeAccountButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#f59e0b',
  },
});
