import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Shield, QrCode } from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';
import { initializeVault } from '@/services/storage';
import { saveConnectionConfig, generateDeviceId, getDeviceName, generatePairingCode, savePairingCode } from '@/services/connection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/store/vaultStore';

export default function SetupScreen() {
  const router = useRouter();
  const { setLocked, setCurrentPin, setUserRole: setStoreUserRole } = useVaultStore();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [parentPin, setParentPin] = useState<string>('0000');
  const [confirmParentPin, setConfirmParentPin] = useState<string>('0000');
  const [childPin, setChildPin] = useState<string>('0000');
  const [confirmChildPin, setConfirmChildPin] = useState<string>('0000');
  const [pairingCode, setPairingCode] = useState<string>('');
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
    const normalized = String(pin || '').trim().replace(/[^0-9]/g, '');
    console.log('[Setup] normalizePin input:', JSON.stringify(pin), 'output:', JSON.stringify(normalized));
    return normalized;
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

      if (trimmedParentPin !== trimmedConfirmParentPin) {
        Alert.alert('PIN Mismatch', 'Parent PINs do not match');
        return;
      }

      if (trimmedChildPin.length < 4) {
        Alert.alert('Invalid PIN', 'Child PIN must be at least 4 digits');
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

      if (!pairingCode.trim()) {
        Alert.alert('Required', 'Please enter the pairing code from parent device (or skip for later)');
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
        
        console.log('[Setup] Saving PINs - Parent:', JSON.stringify(normalizedParentPin), 'Child:', JSON.stringify(normalizedChildPin));
        console.log('[Setup] Parent PIN length:', normalizedParentPin.length, 'bytes:', Array.from(normalizedParentPin).map(c => c.charCodeAt(0)));
        console.log('[Setup] Child PIN length:', normalizedChildPin.length, 'bytes:', Array.from(normalizedChildPin).map(c => c.charCodeAt(0)));
        
        await initializeVault(normalizedParentPin);
        await AsyncStorage.setItem('parent_pin', normalizedParentPin);
        await AsyncStorage.setItem('child_pin', normalizedChildPin);
        await AsyncStorage.setItem('access_pin', normalizedParentPin);
        await AsyncStorage.setItem('user_role', 'parent');
        
        const verifyParent = await AsyncStorage.getItem('parent_pin');
        const verifyChild = await AsyncStorage.getItem('child_pin');
        console.log('[Setup] Verification - Parent PIN stored:', JSON.stringify(verifyParent), 'length:', verifyParent?.length);
        console.log('[Setup] Verification - Child PIN stored:', JSON.stringify(verifyChild), 'length:', verifyChild?.length);
        
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
        console.log('[Setup] Saving Child PIN:', JSON.stringify(normalizedChildPin), 'length:', normalizedChildPin.length, 'bytes:', Array.from(normalizedChildPin).map(c => c.charCodeAt(0)));
        
        await initializeVault(normalizedChildPin);
        await AsyncStorage.setItem('child_pin', normalizedChildPin);
        await AsyncStorage.setItem('access_pin', normalizedChildPin);
        await AsyncStorage.setItem('user_role', 'child');
        
        const verifyChild = await AsyncStorage.getItem('child_pin');
        console.log('[Setup] Verification - Child PIN stored:', JSON.stringify(verifyChild), 'length:', verifyChild?.length);
        
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

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👶 Child PIN</Text>
                <Text style={styles.sectionDescription}>
                  Regular calculator access (vault hidden)
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
                  You'll receive a pairing code after setup to share with parent
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
              💡 Default PIN is &quot;0000&quot; for all devices.
              {userRole === 'parent' 
                ? ' You can change both PINs if needed. Parent PIN opens monitoring, child PIN opens calculator only.'
                : ' You can change the PIN if needed. To unlock, type it on the calculator and press ='}
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
