import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Users, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVaultStore, UserRole } from '@/store/vaultStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUserRole: setStoreUserRole } = useVaultStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleContinue = async () => {
    if (!selectedRole) {
      return;
    }

    try {
      console.log('[RoleSelection] Setting user role:', selectedRole);
      await AsyncStorage.setItem('user_role', selectedRole);
      setStoreUserRole(selectedRole);
      
      router.replace('/setup');
    } catch (error) {
      console.error('[RoleSelection] Error saving role:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Users size={64} color="#8b5cf6" />
        </View>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Are you setting up this device as a parent or child?
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
            Parent Device
          </Text>
          
          <Text style={[
            styles.optionDescription,
            selectedRole === 'parent' && styles.optionDescriptionSelected,
          ]}>
            Monitor and control child devices with full parental control features
          </Text>

          <View style={styles.featureList}>
            <Text style={[
              styles.featureItem,
              selectedRole === 'parent' && styles.featureItemSelected,
            ]}>
              • Live audio monitoring
            </Text>
            <Text style={[
              styles.featureItem,
              selectedRole === 'parent' && styles.featureItemSelected,
            ]}>
              • Camera access
            </Text>
            <Text style={[
              styles.featureItem,
              selectedRole === 'parent' && styles.featureItemSelected,
            ]}>
              • Remote control
            </Text>
            <Text style={[
              styles.featureItem,
              selectedRole === 'parent' && styles.featureItemSelected,
            ]}>
              • Activity tracking
            </Text>
          </View>
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
            Child Device
          </Text>
          
          <Text style={[
            styles.optionDescription,
            selectedRole === 'child' && styles.optionDescriptionSelected,
          ]}>
            This device will be monitored by a parent with full consent
          </Text>

          <View style={styles.featureList}>
            <Text style={[
              styles.featureItem,
              selectedRole === 'child' && styles.featureItemSelected,
            ]}>
              • Calculator disguise
            </Text>
            <Text style={[
              styles.featureItem,
              selectedRole === 'child' && styles.featureItemSelected,
            ]}>
              • Secure PIN access
            </Text>
            <Text style={[
              styles.featureItem,
              selectedRole === 'child' && styles.featureItemSelected,
            ]}>
              • Pairing code
            </Text>
            <Text style={[
              styles.featureItem,
              selectedRole === 'child' && styles.featureItemSelected,
            ]}>
              • Safety monitoring
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedRole && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selectedRole}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <ArrowRight size={20} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Both roles require parental consent. The app is designed for legal parental monitoring with full transparency.
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
    marginBottom: 40,
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
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#2d3142',
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  optionIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionBadge: {
    width: 32,
    height: 32,
  },
  checkmark: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#8b5cf6',
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  optionTitleSelected: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 15,
    color: '#9ca3af',
    lineHeight: 22,
    marginBottom: 16,
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  featureItemSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
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
