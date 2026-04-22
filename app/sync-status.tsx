import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSyncStore } from '@src/lib/store/useSyncStore';

export default function SyncStatusPage() {
  const {
    sync: {
      koreaderUrl,
      status: syncStatus,
      lastSyncAt,
      isSyncing,
      queue,
      log,
    },
    setKoreaderUrl,
    syncNow,
    processQueue,
    clearLog,
  } = useSyncStore();

  const colors = syncStatus === 'up-to-date'
    ? { bg: '#FFFFFF', text: '#000000', card: '#F5F5F5', border: '#CCCCCC', status: '#000000', statusBg: '#E8E8E8' }
    : syncStatus === 'error'
    ? { bg: '#FFFFFF', text: '#000000', card: '#F5F5F5', border: '#CCCCCC', status: '#000000', statusBg: '#CCCCCC' }
    : { bg: '#FFFFFF', text: '#000000', card: '#F5F5F5', border: '#CCCCCC', status: '#000000', statusBg: '#E8E8E8' };

  const handleSync = async () => {
    await syncNow();
  };

  const handleProcessQueue = async () => {
    await processQueue();
  };

  const handleClearLog = async () => {
    await clearLog();
  };

  const statusText = isSyncing ? 'Syncing...' : syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1);

  const successCount = log.filter(e => e.type === 'complete').length;
  const failureCount = log.filter(e => e.type === 'error').length;
  const pendingCount = queue.filter(item => item.status === 'pending').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Sync Status</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Status Card */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connection Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: colors.statusBg, borderColor: colors.border }]}>
          {isSyncing ? (
            <ActivityIndicator color={colors.status} style={{ marginRight: 8 }} />
          ) : null}
          <Text style={[styles.statusText, { color: colors.status }]}>{statusText}</Text>
        </View>

        {lastSyncAt && (
          <Text style={[styles.syncTime, { color: colors.text }]}>
            Last synced: {new Date(lastSyncAt).toLocaleString()}
          </Text>
        )}
      </View>

      {/* Server URL */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Koreader Sync Server</Text>
        <Text style={[styles.urlText, { color: colors.text }]}>
          {koreaderUrl || 'Not configured'}
        </Text>
      </View>

      {/* Stats */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.text }]}>Total Log Entries</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{log.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.text }]}>Successful Syncs</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{successCount}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.text }]}>Failed Syncs</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{failureCount}</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.text }]}>Pending Queue</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{pendingCount}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.text }]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          <Text style={[styles.actionButtonText, { color: colors.bg }]}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
        {pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border, backgroundColor: 'transparent' }]}
            onPress={handleProcessQueue}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Process Queue ({pendingCount})
            </Text>
          </TouchableOpacity>
        )}
        {log.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border, backgroundColor: 'transparent' }]}
            onPress={handleClearLog}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Clear Log
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  syncTime: {
    fontSize: 13,
    opacity: 0.6,
  },
  urlText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});