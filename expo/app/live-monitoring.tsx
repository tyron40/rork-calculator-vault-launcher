import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, Link2, ShieldCheck } from 'lucide-react-native';
import { useVaultStore } from '@/store/vaultStore';

export default function LiveMonitoringScreen() {
  const router = useRouter();
  const { selectedDeviceId, connectedDevices } = useVaultStore();
  const device = connectedDevices.find((entry) => entry.id === selectedDeviceId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{device?.childName || 'Device session'}</Text>
          <Text style={styles.headerSubtitle}>{device?.isOnline ? 'Paired · online' : 'Paired · offline'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={32} color="#60a5fa" />
          </View>
          <Text style={styles.title}>Live access is not available yet</Text>
          <Text style={styles.description}>
            Pairing and connection status work, but this app does not currently relay the other device’s screen, camera, or microphone. No stream is running.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeading}>
            <Info size={19} color="#a78bfa" />
            <Text style={styles.cardTitle}>What the phones allow</Text>
          </View>
          <Text style={styles.cardText}>
            Android screen sharing must be started and approved on the device for each session. On iPhone, screen sharing and remote control use Apple’s visible FaceTime flow and the device owner must approve control. Camera and microphone access also require an on-device permission prompt and visible active use.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeading}>
            <Link2 size={19} color="#34d399" />
            <Text style={styles.cardTitle}>Current app features</Text>
          </View>
          <Text style={styles.cardText}>
            • Pair and unpair devices with a time-limited code{ '\n' }
            • Show whether the child app has recently checked in{ '\n' }
            • View pairing details on both devices
          </Text>
        </View>
        <Text style={styles.footnote}>
          Remote screen, camera, microphone, and device-control features need a separate, tested implementation with child-visible session approval. This screen will not report a session as active until a real stream is connected.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: {
    minHeight: 84,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#263244',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerInfo: { marginLeft: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  hero: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 10 },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    marginBottom: 18,
  },
  title: { color: '#fff', fontSize: 22, lineHeight: 28, fontWeight: '700', textAlign: 'center' },
  description: { color: '#cbd5e1', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 },
  infoCard: { backgroundColor: '#1f2937', borderRadius: 14, padding: 17 },
  infoHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  cardTitle: { color: '#f9fafb', fontSize: 16, fontWeight: '600' },
  cardText: { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
  footnote: { color: '#94a3b8', fontSize: 12, lineHeight: 19, paddingHorizontal: 2 },
});
