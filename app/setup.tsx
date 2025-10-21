import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Shield } from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';
import { initializeVault } from '@/services/storage';
import { saveConnectionConfig, generateDeviceId, getDeviceName } from '@/services/connection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/store/vaultStore';

export default function SetupScreen() {
  const router = useRouter();
  const { setLocked, setCurrentPin, setUserRole: setStoreUserRole } = useVaultStore();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [parentPin, setParentPin] = useState<string>('');
  const [confirmParentPin, setConfirmParentPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('user_role') as UserRole;
      setUserRole(role);
      console.log('[Setup] User role:', role);
    } catch (error) {
      console.error('[Setup] Error loading user role:', error);
    }
  };

  const handleSetup = async () => {
    if (userRole === 'parent') {
      if (parentPin.length < 4) {
        Alert.alert('Invalid PIN', 'Parent PIN must be at least 4 digits');
        return;
      }

      if (parentPin !== confirmParentPin) {
        Alert.alert('PIN Mismatch', 'Parent PINs do not match');
        return;
      }
    } else {
      router.replace('/child-pairing');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[Setup] Initializing vault for role:', userRole);
      
      const deviceId = await generateDeviceId();
      const deviceName = await getDeviceName();

      await initializeVault(parentPin);
      await AsyncStorage.setItem('parent_pin', parentPin);
      
      await saveConnectionConfig({
        userRole: 'parent',
        parentPin,
        childPin: null,
        deviceId,
        deviceName,
      });

      console.log('[Setup] Parent vault initialized successfully');
      
      setCurrentPin(parentPin);
      setLocked(false);
      setStoreUserRole('parent');
      
      Alert.alert(
        'Success',
        `Parent mode setup complete!\n\nYour PIN: ${parentPin}\n\nYou can now generate pairing codes to connect child devices.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace('/parent');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Setup] Error initializing vault:', error);
      Alert.alert('Error', 'Failed to create vault');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userRole) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={64} color={userRole === 'parent' ? '#3b82f6' : '#10b981'} />
          </View>
          <Text style={styles.title}>
            {userRole === 'parent' ? 'Create Parent PIN' : 'Child Setup'}
          </Text>
          <Text style={styles.subtitle}>
            {userRole === 'parent'
              ? 'Set your PIN to access the parent dashboard'
              : 'Get your pairing code to connect with parent device'}
          </Text>
        </View>

        <View style={styles.form}>
          {userRole === 'parent' ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👨‍👩‍👧 Parent PIN</Text>
                <Text style={styles.sectionDescription}>
                  Access monitoring dashboard and settings
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Parent PIN (min 4 digits)"
                  placeholderTextColor="#6b7280"
                  value={parentPin}
                  onChangeText={setParentPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Parent PIN"
                  placeholderTextColor="#6b7280"
                  value={confirmParentPin}
                  onChangeText={setConfirmParentPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>
            </>
          ) : (
            <View style={styles.childInfo}>
              <Text style={styles.childInfoTitle}>🔗 Pairing Required</Text>
              <Text style={styles.childInfoText}>
                You'll receive a pairing code that your parent can use to connect and set up your calculator PIN.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSetup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Setting up...' : userRole === 'parent' ? 'Create Account' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 {userRole === 'parent' 
                ? 'Remember your PIN! You\'ll use it to access the parent dashboard.'
                : 'The pairing code will allow your parent to set up monitoring on this device.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1d29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
  },
  form: {
    gap: 12,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  infoBox: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  childInfo: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  childInfoTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  childInfoText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    textAlign: 'center',
  },
});
