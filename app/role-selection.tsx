import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Users, ArrowRight, Calculator } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVaultStore, UserRole } from '@/store/vaultStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUserRole: setStoreUserRole } = useVaultStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [loginPin, setLoginPin] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);

  const checkIfSetupNeeded = useCallback(async () => {
    try {
      const parentPin = await AsyncStorage.getItem('parent_pin');
      const childPin = await AsyncStorage.getItem('child_pin');
      const userRole = await AsyncStorage.getItem('user_role');
      
      if (!parentPin && !childPin && !userRole) {
        setIsSettingUp(true);
      } else {
        setIsSettingUp(false);
      }
    } catch (error) {
      console.error('[RoleSelection] Error checking setup:', error);
    }
  }, []);

  React.useEffect(() => {
    checkIfSetupNeeded();
  }, [checkIfSetupNeeded]);

  const handleSetup = async () => {
    if (!selectedRole) {
      Alert.alert('Select Role', 'Please select whether this is a parent or child device');
      return;
    }

    if (!loginPin || loginPin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter a PIN with at least 4 digits');
      return;
    }

    try {
      console.log('[RoleSelection] Setting up device with role:', selectedRole);
      
      await AsyncStorage.setItem('access_pin', loginPin);
      await AsyncStorage.setItem('user_role', selectedRole);
      
      if (selectedRole === 'parent') {
        await AsyncStorage.setItem('parent_pin', loginPin);
        console.log('[RoleSelection] Parent PIN saved');
      } else {
        await AsyncStorage.setItem('child_pin', loginPin);
        console.log('[RoleSelection] Child PIN saved');
      }
      
      setStoreUserRole(selectedRole);
      
      console.log('[RoleSelection] Setup complete, redirecting to', selectedRole === 'parent' ? 'parent dashboard' : 'child dashboard');
      
      if (selectedRole === 'parent') {
        router.replace('/parent');
      } else {
        router.replace('/child');
      }
    } catch (error) {
      console.error('[RoleSelection] Error during setup:', error);
      Alert.alert('Setup Failed', 'Failed to configure device. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      Alert.alert('Select Role', 'Please select your role to continue');
      return;
    }

    if (!loginPin || loginPin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter your PIN');
      return;
    }

    try {
      console.log('[RoleSelection] Attempting login as:', selectedRole);
      
      const storedPin = selectedRole === 'parent' 
        ? await AsyncStorage.getItem('parent_pin')
        : await AsyncStorage.getItem('child_pin');

      console.log('[RoleSelection] Stored PIN exists:', !!storedPin);

      if (loginPin !== storedPin) {
        Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect');
        setLoginPin('');
        return;
      }

      await AsyncStorage.setItem('user_role', selectedRole);
      await AsyncStorage.setItem('access_pin', loginPin);
      setStoreUserRole(selectedRole);
      
      console.log('[RoleSelection] Login successful, redirecting to', selectedRole === 'parent' ? 'parent dashboard' : 'child dashboard');
      
      if (selectedRole === 'parent') {
        router.replace('/parent');
      } else {
        router.replace('/child');
      }
    } catch (error) {
      console.error('[RoleSelection] Error during login:', error);
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    }
  };

  const handleCalculatorDisguise = async () => {
    await AsyncStorage.setItem('calculator_disguise_mode', 'true');
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={64} color="#8b5cf6" />
          </View>
          <Text style={styles.title}>Parental Control</Text>
          <Text style={styles.subtitle}>
            {isSettingUp ? 'Set up your device' : 'Login to continue'}
          </Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedRole === 'parent' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedRole('parent')}
            activeOpacity={0.8}
          >
            <View style={styles.optionHeader}>
              <View style={[
                styles.optionIcon,
                selectedRole === 'parent' && styles.optionIconSelected,
              ]}>
                <Shield size={32} color={selectedRole === 'parent' ? '#ffffff' : '#3b82f6'} />
              </View>
              <View style={styles.optionBadge}>
                {selectedRole === 'parent' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={[
              styles.optionTitle,
              selectedRole === 'parent' && styles.optionTitleSelected,
            ]}>
              Parent
            </Text>
            
            <Text style={[
              styles.optionDescription,
              selectedRole === 'parent' && styles.optionDescriptionSelected,
            ]}>
              Full monitoring and control features
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedRole === 'child' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedRole('child')}
            activeOpacity={0.8}
          >
            <View style={styles.optionHeader}>
              <View style={[
                styles.optionIcon,
                selectedRole === 'child' && styles.optionIconSelected,
              ]}>
                <Users size={32} color={selectedRole === 'child' ? '#ffffff' : '#10b981'} />
              </View>
              <View style={styles.optionBadge}>
                {selectedRole === 'child' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={[
              styles.optionTitle,
              selectedRole === 'child' && styles.optionTitleSelected,
            ]}>
              Child
            </Text>
            
            <Text style={[
              styles.optionDescription,
              selectedRole === 'child' && styles.optionDescriptionSelected,
            ]}>
              Monitored device with parental consent
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>
            {isSettingUp ? 'Create PIN' : 'Enter PIN'}
          </Text>
          <TextInput
            style={styles.pinInput}
            value={loginPin}
            onChangeText={setLoginPin}
            placeholder="Enter 4+ digit PIN"
            placeholderTextColor="#6b7280"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={8}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            (!selectedRole || !loginPin || loginPin.length < 4) && styles.loginButtonDisabled,
          ]}
          onPress={isSettingUp ? handleSetup : handleLogin}
          disabled={!selectedRole || !loginPin || loginPin.length < 4}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {isSettingUp ? 'Complete Setup' : 'Login'}
          </Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>

        {!isSettingUp && (
          <TouchableOpacity
            style={styles.disguiseButton}
            onPress={handleCalculatorDisguise}
            activeOpacity={0.8}
          >
            <Calculator size={20} color="#8b5cf6" />
            <Text style={styles.disguiseButtonText}>
              Switch to Calculator Disguise
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ This app requires parental consent and is designed for legal parental monitoring with full transparency.
          </Text>
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 48,
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
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  options: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#a78bfa',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionBadge: {
    width: 24,
    height: 24,
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#8b5cf6',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 6,
  },
  optionTitleSelected: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pinSection: {
    marginBottom: 24,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  pinInput: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#3f4453',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  disguiseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  disguiseButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#8b5cf6',
  },
  infoBox: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    textAlign: 'center',
  },
});
