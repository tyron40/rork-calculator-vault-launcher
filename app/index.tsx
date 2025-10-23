import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import CalculatorPad from '@/components/CalculatorPad';
import { useVaultStore } from '@/store/vaultStore';
import { isVaultInitialized } from '@/services/storage';
import { getInstalledApps } from '@/services/apps';
import { hasParentalConsent, logActivity } from '@/services/monitoring';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConnectionConfig } from '@/services/connection';
import { startChildMonitoring } from '@/services/childMonitoring';
import { UserRole } from '@/store/vaultStore';

export default function CalculatorScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const { 
    setLocked, 
    setCurrentPin, 
    setInstalledApps,
    setUserRole,
  } = useVaultStore();

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      console.log('[Calculator] Checking vault initialization');
      
      const disguiseMode = await AsyncStorage.getItem('calculator_disguise_mode');
      if (disguiseMode === 'true') {
        console.log('[Calculator] Disguise mode active, redirecting to disguise calculator');
        router.replace('/disguise');
        setIsLoading(false);
        return;
      }
      
      const hasConsent = await hasParentalConsent();
      if (!hasConsent) {
        console.log('[Calculator] No parental consent found, redirecting to consent screen');
        router.replace('/consent');
        setIsLoading(false);
        return;
      }
      
      const roleStr = await AsyncStorage.getItem('user_role');
      const userRole = roleStr as UserRole;
      if (userRole) {
        setUserRole(userRole);
        console.log('[Calculator] User role loaded:', userRole);
      }
      
      const initialized = await isVaultInitialized();
      setIsInitialized(initialized);
      
      if (!initialized) {
        console.log('[Calculator] Vault not initialized, redirecting to setup');
        router.replace('/setup');
      } else {
        const apps = await getInstalledApps();
        setInstalledApps(apps);
        await logActivity('app_opened', 'Calculator app opened');
        
        if (userRole === 'child') {
          const config = await getConnectionConfig();
          const parentDeviceId = await AsyncStorage.getItem('parent_device_id');
          if (config && config.deviceId && parentDeviceId) {
            await startChildMonitoring(config.deviceId, parentDeviceId);
            console.log('[Calculator] Child monitoring started');
          }
        }
      }
    } catch (error) {
      console.error('[Calculator] Error checking initialization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinEntered = async (pin: string) => {
    try {
      console.log('[Calculator] Verifying PIN');
      
      const roleStr = await AsyncStorage.getItem('user_role');
      const userRole = roleStr as UserRole;
      
      const parentPin = await AsyncStorage.getItem('parent_pin');
      const childPin = await AsyncStorage.getItem('child_pin');
      
      if (userRole === 'parent') {
        if (pin === parentPin) {
          console.log('[Calculator] Parent PIN verified, opening parent dashboard');
          
          setCurrentPin(pin);
          setLocked(false);
          
          await logActivity('app_opened', 'Parent dashboard accessed');
          router.push('/parent');
          return;
        } else if (pin === childPin) {
          console.log('[Calculator] Child PIN verified (parent device), redirecting to calculator');
          
          setCurrentPin(pin);
          setLocked(false);
          
          await logActivity('app_opened', 'Calculator mode accessed (parent device)');
          
          Alert.alert(
            'Calculator Mode',
            'Accessing calculator in regular mode.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/disguise');
                },
              },
            ]
          );
          return;
        }
      } else {
        const childPin = await AsyncStorage.getItem('child_pin');
        
        if (pin === childPin) {
          console.log('[Calculator] Child PIN verified, showing monitoring status');
          
          setCurrentPin(pin);
          setLocked(false);
          
          await logActivity('app_opened', 'Child device accessed');
          
          Alert.alert(
            'Device Monitored',
            'This device is monitored for your safety with parental consent. Continue using the calculator normally.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/disguise');
                },
              },
            ]
          );
          return;
        }
      }
      
      console.log('[Calculator] Invalid PIN');
      await logActivity('app_opened', 'Failed PIN attempt');
    } catch (error) {
      console.error('[Calculator] Error verifying PIN:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CalculatorPad onPinEntered={handlePinEntered} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
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
    color: '#ffffff',
  },
});
