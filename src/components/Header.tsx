/**
 * Header component for e-ink display.
 * High-contrast header with navigation and title.
 */
import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  rightIcon?: string;
  subtitle?: string;
}

export function Header({ title, onBackPress, onRightPress, rightIcon, subtitle }: HeaderProps) {
  const colors = EINK_COLORS.dark;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderBottomWidth: 2,
        borderBottomColor: colors.text,
        paddingVertical: EINK_SPACING.sm,
        paddingHorizontal: EINK_SPACING.md,
        minHeight: MIN_TOUCH_TARGET * 1.5,
      }}
    >
      <View style={{ width: MIN_TOUCH_TARGET }}>
        {onBackPress && (
          <Pressable
            onPress={onBackPress}
            style={{
              width: MIN_TOUCH_TARGET,
              height: MIN_TOUCH_TARGET,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              ←
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={{ width: MIN_TOUCH_TARGET, alignItems: 'flex-end' }}>
        {onRightPress && (
          <Pressable
            onPress={onRightPress}
            style={{
              width: MIN_TOUCH_TARGET,
              height: MIN_TOUCH_TARGET,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              {rightIcon || '•••'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default Header;