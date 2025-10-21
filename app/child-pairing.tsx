import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { QrCode } from 'lucide-react-native';
import { generateDeviceId, getDeviceName, saveConnectionConfig } from '@/services/connection';
import { trpcClient } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startChildMonitoring } from '@/services/childMonitoring';

export default function ChildPairingScreen() {
  const router = useRouter();
  const [pairingCode, setPairingCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    generatePairingCode();
  }, []);

  const generatePairingCode = async () => {
    try {
      setIsLoading(true);
      console.log('[ChildPairing] Generating pairing code');

      const newDeviceId = await generateDeviceId();
      const deviceName = await getDeviceName();
      setDeviceId(newDeviceId);

      const consentData = JSON.parse(await AsyncStorage.getItem('parental_consent') || '{}');
      
      const result = await trpcClient.devices.generatePairingCode.mutate({
        deviceId: newDeviceId,
        childName: consentData.childName || 'Child Device',
      });

      setPairingCode(result.code);
      console.log('[ChildPairing] Pairing code generated:', result.code);

      startPollingForConnection(newDeviceId);
    } catch (error) {
      console.error('[ChildPairing] Error generating pairing code:', error);
      Alert.alert('Error', 'Failed to generate pairing code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startPollingForConnection = async (deviceId: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const result = await trpcClient.devices.checkPairingStatus.query({ deviceId });

        if (result.paired) {
          clearInterval(pollInterval);
          console.log('[ChildPairing] Device paired successfully!');

          await AsyncStorage.setItem('child_pin', result.childPin);
          await AsyncStorage.setItem('parent_device_id', result.parentDeviceId);
          await AsyncStorage.setItem('user_role', 'child');
          
          const deviceName = await getDeviceName();
          await saveConnectionConfig({
            userRole: 'child',
            parentPin: null,
            childPin: result.childPin,
            deviceId: deviceId,
            deviceName: deviceName,
          });

          console.log('[ChildPairing] Starting child monitoring...');
          await startChildMonitoring(deviceId);

          Alert.alert(
            'Connected!',
            'Your device has been successfully paired with parent device. You can now use the calculator.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/'),
              },
            ]
          );
        }
      } catch (error) {
        console.error('[ChildPairing] Error checking pairing status:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        Alert.alert(
          'Pairing Timeout',
          'Pairing code expired. Would you like to generate a new code?',
          [
            {
              text: 'Yes',
              onPress: () => generatePairingCode(),
            },
            {
              text: 'Cancel',
              onPress: () => router.replace('/'),
            },
          ]
        );
      }
    }, 5000);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Generating pairing code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <QrCode size={64} color="#10b981" />
        </View>

        <Text style={styles.title}>Pairing Code</Text>
        <Text style={styles.subtitle}>
          Share this code with your parent/guardian
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{pairingCode}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 Waiting for Connection</Text>
          <Text style={styles.infoText}>
            Your parent will enter this code on their device to connect and set up your calculator PIN.{'\n\n'}
            Code expires in 5 minutes.{'\n\n'}
            Keep this screen open until paired.
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.pulsingDot} />
          <Text style={styles.statusText}>Waiting for parent to pair...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 48,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  codeText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#10b981',
    letterSpacing: 8,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#93c5fd',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
});
