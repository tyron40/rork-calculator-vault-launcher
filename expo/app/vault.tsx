import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Grid, List, Settings as SettingsIcon, Mic, Activity, BarChart3 } from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';
import AppGrid from '@/components/AppGrid';
import SearchBar from '@/components/SearchBar';
import { launchApp, InstalledApp } from '@/services/apps';
import { saveHiddenApps } from '@/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  startAudioMonitoring, 
  stopAudioMonitoring, 
  logActivity 
} from '@/services/monitoring';

export default function VaultScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'hidden' | 'all' | 'settings'>('hidden');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const { 
    isLocked,
    currentPin,
    isDecoyMode,
    installedApps, 
    hiddenApps,
    setLocked,
    addHiddenApp,
    removeHiddenApp,
    monitoringSettings,
    updateMonitoringSettings,
  } = useVaultStore();

  useEffect(() => {
    if (isLocked || !currentPin) {
      router.replace('/');
    }
  }, [isLocked, currentPin, router]);

  const handleLock = () => {
    setLocked(true);
    router.replace('/');
  };

  const handleAppPress = async (app: InstalledApp) => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        app.label,
        'iOS does not allow launching other apps directly. This is a demonstration of the vault organization feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      console.log('[Vault] Launching app:', app.packageName);
      await launchApp(app.packageName);
    } catch (error) {
      console.error('[Vault] Error launching app:', error);
      Alert.alert('Error', 'Failed to launch app');
    }
  };

  const handleAppLongPress = async (app: InstalledApp) => {
    const isHidden = hiddenApps.includes(app.packageName);
    
    Alert.alert(
      isHidden ? 'Unhide App' : 'Hide App',
      `${isHidden ? 'Unhide' : 'Hide'} ${app.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isHidden ? 'Unhide' : 'Hide',
          onPress: async () => {
            try {
              if (isHidden) {
                removeHiddenApp(app.packageName);
              } else {
                addHiddenApp(app.packageName);
              }
              
              if (currentPin) {
                const updatedHiddenApps = isHidden
                  ? hiddenApps.filter(pkg => pkg !== app.packageName)
                  : [...hiddenApps, app.packageName];
                
                await saveHiddenApps(currentPin, updatedHiddenApps, isDecoyMode);
              }
            } catch (error) {
              console.error('[Vault] Error updating hidden apps:', error);
              Alert.alert('Error', 'Failed to update hidden apps');
            }
          },
        },
      ]
    );
  };

  const hiddenAppsList = useMemo(() => {
    return installedApps.filter(app => hiddenApps.includes(app.packageName));
  }, [installedApps, hiddenApps]);



  const filteredHiddenApps = useMemo(() => {
    if (!searchQuery) return hiddenAppsList;
    return hiddenAppsList.filter(app =>
      app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hiddenAppsList, searchQuery]);

  const filteredAllApps = useMemo(() => {
    if (!searchQuery) return installedApps;
    return installedApps.filter(app =>
      app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [installedApps, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isDecoyMode ? '🎭 Decoy Vault' : '🔐 Vault'}
        </Text>
        <TouchableOpacity style={styles.lockButton} onPress={handleLock}>
          <Lock size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hidden' && styles.tabActive]}
          onPress={() => setActiveTab('hidden')}
        >
          <Grid size={20} color={activeTab === 'hidden' ? '#8b5cf6' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'hidden' && styles.tabTextActive]}>
            Hidden ({hiddenAppsList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <List size={20} color={activeTab === 'all' ? '#8b5cf6' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All Apps
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} color={activeTab === 'settings' ? '#8b5cf6' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab !== 'settings' && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab === 'hidden' ? 'hidden' : 'all'} apps...`}
        />
      )}

      {activeTab === 'hidden' && (
        <View style={styles.content}>
          {filteredHiddenApps.length === 0 ? (
            <View style={styles.emptyState}>
              <Grid size={64} color="#4a4e69" />
              <Text style={styles.emptyTitle}>No Hidden Apps</Text>
              <Text style={styles.emptyText}>
                Long press any app in &quot;All Apps&quot; to hide it
              </Text>
            </View>
          ) : (
            <AppGrid
              apps={filteredHiddenApps}
              onAppPress={handleAppPress}
              onAppLongPress={handleAppLongPress}
            />
          )}
        </View>
      )}

      {activeTab === 'all' && (
        <View style={styles.content}>
          <AppGrid
            apps={filteredAllApps}
            onAppPress={handleAppPress}
            onAppLongPress={handleAppLongPress}
          />
        </View>
      )}

      {activeTab === 'settings' && (
        <View style={styles.settingsContent}>
          <Text style={styles.settingsTitle}>Monitoring Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingHeader}>
                  <Mic size={20} color="#8b5cf6" />
                  <Text style={styles.settingLabel}>Audio Monitoring</Text>
                </View>
                <Text style={styles.settingDescription}>
                  {Platform.OS === 'web' 
                    ? 'Audio monitoring is not available on web'
                    : 'Record audio from device microphone'}
                </Text>
              </View>
              <Switch
                value={monitoringSettings.audioMonitoringEnabled}
                onValueChange={async (value) => {
                  if (Platform.OS === 'web') {
                    Alert.alert('Not Available', 'Audio monitoring is not supported on web');
                    return;
                  }
                  
                  try {
                    if (value) {
                      const started = await startAudioMonitoring();
                      if (started) {
                        updateMonitoringSettings({ audioMonitoringEnabled: true });
                        await AsyncStorage.setItem('audio_monitoring_enabled', 'true');
                        await logActivity('app_opened', 'Audio monitoring started');
                        Alert.alert('Audio Monitoring', 'Audio monitoring has been enabled');
                      } else {
                        Alert.alert('Permission Denied', 'Audio permission is required for monitoring');
                      }
                    } else {
                      await stopAudioMonitoring();
                      updateMonitoringSettings({ audioMonitoringEnabled: false });
                      await AsyncStorage.setItem('audio_monitoring_enabled', 'false');
                      await logActivity('app_closed', 'Audio monitoring stopped');
                      Alert.alert('Audio Monitoring', 'Audio monitoring has been disabled');
                    }
                  } catch (error) {
                    console.error('[Settings] Error toggling audio monitoring:', error);
                    Alert.alert('Error', 'Failed to toggle audio monitoring');
                  }
                }}
                trackColor={{ false: '#4b5563', true: '#8b5cf6' }}
                thumbColor={monitoringSettings.audioMonitoringEnabled ? '#ffffff' : '#9ca3af'}
                disabled={Platform.OS === 'web'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingHeader}>
                  <Activity size={20} color="#10b981" />
                  <Text style={styles.settingLabel}>Activity Logging</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Log app usage and device activity
                </Text>
              </View>
              <Switch
                value={monitoringSettings.activityLoggingEnabled}
                onValueChange={async (value) => {
                  try {
                    updateMonitoringSettings({ activityLoggingEnabled: value });
                    await AsyncStorage.setItem('activity_logging_enabled', value ? 'true' : 'false');
                    await logActivity('app_opened', `Activity logging ${value ? 'enabled' : 'disabled'}`);
                    Alert.alert(
                      'Activity Logging', 
                      `Activity logging has been ${value ? 'enabled' : 'disabled'}`
                    );
                  } catch (error) {
                    console.error('[Settings] Error toggling activity logging:', error);
                    Alert.alert('Error', 'Failed to toggle activity logging');
                  }
                }}
                trackColor={{ false: '#4b5563', true: '#10b981' }}
                thumbColor={monitoringSettings.activityLoggingEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => router.push('/monitoring')}
          >
            <BarChart3 size={20} color="#ffffff" />
            <Text style={styles.dashboardButtonText}>View Monitoring Dashboard</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ About Monitoring</Text>
            <Text style={styles.infoText}>
              This app provides legal parental monitoring with full consent. All monitoring features comply with local laws and privacy regulations.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#1a1d29',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  lockButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2d3142',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#2d3142',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 16,
  },
  settingsText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  settingCard: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  settingDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#93c5fd',
    lineHeight: 20,
  },
});
