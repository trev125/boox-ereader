import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@src/lib/store/useAppStore';
import { useLibraryStore } from '@src/lib/store/useLibraryStore';

export default function SettingsPage() {
  const { theme, setTheme, reader: { fontSize, hMargin, vMargin, fontFamily }, setReaderSettings, setFontSize, setHMargins, setVMargins, setFontFamily } = useAppStore();
  const { grimooryUrl, setGrimooryUrl, isConnected, testConnection } = useLibraryStore();

  const colors = theme === 'dark'
    ? { bg: '#000000', text: '#FFFFFF', card: '#111111', border: '#333333', inputBg: '#1a1a1a' }
    : { bg: '#FFFFFF', text: '#000000', card: '#F5F5F5', border: '#CCCCCC', inputBg: '#FFFFFF' };

  const handleTestConnection = async () => {
    const success = await testConnection();
    // Could show a toast/alert here
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Connection Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connection</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Grimoory Server URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            value={grimooryUrl}
            placeholder="http://localhost:8080"
            placeholderTextColor={colors.text + '60'}
            onChangeText={setGrimooryUrl}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.text, opacity: isConnected ? 0.5 : 1 }]}
          onPress={handleTestConnection}
        >
          <Text style={[styles.buttonText, { color: colors.bg }]}>
            {isConnected ? 'Connected' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[styles.themeButton, theme === 'light' && { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#000000' }]}
              onPress={() => setTheme('light')}
            >
              <Text style={[styles.themeButtonText, { color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, theme === 'dark' && { backgroundColor: '#000000', borderWidth: 2, borderColor: '#FFFFFF' }]}
              onPress={() => setTheme('dark')}
            >
              <Text style={[styles.themeButtonText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Reading Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Font Size</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{fontSize}px</Text>
        </View>
        <View style={styles.sliderRow}>
          <Text style={[styles.sliderLabel, { color: colors.text }]}>A-</Text>
          <View style={[styles.slider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sliderLabel, { color: colors.text }]}>A+</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Left Margin</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{hMargin}px</Text>
        </View>
        <View style={styles.sliderRow}>
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Narrow</Text>
          <View style={[styles.slider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Wide</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Right Margin</Text>
          <Text style={[styles.settingValue, { color: colors.text }]}>{vMargin}px</Text>
        </View>
        <View style={styles.sliderRow}>
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Narrow</Text>
          <View style={[styles.slider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Wide</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={() => router.push('/sync-status')}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Sync Status</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 13,
    opacity: 0.7,
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