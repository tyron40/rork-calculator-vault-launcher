import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import CalculatorPad from '@/components/CalculatorPad';
import { useVaultStore } from '@/store/vaultStore';
import { verifyPin, isVaultInitialized, getHiddenApps } from '@/services/storage';
import { getInstalledApps } from '@/services/apps';
import { hasParentalConsent, logActivity } from '@/services/monitoring';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConnectionConfig, generateDeviceId } from '@/services/connection';
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
    setHiddenApps,
    setDecoyMode,
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
        const autoLoginEnabled = await AsyncStorage.getItem('auto_login_enabled');
        const savedPin = await AsyncStorage.getItem('saved_login_pin');
        
        if (autoLoginEnabled === 'true' && savedPin && userRole === 'parent') {
          console.log('[Calculator] Auto-login enabled, logging in automatically');
          setCurrentPin(savedPin);
          setLocked(false);
          
          const apps = await getInstalledApps();
          setInstalledApps(apps);
          await logActivity('app_opened', 'Parent dashboard auto-login');
          
          router.replace('/parent');
          setIsLoading(false);
          return;
        }
        
        const apps = await getInstalledApps();
        setInstalledApps(apps);
        await logActivity('app_opened', 'Calculator app opened');
        
        if (userRole === 'child') {
          const config = await getConnectionConfig();
          if (config && config.deviceId) {
            await startChildMonitoring(config.deviceId);
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
          
          await AsyncStorage.setItem('auto_login_enabled', 'true');
          await AsyncStorage.setItem('saved_login_pin', pin);
          
          await logActivity('app_opened', 'Parent dashboard accessed');
          router.push('/parent');
          return;
        }
      } else {
        if (childPin && pin === childPin) {
          console.log('[Calculator] Child PIN verified, unlocking vault');
          
          setCurrentPin(pin);
          setLocked(false);
          
          const hiddenApps = await getHiddenApps(pin, false);
          setHiddenApps(hiddenApps);
          
          await logActivity('app_opened', 'Vault unlocked (child device)');
          
          router.push('/vault');
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
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
});
