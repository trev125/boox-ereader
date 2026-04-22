import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@src/lib/store/useAppStore';
import { useLibraryStore } from '@src/lib/store/useLibraryStore';
import { useReaderStore } from '@src/lib/store/useReaderStore';
import type { LibraryBook } from '@src/lib/store/useLibraryStore';

export default function LibraryPage() {
  const { books, grimooryUrl, isConnected, testConnection, addBook } = useLibraryStore();
  const { theme } = useAppStore();
  const { reader: { currentBookId }, startReading, closeReader } = useReaderStore();

  const colors = theme === 'dark'
    ? { bg: '#000000', text: '#FFFFFF', card: '#111111', border: '#333333', highlight: '#222222' }
    : { bg: '#FFFFFF', text: '#000000', card: '#F5F5F5', border: '#CCCCCC', highlight: '#E8E8E8' };

  const handleBookPress = (book: LibraryBook) => {
    startReading(book.id);
    router.push({ pathname: '/reader/[bookId]', params: { bookId: book.id } as { bookId: string } });
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleSyncPress = () => {
    router.push('/sync-status');
  };

  const handleRemoveBook = (bookId: string, e: any) => {
    e.stopPropagation();
    // Remove via direct store manipulation
    const state = useLibraryStore.getState();
    // We need to add a removeBook method or access differently
  };

  const renderItem = ({ item }: { item: LibraryBook }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.5}
    >
      <View style={[styles.coverContainer, { backgroundColor: colors.highlight }]}>
        <Text style={[styles.coverPlaceholder, { color: colors.text }]}>
          {item.title.charAt(0)}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.author && (
          <Text style={[styles.bookAuthor, { color: colors.text }]} numberOfLines={1}>
            {item.author}
          </Text>
        )}
        {item.progress !== undefined && item.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {Math.round(item.progress)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <View style={styles.headerActions}>
          {isConnected ? null : (
            <TouchableOpacity
              style={[styles.iconButton, { borderColor: colors.border }]}
              onPress={testConnection}
            >
              <Text style={[styles.iconText, { color: colors.text }]}>Connect</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.iconButton, { borderColor: colors.border }]} onPress={handleSyncPress}>
            <Text style={[styles.iconText, { color: colors.text }]}>Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { borderColor: colors.border }]} onPress={handleSettingsPress}>
            <Text style={[styles.iconText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {books.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No books in library</Text>
          <Text style={[styles.emptySubtext, { color: colors.text }]}>
            Add books via OPDS catalog in settings
          </Text>
          {!isConnected && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.text }]}
              onPress={testConnection}
            >
              <Text style={[styles.primaryButtonText, { color: colors.bg }]}>Connect to Grimoory</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverContainer: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#666',
  },
  coverPlaceholder: {
    fontSize: 48,
    fontWeight: 'bold',
    opacity: 0.3,
  },
  cardContent: {
    padding: 10,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#CCCCCC',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
  },
  progressText: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});