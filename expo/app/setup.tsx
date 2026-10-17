import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Shield, QrCode } from 'lucide-react-native';
import { useVaultStore, UserRole } from '@/store/vaultStore';
import { initializeVault } from '@/services/storage';
import { saveConnectionConfig, generateDeviceId, getDeviceName, generatePairingCode, savePairingCode } from '@/services/connection';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetupScreen() {
  const router = useRouter();
  const { setLocked, setCurrentPin, setUserRole: setStoreUserRole } = useVaultStore();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [parentPin, setParentPin] = useState<string>('');
  const [confirmParentPin, setConfirmParentPin] = useState<string>('');
  const [childPin, setChildPin] = useState<string>('');
  const [confirmChildPin, setConfirmChildPin] = useState<string>('');

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

  const normalizePin = (pin: string): string => {
    return String(pin || '').trim().replace(/[^0-9]/g, '');
  };

  const handleSetup = async () => {
    if (userRole === 'parent') {
      const trimmedParentPin = normalizePin(parentPin);
      const trimmedConfirmParentPin = normalizePin(confirmParentPin);
      const trimmedChildPin = normalizePin(childPin);
      const trimmedConfirmChildPin = normalizePin(confirmChildPin);
      
      if (trimmedParentPin.length < 4) {
        Alert.alert('Invalid PIN', 'Parent PIN must be at least 4 digits');
        return;
      }

      if (trimmedParentPin === '0000' || trimmedChildPin === '0000' || trimmedParentPin === trimmedChildPin) {
        Alert.alert('Choose different PINs', 'Use two different PINs and avoid the default PIN 0000.');
        return;
      }

      if (trimmedParentPin !== trimmedConfirmParentPin) {
        Alert.alert('PIN Mismatch', 'Parent PINs do not match');
        return;
      }

      if (trimmedChildPin.length < 4) {
        Alert.alert('Invalid PIN', 'Child PIN must be at least 4 digits');
        return;
      }

      if (trimmedChildPin === '0000') {
        Alert.alert('Choose a stronger PIN', 'Avoid the default PIN 0000.');
        return;
      }

      if (trimmedChildPin !== trimmedConfirmChildPin) {
        Alert.alert('PIN Mismatch', 'Child PINs do not match');
        return;
      }
    } else {
      const trimmedChildPin = normalizePin(childPin);
      const trimmedConfirmChildPin = normalizePin(confirmChildPin);
      
      if (trimmedChildPin.length < 4) {
        Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
        return;
      }

      if (trimmedChildPin !== trimmedConfirmChildPin) {
        Alert.alert('PIN Mismatch', 'PINs do not match');
        return;
      }
    }

    try {
      setIsLoading(true);
      console.log('[Setup] Initializing vault for role:', userRole);
      
      const deviceId = await generateDeviceId();
      const deviceName = await getDeviceName();

      if (userRole === 'parent') {
        const normalizedParentPin = normalizePin(parentPin);
        const normalizedChildPin = normalizePin(childPin);
        
        console.log('[Setup] Saving parent and child PINs');
        
        await initializeVault(normalizedParentPin);
        await AsyncStorage.setItem('parent_pin', normalizedParentPin);
        await AsyncStorage.setItem('child_pin', normalizedChildPin);
        await AsyncStorage.setItem('access_pin', normalizedParentPin);
        await AsyncStorage.setItem('user_role', 'parent');
        
        const verifyParent = await AsyncStorage.getItem('parent_pin');
        const verifyChild = await AsyncStorage.getItem('child_pin');
        console.log('[Setup] Parent and child PINs stored:', !!verifyParent, !!verifyChild);
        
        await saveConnectionConfig({
          userRole: 'parent',
          parentPin: normalizedParentPin,
          childPin: normalizedChildPin,
          deviceId,
          deviceName,
        });

        console.log('[Setup] Parent vault initialized successfully');
        
        setCurrentPin(normalizedParentPin);
        setLocked(false);
        setStoreUserRole('parent');
        
        router.replace('/onboarding');
      } else {
        const normalizedChildPin = normalizePin(childPin);
        console.log('[Setup] Saving child PIN');
        
        await initializeVault(normalizedChildPin);
        await AsyncStorage.setItem('child_pin', normalizedChildPin);
        await AsyncStorage.setItem('access_pin', normalizedChildPin);
        await AsyncStorage.setItem('user_role', 'child');
        
        const verifyChild = await AsyncStorage.getItem('child_pin');
        console.log('[Setup] Child PIN stored:', !!verifyChild);
        
        const code = await generatePairingCode();
        const consentData = JSON.parse(await AsyncStorage.getItem('parental_consent') || '{}');
        await savePairingCode(code, deviceId, consentData.childName || 'Child Device');
        
        await saveConnectionConfig({
          userRole: 'child',
          parentPin: null,
          childPin: normalizedChildPin,
          deviceId,
          deviceName,
        });

        console.log('[Setup] Child vault initialized with pairing code:', code);
        
        setCurrentPin(normalizedChildPin);
        setLocked(false);
        setStoreUserRole('child');
        
        Alert.alert(
          'Success',
          `Child mode setup complete!\n\nYour Pairing Code: ${code}\n\nShare this code with parent to connect devices.\nCode expires in 5 minutes.`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/onboarding'),
            },
          ]
        );
      }
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
            {userRole === 'parent' ? 'Create Parent & Child PINs' : 'Create Your PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {userRole === 'parent'
              ? 'Set different PINs for parent monitoring and child access'
              : 'Set up your secure PIN and get pairing code'}
          </Text>
        </View>

        <View style={styles.form}>
          {userRole === 'parent' ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👨‍👩‍👧 Parent PIN</Text>
                <Text style={styles.sectionDescription}>
                  Sign in to the parent dashboard
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

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👶 Child PIN</Text>
                <Text style={styles.sectionDescription}>
                  PIN for the child account dashboard. Calculator view remains available separately.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Child PIN (min 4 digits)"
                  placeholderTextColor="#6b7280"
                  value={childPin}
                  onChangeText={setChildPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Child PIN"
                  placeholderTextColor="#6b7280"
                  value={confirmChildPin}
                  onChangeText={setConfirmChildPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔐 Your PIN</Text>
                <Text style={styles.sectionDescription}>
                  Access calculator and monitored features
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter PIN (min 4 digits)"
                  placeholderTextColor="#6b7280"
                  value={childPin}
                  onChangeText={setChildPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm PIN"
                  placeholderTextColor="#6b7280"
                  value={confirmChildPin}
                  onChangeText={setConfirmChildPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>

              <View style={styles.pairingBox}>
                <QrCode size={24} color="#8b5cf6" />
                <Text style={styles.pairingText}>
                  You&apos;ll receive a pairing code after setup to share with parent
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSetup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Vault'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 <Text style={{ fontWeight: '700' as const }}>Create a different PIN for each role.</Text>
              {userRole === 'parent' 
                ? '\n\nParent PIN: Opens parent dashboard\nChild PIN: Opens child dashboard\n\nUse the visible Account dashboard button to sign in. Calculator view does not hide account features.'
                : '\n\nYour PIN opens the child dashboard. Calculator view remains available with a visible dashboard button.'}
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
  pairingBox: {
    flexDirection: 'row',
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  pairingText: {
    flex: 1,
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
});
