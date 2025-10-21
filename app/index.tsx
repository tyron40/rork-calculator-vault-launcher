import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import CalculatorPad from '@/components/CalculatorPad';
import { useVaultStore } from '@/store/vaultStore';
import { verifyPin, isVaultInitialized, getHiddenApps } from '@/services/storage';
import { getInstalledApps } from '@/services/apps';
import { hasParentalConsent, logActivity } from '@/services/monitoring';

export default function CalculatorScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const { 
    setLocked, 
    setCurrentPin, 
    setInstalledApps, 
    setHiddenApps,
    setDecoyMode 
  } = useVaultStore();

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      console.log('[Calculator] Checking vault initialization');
      
      const hasConsent = await hasParentalConsent();
      if (!hasConsent) {
        console.log('[Calculator] No parental consent found, redirecting to consent screen');
        router.replace('/consent');
        setIsLoading(false);
        return;
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
      
      const isMainPin = await verifyPin(pin, false);
      const isDecoyPin = await verifyPin(pin, true);
      
      if (isMainPin || isDecoyPin) {
        console.log('[Calculator] PIN verified, unlocking vault');
        
        setCurrentPin(pin);
        setDecoyMode(isDecoyPin);
        setLocked(false);
        
        const hiddenApps = await getHiddenApps(pin, isDecoyPin);
        setHiddenApps(hiddenApps);
        
        await logActivity('app_opened', `Vault unlocked ${isDecoyPin ? '(decoy mode)' : '(main mode)'}`);
        
        router.push('/vault');
      } else {
        console.log('[Calculator] Invalid PIN');
        await logActivity('app_opened', 'Failed PIN attempt');
      }
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
