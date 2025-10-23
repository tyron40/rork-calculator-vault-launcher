import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { 
  Shield, 
  Link2, 
  Calculator,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChildDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pairingCode, setPairingCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [parentDeviceName, setParentDeviceName] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  const { 
    isLocked,
    currentPin,
    userRole,
    setParentDeviceId,
    setLocked,
  } = useVaultStore();

  useEffect(() => {
    if (isLocked || !currentPin || userRole !== 'child') {
      router.replace('/');
    }
  }, [isLocked, currentPin, userRole, router]);

  const checkPairingStatus = useCallback(async () => {
    try {
      const parentId = await AsyncStorage.getItem('child_monitoring_parent_id');
      const parentName = await AsyncStorage.getItem('parent_device_name');
      
      if (parentId) {
        setIsPaired(true);
        setParentDeviceId(parentId);
        setParentDeviceName(parentName || 'Parent Device');
        setConnectionStatus('connected');
        console.log('[ChildDashboard] Device is paired with parent:', parentId);
      } else {
        setIsPaired(false);
        setConnectionStatus('disconnected');
        console.log('[ChildDashboard] Device is not paired');
      }
    } catch (error) {
      console.error('[ChildDashboard] Error checking pairing status:', error);
    }
  }, [setParentDeviceId]);

  useEffect(() => {
    checkPairingStatus();
  }, [checkPairingStatus]);

  useEffect(() => {
    if (connectionStatus === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [connectionStatus, pulseAnim]);



  const generatePairingCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setPairingCode(code);
      
      await AsyncStorage.setItem('child_pairing_code', code);
      await AsyncStorage.setItem('child_pairing_code_timestamp', Date.now().toString());
      
      console.log('[ChildDashboard] Generated pairing code:', code);
      
      setTimeout(() => {
        setPairingCode('');
        AsyncStorage.removeItem('child_pairing_code');
        AsyncStorage.removeItem('child_pairing_code_timestamp');
        Alert.alert('Code Expired', 'The pairing code has expired. Generate a new one to pair.');
      }, 300000);
      
    } catch (error) {
      console.error('[ChildDashboard] Error generating pairing code:', error);
      Alert.alert('Error', 'Failed to generate pairing code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim() || inputCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character pairing code from the parent device');
      return;
    }

    try {
      setConnectionStatus('connecting');
      console.log('[ChildDashboard] Submitting pairing code:', inputCode);
      
      const parentId = `parent_${inputCode}_${Date.now()}`;
      
      await AsyncStorage.setItem('child_monitoring_parent_id', parentId);
      await AsyncStorage.setItem('parent_device_name', 'Parent Device');
      await AsyncStorage.setItem('child_monitoring_active', 'true');
      
      setParentDeviceId(parentId);
      setIsPaired(true);
      setParentDeviceName('Parent Device');
      setConnectionStatus('connected');
      setInputCode('');
      
      Alert.alert(
        'Successfully Paired!',
        'This device is now connected to the parent device. Monitoring is active.',
        [{ text: 'OK' }]
      );
      
      console.log('[ChildDashboard] Device paired successfully');
    } catch (error) {
      console.error('[ChildDashboard] Error pairing device:', error);
      setConnectionStatus('disconnected');
      Alert.alert('Pairing Failed', 'Failed to pair with parent device. Please try again.');
    }
  };

  const handleUnpair = async () => {
    Alert.alert(
      'Unpair Device',
      'Are you sure you want to disconnect from the parent device? Monitoring will stop.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('child_monitoring_parent_id');
              await AsyncStorage.removeItem('parent_device_name');
              await AsyncStorage.setItem('child_monitoring_active', 'false');
              
              setParentDeviceId(null);
              setIsPaired(false);
              setParentDeviceName('');
              setConnectionStatus('disconnected');
              
              Alert.alert('Unpaired', 'Device has been disconnected from parent');
            } catch (error) {
              console.error('[ChildDashboard] Error unpairing:', error);
              Alert.alert('Error', 'Failed to unpair device');
            }
          },
        },
      ]
    );
  };



  const handleToggleDisguise = () => {
    Alert.alert(
      'Switch to Calculator',
      'This will show the calculator disguise. You can return by entering your child PIN on the calculator and pressing =.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            console.log('[ChildDashboard] Switching to calculator disguise');
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👧 Child Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {isPaired ? 'Connected to parent' : 'Not connected'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.disguiseButton} onPress={handleToggleDisguise}>
            <Calculator size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statusCard}>
          <Animated.View style={[styles.statusIcon, { transform: [{ scale: pulseAnim }] }]}>
            {connectionStatus === 'connected' ? (
              <Wifi size={32} color="#10b981" />
            ) : connectionStatus === 'connecting' ? (
              <Wifi size={32} color="#f59e0b" />
            ) : (
              <WifiOff size={32} color="#ef4444" />
            )}
          </Animated.View>
          <Text style={styles.statusTitle}>
            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Not Connected'}
          </Text>
          <Text style={styles.statusDescription}>
            {isPaired 
              ? `Monitoring by ${parentDeviceName}`
              : 'Pair with parent device to enable monitoring'
            }
          </Text>
        </View>

        {!isPaired ? (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Shield size={28} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Generate Pairing Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Generate a code that the parent can use to connect to this device
              </Text>

              {pairingCode ? (
                <View style={styles.codeDisplayContainer}>
                  <Text style={styles.codeDisplayLabel}>Your Pairing Code</Text>
                  <View style={styles.codeDisplay}>
                    <Text style={styles.codeDisplayText}>{pairingCode}</Text>
                  </View>
                  <Text style={styles.codeExpiry}>
                    ⏱️ Code expires in 5 minutes
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, isGeneratingCode && styles.primaryButtonDisabled]}
                  onPress={generatePairingCode}
                  disabled={isGeneratingCode}
                >
                  <Shield size={20} color="#ffffff" />
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
                <Link2 size={28} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Enter Parent Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Enter the 6-character code from the parent device
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="XXXXXX"
                  placeholderTextColor="#6b7280"
                  value={inputCode}
                  onChangeText={(text) => setInputCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!inputCode || inputCode.length !== 6) && styles.primaryButtonDisabled
                ]}
                onPress={handleSubmitCode}
                disabled={!inputCode || inputCode.length !== 6}
              >
                <Link2 size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Connect to Parent</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.pairedCard}>
              <View style={styles.pairedHeader}>
                <CheckCircle2 size={32} color="#10b981" />
                <Text style={styles.pairedTitle}>Device Paired</Text>
              </View>
              <View style={styles.pairedInfo}>
                <View style={styles.pairedRow}>
                  <Text style={styles.pairedLabel}>Parent Device:</Text>
                  <Text style={styles.pairedValue}>{parentDeviceName}</Text>
                </View>
                <View style={styles.pairedRow}>
                  <Text style={styles.pairedLabel}>Status:</Text>
                  <Text style={[styles.pairedValue, { color: '#10b981' }]}>Active</Text>
                </View>
                <View style={styles.pairedRow}>
                  <Text style={styles.pairedLabel}>Monitoring:</Text>
                  <Text style={[styles.pairedValue, { color: '#f59e0b' }]}>Enabled</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleUnpair}
              >
                <AlertCircle size={20} color="#ffffff" />
                <Text style={styles.dangerButtonText}>Unpair Device</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ Active Monitoring</Text>
              <Text style={styles.infoText}>
                This device is currently being monitored by the parent device. The following may be monitored:{'\n\n'}
                • Audio and microphone{'\n'}
                • Camera and photos{'\n'}
                • Device activity{'\n'}
                • Location{'\n\n'}
                This is done with full consent for parental supervision.
              </Text>
            </View>
          </>
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
    paddingVertical: 16,
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
  disguiseButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statusCard: {
    backgroundColor: '#2d3142',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 16,
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
  },
  codeInputContainer: {
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
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
    backgroundColor: '#8b5cf6',
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
  pairedCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  pairedHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pairedTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginTop: 12,
  },
  pairedInfo: {
    gap: 16,
    marginBottom: 24,
  },
  pairedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pairedLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pairedValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
  },
  dangerButtonText: {
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
});
