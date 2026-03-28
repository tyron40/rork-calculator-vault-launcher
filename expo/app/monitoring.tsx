import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Activity, Shield, Clock, AlertCircle, ChevronLeft } from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';
import { 
  getActivityLogs, 
  getMonitoringSessions, 
  getConsentInfo,
  ActivityLog,
  MonitoringSession 
} from '@/services/monitoring';

export default function MonitoringScreen() {
  const router = useRouter();
  const { monitoringSettings } = useVaultStore();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<MonitoringSession[]>([]);
  const [consentInfo, setConsentInfo] = useState<{
    parentName: string;
    childName: string;
    consentDate: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const logs = await getActivityLogs();
      const monitoringSessions = await getMonitoringSessions();
      const consent = await getConsentInfo();
      
      setActivityLogs(logs.slice(-20).reverse());
      setSessions(monitoringSessions.slice(-10).reverse());
      setConsentInfo(consent);
    } catch (error) {
      console.error('[Monitoring] Error loading data:', error);
      Alert.alert('Error', 'Failed to load monitoring data');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'app_opened':
      case 'app_closed':
        return '📱';
      case 'screen_on':
      case 'screen_off':
        return '🖥️';
      case 'location_change':
        return '📍';
      default:
        return '•';
    }
  };

  const getStatusColor = (status: MonitoringSession['status']) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'stopped':
        return '#6b7280';
      case 'paused':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monitoring Dashboard</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {consentInfo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Consent Information</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Parent/Guardian:</Text>
                <Text style={styles.infoValue}>{consentInfo.parentName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Child:</Text>
                <Text style={styles.infoValue}>{consentInfo.childName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Consent Date:</Text>
                <Text style={styles.infoValue}>{formatDate(consentInfo.consentDate)}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Monitoring Status</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Mic size={16} color={monitoringSettings.audioMonitoringEnabled ? '#10b981' : '#6b7280'} />
                <Text style={styles.statusLabel}>Audio</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: monitoringSettings.audioMonitoringEnabled ? '#10b981' : '#6b7280' }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {monitoringSettings.audioMonitoringEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Activity size={16} color={monitoringSettings.activityLoggingEnabled ? '#10b981' : '#6b7280'} />
                <Text style={styles.statusLabel}>Activity Logging</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: monitoringSettings.activityLoggingEnabled ? '#10b981' : '#6b7280' }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {monitoringSettings.activityLoggingEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {sessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
            </View>
            {sessions.map((session) => (
              <View key={session.id} style={styles.card}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionType}>{session.type.toUpperCase()}</Text>
                    <Text style={styles.sessionTime}>{formatDate(session.startTime)}</Text>
                    {session.endTime && (
                      <Text style={styles.sessionTime}>Ended: {formatDate(session.endTime)}</Text>
                    )}
                  </View>
                  <View style={[
                    styles.sessionStatus,
                    { backgroundColor: getStatusColor(session.status) }
                  ]}>
                    <Text style={styles.sessionStatusText}>{session.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activityLogs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Activity Logs ({activityLogs.length})</Text>
            </View>
            {activityLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <Text style={styles.logIcon}>{getActivityIcon(log.type)}</Text>
                <View style={styles.logInfo}>
                  <Text style={styles.logDetails}>{log.details}</Text>
                  <Text style={styles.logTime}>{formatDate(log.timestamp)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activityLogs.length === 0 && sessions.length === 0 && (
          <View style={styles.emptyState}>
            <Activity size={64} color="#4a4e69" />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptyText}>
              Monitoring data will appear here once features are enabled in Settings
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#1a1d29',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3142',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600' as const,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600' as const,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  sessionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionStatusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  logCard: {
    flexDirection: 'row',
    backgroundColor: '#2d3142',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  logIcon: {
    fontSize: 24,
  },
  logInfo: {
    flex: 1,
  },
  logDetails: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
});
