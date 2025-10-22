import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Wifi, WifiOff, QrCode, RefreshCw, ArrowRight, Users, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/store/vaultStore';
import { generateDeviceId } from '@/services/connection';

export default function ConnectScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [canConnect, setCanConnect] = useState<boolean>(false);
  const [pairingCode, setPairingCode] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    loadUserRole();
    checkConnection();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('user_role') as UserRole;
      setUserRole(role);
      console.log('[Connect] User role:', role);
      
      const id = await generateDeviceId();
      setDeviceId(id);
    } catch (error) {
      console.error('[Connect] Error loading user role:', error);
    }
  };

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCanConnect(true);
      console.log('[Connect] Connection available');
    } catch (error) {
      console.error('[Connect] Error checking connection:', error);
      setCanConnect(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSkipConnection = () => {
    Alert.alert(
      'Continue Without Connecting',
      userRole === 'parent' 
        ? 'You can connect child devices later from the parent dashboard.'
        : 'You can pair with a parent device later. Share your pairing code when ready.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => router.replace('/setup'),
        },
      ]
    );
  };

  const handleConnectNow = () => {
    if (userRole === 'parent' && !pairingCode.trim()) {
      Alert.alert('Required', 'Please enter the pairing code from child device');
      return;
    }
    
    Alert.alert(
      'Connection Ready',
      userRole === 'parent'
        ? `You'll be able to pair with child device using code: ${pairingCode} after setup.`
        : 'You will receive a pairing code after setup to share with your parent.',
      [
        {
          text: 'Continue to Setup',
          onPress: () => {
            if (pairingCode) {
              AsyncStorage.setItem('pending_pairing_code', pairingCode);
            }
            router.replace('/setup');
          },
        },
      ]
    );
  };

  if (!userRole) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {userRole === 'parent' ? (
              <Users size={64} color="#3b82f6" />
            ) : (
              <User size={64} color="#10b981" />
            )}
          </View>
          <Text style={styles.title}>
            {userRole === 'parent' ? 'Connect to Child Device' : 'Connect to Parent'}
          </Text>
          <Text style={styles.subtitle}>
            {userRole === 'parent'
              ? 'Pair with your child device to enable monitoring'
              : 'Connect with your parent for monitored access'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              {isCheckingConnection ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <>
                  {canConnect ? (
                    <Wifi size={32} color="#10b981" />
                  ) : (
                    <WifiOff size={32} color="#ef4444" />
                  )}
                </>
              )}
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {isCheckingConnection 
                    ? 'Checking Connection...' 
                    : canConnect 
                      ? 'Ready to Connect' 
                      : 'Connection Unavailable'}
                </Text>
                <Text style={styles.statusDescription}>
                  {isCheckingConnection
                    ? 'Please wait'
                    : canConnect
                      ? 'You can now pair devices'
                      : 'You can set up later'}
                </Text>
              </View>
            </View>

            {!isCheckingConnection && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={checkConnection}
              >
                <RefreshCw size={16} color="#8b5cf6" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>

          {userRole === 'parent' ? (
            <View style={styles.pairingSection}>
              <View style={styles.sectionHeader}>
                <QrCode size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Enter Child Pairing Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Ask your child to open the app and get their 6-character pairing code
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
                  editable={canConnect}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 Steps:{'\n'}
                  1. Child opens app on their device{'\n'}
                  2. Child completes setup{'\n'}
                  3. Child receives pairing code{'\n'}
                  4. Enter code here to connect{'\n'}
                  5. Start monitoring after setup
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.pairingSection}>
              <View style={styles.sectionHeader}>
                <QrCode size={24} color="#10b981" />
                <Text style={styles.sectionTitle}>Get Your Pairing Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                You'll receive a unique code after setup to share with your parent
              </Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 How it works:{'\n'}
                  1. Complete the PIN setup{'\n'}
                  2. You'll get a 6-character code{'\n'}
                  3. Share code with parent/guardian{'\n'}
                  4. Parent enters code on their device{'\n'}
                  5. Devices will be connected
                </Text>
              </View>

              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Your Device ID</Text>
                <Text style={styles.previewCode}>{deviceId.substring(0, 8)}...</Text>
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!canConnect || (userRole === 'parent' && !pairingCode.trim())) && styles.buttonDisabled,
              ]}
              onPress={handleConnectNow}
              disabled={!canConnect || (userRole === 'parent' && !pairingCode.trim())}
            >
              <Text style={styles.primaryButtonText}>
                {userRole === 'parent' ? 'Save Code & Continue' : 'Continue to Setup'}
              </Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkipConnection}
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1d29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#2d3142',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  content: {
    gap: 24,
  },
  statusCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1d29',
    borderRadius: 8,
    paddingVertical: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8b5cf6',
  },
  pairingSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  },
  codeInputContainer: {
    backgroundColor: '#2d3142',
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
  infoBox: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#93c5fd',
    lineHeight: 22,
  },
  previewCard: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9ca3af',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewCode: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  actions: {
    gap: 12,
    marginTop: 8,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#9ca3af',
  },
});
