/**
 * Grid component for e-ink display.
 * Uses FlashList for efficient large list rendering.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { EINK_COLORS, EINK_SPACING } from '../lib/theme';

export interface GridProps<T = any> {
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  numColumns?: number;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  contentContainerStyle?: any;
}

export function Grid<T = any>({
  data,
  keyExtractor,
  renderItem,
  numColumns = 2,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  contentContainerStyle,
}: GridProps<T>) {
  if (data.length === 0 && ListEmptyComponent) {
    return (
      <View style={[styles.container, contentContainerStyle]}>
        {ListEmptyComponent}
      </View>
    );
  }

  const renderItemWrapped = ({ item, index }: { item: T; index: number }) => {
    const result = renderItem({ item, index });
    if (numColumns && numColumns > 1) {
      return (
        <View style={{ flex: 1, margin: 2 }}>
          {result}
        </View>
      );
    }
    return result;
  };

  return (
    <FlashList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItemWrapped}
      numColumns={numColumns}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function BookGrid({
  books,
  onBookPress,
}: {
  books: Array<{ id: string; title: string; author?: string; coverUri?: string }>;
  onBookPress: (book: { id: string; title: string; author?: string; coverUri?: string }) => void;
}) {
  const colors = EINK_COLORS.dark;
  const spacing = EINK_SPACING;

  return (
    <Grid
      data={books}
      numColumns={2}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={{ padding: spacing.xl }}>
          <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center' }}>
            No books found.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.bookItem,
            { borderColor: colors.cardBorder },
          ]}
        >
          <View style={[styles.coverPlaceholder, { borderColor: '#000000' }]}>
            {item.coverUri ? (
              <View style={styles.coverImage} />
            ) : (
              <Text style={styles.coverText}>No Cover</Text>
            )}
          </View>
          <Text
            style={[styles.bookTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.author && (
            <Text
              style={[styles.bookAuthor, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.author}
            </Text>
          )}
          <View style={styles.bookActions}>
            <Text
              style={[styles.actionButton, { color: colors.primary }]}
              onPress={() => onBookPress(item)}
            >
              Read
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: EINK_SPACING.sm,
  },
  bookItem: {
    flex: 1,
    margin: EINK_SPACING.xs,
    borderWidth: 1,
    padding: EINK_SPACING.sm,
  },
  coverPlaceholder: {
    height: 160,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: EINK_SPACING.xs,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDDDDD',
  },
  coverText: {
    color: '#666666',
    fontSize: 12,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 11,
  },
  bookActions: {
    marginTop: EINK_SPACING.xs,
  },
  actionButton: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: EINK_SPACING.sm,
  },
});

export default Grid;