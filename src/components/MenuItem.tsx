/**
 * MenuItem component for e-ink display.
 * High-contrast menu items with clear labels and immediate visual feedback.
 */
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface MenuItemData {
  id: string;
  label: string;
  description?: string;
  onPress: () => void;
  leadingIcon?: string;
  trailingIcon?: string;
  destructive?: boolean;
}

export function MenuItem({ data }: { data: MenuItemData }) {
  const colors = EINK_COLORS.dark;
  const textColor = data.destructive ? '#FF0000' : colors.text;

  return (
    <Pressable
      onPress={data.onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: EINK_SPACING.md,
        backgroundColor: pressed ? colors.text : colors.card,
        borderLeftWidth: 3,
        borderLeftColor: data.destructive ? '#FF0000' : colors.primary,
        minHeight: MIN_TOUCH_TARGET,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {data.leadingIcon && (
          <Text
            style={{
              color: textColor,
              fontSize: 18,
              marginRight: EINK_SPACING.sm,
              width: 24,
              textAlign: 'center',
            }}
          >
            {data.leadingIcon}
          </Text>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: textColor,
              fontSize: 15,
              fontWeight: 'bold',
            }}
          >
            {data.label}
          </Text>
          {data.description && (
            <Text
              style={{
                color: textColor,
                fontSize: 12,
                marginTop: 2,
                opacity: 0.7,
              }}
            >
              {data.description}
            </Text>
          )}
        </View>
      </View>
      {data.trailingIcon && (
        <Text
          style={{
            color: textColor,
            fontSize: 16,
            marginLeft: EINK_SPACING.md,
          }}
        >
          {data.trailingIcon}
        </Text>
      )}
    </Pressable>
  );
}

export function MenuSection({
  title,
  items,
}: {
  title?: string;
  items: MenuItemData[];
}) {
  const colors = EINK_COLORS.dark;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.cardBorder,
        margin: EINK_SPACING.sm,
      }}
    >
      {title && (
        <View
          style={{
            backgroundColor: colors.text,
            padding: EINK_SPACING.sm,
          }}
        >
          <Text
            style={{
              color: colors.background,
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
        </View>
      )}
      {items.map((item) => (
        <MenuItem key={item.id} data={item} />
      ))}
    </View>
  );
}

export default MenuItem;