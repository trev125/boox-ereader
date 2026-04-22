/**
 * ThemeToggle component for e-ink display.
 * Pure black (#000000) and white (#FFFFFF) only toggle.
 */
import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export type AppTheme = 'light' | 'dark';

export interface ThemeToggleProps {
  theme: AppTheme;
  onToggle: (theme: AppTheme) => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={() => onToggle(isDark ? 'light' : 'dark')}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
      ]}
    >
      <View style={styles.innerContainer}>
        <Text
          style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' },
            !isDark && styles.labelActive,
          ]}
        >
          LIGHT
        </Text>
        <View style={[styles.divider, { backgroundColor: isDark ? '#333333' : '#CCCCCC' }]} />
        <Text
          style={[
            styles.label,
            { color: isDark ? '#000000' : '#FFFFFF' },
            isDark && styles.labelActive,
          ]}
        >
          DARK
        </Text>
      </View>
    </Pressable>
  );
}

export function ThemeToggleIcon({
  theme,
  onToggle,
}: {
  theme: AppTheme;
  onToggle: (theme: AppTheme) => void;
}) {
  return (
    <Pressable
      onPress={() => onToggle(theme === 'dark' ? 'light' : 'dark')}
      style={styles.iconButton}
    >
      <Text style={styles.iconText}>{theme === 'dark' ? '☀' : '☾'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: EINK_SPACING.sm,
    paddingHorizontal: EINK_SPACING.md,
    borderWidth: 2,
    borderColor: '#000000',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  labelActive: {
    textDecorationLine: 'underline',
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: EINK_SPACING.sm,
  },
  iconButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  iconText: {
    fontSize: 20,
    color: '#000000',
  },
});

export default ThemeToggle;