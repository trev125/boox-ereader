/**
 * List component for e-ink display.
 * High-contrast list items with immediate visual feedback.
 */
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface ListItemData {
  id: string;
  title: string;
  subtitle?: string;
  right?: string;
  onPress?: () => void;
  badge?: string;
}

export interface ListProps {
  data: ListItemData[];
  onItemPress?: (item: ListItemData) => void;
  renderItem?: (item: ListItemData) => React.ReactNode;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  onEndReached?: () => void;
}

const ListItem: React.FC<{
  data: ListItemData;
  onPress?: () => void;
}> = ({ data, onPress }) => {
  const colors = EINK_COLORS.dark;
  const spacing = EINK_SPACING;

  const listItemStyle = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
      minHeight: MIN_TOUCH_TARGET,
    },
  }).container;

  const content = (
    <View style={listItemStyle}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {data.badge && (
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: colors.background,
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              >
                {data.badge}
              </Text>
            </View>
          )}
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              fontWeight: 'bold',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {data.title}
          </Text>
        </View>
        {data.subtitle && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginTop: spacing.xs,
              marginLeft: data.badge ? spacing.sm * 2 : 0,
            }}
            numberOfLines={1}
          >
            {data.subtitle}
          </Text>
        )}
      </View>
      {data.right && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            marginLeft: spacing.md,
          }}
        >
          {data.right}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={(state) => ({ opacity: state.pressed ? 0.7 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

export function List({
  data,
  onItemPress,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReached,
}: ListProps) {
  const colors = EINK_COLORS.dark;

  if (data.length === 0 && ListEmptyComponent) {
    return (
      <View style={{ flex: 1, padding: EINK_SPACING.xl }}>
        {ListEmptyComponent as React.ReactElement}
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
    >
      {ListHeaderComponent as React.ReactElement}
      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            onPress={item.onPress}
          />
        )}
        ListFooterComponent={ListFooterComponent as React.ReactElement | undefined}
        ListEmptyComponent={ListEmptyComponent as React.ReactElement | undefined}
        onEndReached={onEndReached}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export function BookList({
  books,
  onBookPress,
}: {
  books: Array<{ id: string; title: string; author?: string; progress?: number }>;
  onBookPress: (book: { id: string; title: string; author?: string; progress?: number }) => void;
}) {
  return (
    <List
      data={books.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.author ? `${b.author}${b.progress != null ? ` · ${Math.round(b.progress)}% read` : ''}` : undefined,
        right: b.progress != null ? `${Math.round(b.progress)}%` : undefined,
        onPress: () => onBookPress(b),
      }))}
    />
  );
}

export default List;