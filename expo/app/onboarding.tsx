import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Shield, Eye } from 'lucide-react-native';
import { setOnboardingComplete } from '@/services/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVaultStore } from '@/store/vaultStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const { isLocked } = useVaultStore();

  const handleComplete = async () => {
    try {
      await setOnboardingComplete();
      
      const roleStr = await AsyncStorage.getItem('user_role');
      const userRole = roleStr as 'parent' | 'child' | null;
      
      if (userRole === 'parent' && !isLocked) {
        console.log('[Onboarding] Redirecting to parent dashboard');
        router.replace('/parent');
      } else if (userRole === 'child' && !isLocked) {
        console.log('[Onboarding] Redirecting to child dashboard');
        router.replace('/child');
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('[Onboarding] Error completing onboarding:', error);
      router.replace('/');
    }
  };



  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Home size={64} color="#8b5cf6" />
        </View>
        <Text style={styles.title}>Welcome to Parental Control</Text>
        <Text style={styles.subtitle}>
          Your family device app is ready. Here&apos;s how the calculator and pairing views work:
        </Text>
      </View>

      <View style={styles.steps}>
        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Shield size={32} color="#8b5cf6" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>1. Optional calculator view</Text>
            <Text style={styles.stepText}>
              Use the calculator for calculations. A visible Account dashboard button stays available while using it.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Eye size={32} color="#8b5cf6" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>2. Account dashboard</Text>
            <Text style={styles.stepText}>
              Open the dashboard from the visible button and sign in with your PIN.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Home size={32} color="#8b5cf6" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>3. Pair devices</Text>
            <Text style={styles.stepText}>
              Pairing shares device connection status. This release does not stream screen, camera, or microphone and does not offer remote control.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
        <Text style={styles.disclaimerText}>
          • Pairing and sharing are visible to both device users{"\n"}
          • Live sharing is not available in this release{"\n"}
          • Future sharing sessions must be started and approved on the device
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  steps: {
    gap: 24,
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
  },
  stepIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#2d3142',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8b5cf6',
  },
  disclaimer: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});
