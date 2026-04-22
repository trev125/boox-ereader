/**
 * TabBar component for e-ink display.
 * High-contrast tab navigation with immediate visual feedback.
 */
import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function TabBar({ tabs, activeTab, onTabPress }: TabBarProps) {
  const colors = EINK_COLORS.dark;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderTopWidth: 2,
        borderTopColor: colors.text,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={{
              flex: 1,
              paddingVertical: EINK_SPACING.sm,
              paddingHorizontal: EINK_SPACING.md,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: MIN_TOUCH_TARGET,
              backgroundColor: isActive ? colors.text : colors.background,
            }}
          >
            <Text
              style={{
                color: isActive ? colors.background : colors.text,
                fontSize: 13,
                fontWeight: isActive ? 'bold' : 'normal',
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default TabBar;