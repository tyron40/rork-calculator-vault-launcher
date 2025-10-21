import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConsentScreen() {
  const router = useRouter();
  const [parentName, setParentName] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGrantConsent = async () => {
    if (!parentName.trim()) {
      Alert.alert('Required', 'Please enter parent/guardian name');
      return;
    }

    if (!childName.trim()) {
      Alert.alert('Required', 'Please enter child name');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Required', 'Please agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[Consent] Saving consent information');
      
      const consentData = {
        parentName,
        childName,
        consentDate: new Date().toISOString(),
        agreedToTerms: true,
        version: '1.0',
      };

      await AsyncStorage.setItem('parental_consent', JSON.stringify(consentData));
      
      console.log('[Consent] Consent granted successfully');
      Alert.alert(
        'Consent Granted',
        'Parental monitoring has been enabled. The calculator will continue to function normally while monitoring is active.',
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={64} color="#10b981" />
          </View>
          <Text style={styles.title}>Parental Consent</Text>
          <Text style={styles.subtitle}>
            Legal parental monitoring application
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.infoBox}>
            <AlertCircle size={20} color="#f59e0b" />
            <Text style={styles.infoText}>
              This app provides parental monitoring features with full consent. 
              All parties are aware of the monitoring.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Parent/Guardian Full Name"
              placeholderTextColor="#6b7280"
              value={parentName}
              onChangeText={setParentName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Child Full Name"
              placeholderTextColor="#6b7280"
              value={childName}
              onChangeText={setChildName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              • This app is for legal parental monitoring only{'\n'}
              • The child is aware monitoring is active{'\n'}
              • Audio monitoring is for safety purposes{'\n'}
              • Device activity is logged for parental review{'\n'}
              • All monitoring complies with local laws{'\n'}
              • Data is stored securely on device{'\n'}
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
});
