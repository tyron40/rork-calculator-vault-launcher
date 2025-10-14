import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Shield, Eye, Settings as SettingsIcon, Smartphone } from 'lucide-react-native';
import { setOnboardingComplete } from '@/services/storage';
import { openLauncherSettings } from '@/services/apps';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleComplete = async () => {
    try {
      await setOnboardingComplete();
      router.replace('/');
    } catch (error) {
      console.error('[Onboarding] Error completing onboarding:', error);
    }
  };

  const handleOpenSettings = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'iOS Note',
        'iOS does not support custom launchers. This app works as a standalone vault for hiding apps from view.'
      );
      return;
    }
    
    try {
      await openLauncherSettings();
    } catch (error) {
      console.error('[Onboarding] Error opening settings:', error);
      Alert.alert(
        'Manual Setup Required',
        'Go to Settings > Apps > Default apps > Home app and select Calculator Vault Launcher'
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Home size={64} color="#8b5cf6" />
        </View>
        <Text style={styles.title}>Welcome to Calculator Vault</Text>
        <Text style={styles.subtitle}>
          {Platform.OS === 'android' 
            ? "Your apps are now protected. Here's how it works:"
            : "Secure your apps with a calculator disguise. Here's how it works:"}
        </Text>
      </View>

      <View style={styles.steps}>
        {Platform.OS === 'android' && (
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Shield size={32} color="#8b5cf6" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>1. Set as Default Launcher</Text>
              <Text style={styles.stepText}>
                Make this app your home screen to hide apps from others
              </Text>
              <TouchableOpacity style={styles.linkButton} onPress={handleOpenSettings}>
                <SettingsIcon size={16} color="#8b5cf6" />
                <Text style={styles.linkText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {Platform.OS === 'ios' && (
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Smartphone size={32} color="#8b5cf6" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>1. iOS Privacy Mode</Text>
              <Text style={styles.stepText}>
                iOS doesn&apos;t support custom launchers, but you can still use this app to organize and hide apps from view
              </Text>
            </View>
          </View>
        )}

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Eye size={32} color="#8b5cf6" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{Platform.OS === 'android' ? '2' : '2'}. Unlock the Vault</Text>
            <Text style={styles.stepText}>
              Type your PIN on the calculator and press = to access hidden apps
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Home size={32} color="#8b5cf6" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{Platform.OS === 'android' ? '3' : '3'}. {Platform.OS === 'android' ? 'Hide Apps' : 'Organize Apps'}</Text>
            <Text style={styles.stepText}>
              {Platform.OS === 'android'
                ? "Select which apps to hide from the launcher. They'll only appear in your vault"
                : "Mark apps as hidden to organize them in your vault. On iOS, this is for personal organization only."}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
        <Text style={styles.disclaimerText}>
          {Platform.OS === 'android' ? (
            '• This app hides apps from the launcher, not from the system\n' +
            '• Hidden apps can still be accessed after unlocking\n' +
            '• To switch back: Settings → Apps → Default apps → Home app\n' +
            '• This is for privacy, not security enforcement'
          ) : (
            '• iOS does not support custom launchers\n' +
            '• This app provides a calculator disguise for organizing apps\n' +
            '• Apps are organized within the vault for your convenience\n' +
            '• This is for personal organization, not system-level hiding'
          )}
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
