import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, AlertCircle, Users, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/store/vaultStore';

export default function ConsentScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [parentName, setParentName] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    setStep('details');
  };

  const handleGrantConsent = async () => {
    if (!userRole) {
      Alert.alert('Required', 'Please select a role');
      return;
    }

    if (userRole === 'parent' && !parentName.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    if (userRole === 'child') {
      if (!parentName.trim()) {
        Alert.alert('Required', 'Please enter parent/guardian name');
        return;
      }
      if (!childName.trim()) {
        Alert.alert('Required', 'Please enter your name');
        return;
      }
    }

    if (!agreedToTerms) {
      Alert.alert('Required', 'Please agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[Consent] Saving consent information for role:', userRole);
      
      const consentData = {
        userRole,
        parentName: parentName.trim(),
        childName: userRole === 'child' ? childName.trim() : '',
        consentDate: new Date().toISOString(),
        agreedToTerms: true,
        version: '1.0',
      };

      await AsyncStorage.setItem('parental_consent', JSON.stringify(consentData));
      await AsyncStorage.setItem('user_role', userRole);
      
      console.log('[Consent] Consent granted successfully');
      
      const message = userRole === 'parent' 
        ? 'Parent mode enabled. You can monitor connected child devices.'
        : 'Child mode enabled with parental consent. Monitoring is active for safety.';
      
      Alert.alert(
        'Setup Complete',
        message,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/setup'),
          },
        ]
      );
    } catch (error) {
      console.error('[Consent] Error saving consent:', error);
      Alert.alert('Error', 'Failed to save consent information');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={64} color="#10b981" />
            </View>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>
              Are you setting up as a parent or child?
            </Text>
          </View>

          <View style={styles.form}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelection('parent')}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: '#3b82f6' }]}>
                <Users size={48} color="#ffffff" />
              </View>
              <Text style={styles.roleTitle}>Parent/Guardian</Text>
              <Text style={styles.roleDescription}>
                Monitor and connect to child devices. View activity logs and control settings.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelection('child')}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: '#10b981' }]}>
                <User size={48} color="#ffffff" />
              </View>
              <Text style={styles.roleTitle}>Child</Text>
              <Text style={styles.roleDescription}>
                This device will be monitored by a parent/guardian for safety with full consent.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
            {userRole === 'parent' ? (
              <Users size={64} color="#3b82f6" />
            ) : (
              <User size={64} color="#10b981" />
            )}
          </View>
          <Text style={styles.title}>
            {userRole === 'parent' ? 'Parent Setup' : 'Child Setup'}
          </Text>
          <Text style={styles.subtitle}>
            {userRole === 'parent' 
              ? 'Set up monitoring for your child devices'
              : 'Parental monitoring with consent'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.infoBox}>
            <AlertCircle size={20} color="#f59e0b" />
            <Text style={styles.infoText}>
              {userRole === 'parent'
                ? 'You can monitor connected child devices including activity logs, audio monitoring, and remote control.'
                : 'This app provides parental monitoring with full consent. All monitoring is for safety purposes.'}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={userRole === 'parent' ? 'Your Full Name' : 'Parent/Guardian Full Name'}
              placeholderTextColor="#6b7280"
              value={parentName}
              onChangeText={setParentName}
              autoCapitalize="words"
            />
          </View>

          {userRole === 'child' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Your Full Name (Child)"
                placeholderTextColor="#6b7280"
                value={childName}
                onChangeText={setChildName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              {userRole === 'parent' 
                ? '• Use monitoring responsibly and legally\n• Obtain consent before monitoring any device\n• Data is stored securely and privately\n• Remote control requires child device consent\n• All monitoring complies with local laws\n• Respect privacy and use for safety only'
                : '• This app is for legal parental monitoring only\n• You are aware monitoring is active\n• Audio monitoring is for safety purposes\n• Device activity is logged for parental review\n• All monitoring complies with local laws\n• Data is stored securely on device'}
            </Text>

            <View style={styles.switchContainer}>
              <Switch
                value={agreedToTerms}
                onValueChange={setAgreedToTerms}
                trackColor={{ false: '#4b5563', true: '#10b981' }}
                thumbColor={agreedToTerms ? '#ffffff' : '#9ca3af'}
              />
              <Text style={styles.switchLabel}>
                I agree to the terms and conditions
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('role')}
          >
            <Text style={styles.backButtonText}>← Back to Role Selection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!agreedToTerms || isLoading) && styles.buttonDisabled]}
            onPress={handleGrantConsent}
            disabled={!agreedToTerms || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Grant Consent & Continue'}
            </Text>
          </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#78350f',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#fef3c7',
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 4,
  },
  input: {
    fontSize: 16,
    color: '#ffffff',
  },
  termsBox: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  roleCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8b5cf6',
  },
});
