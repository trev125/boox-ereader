import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLibraryStore, CatalogFeed } from '@src/lib/store/useLibraryStore';
import { useAppStore } from '@src/lib/store/useAppStore';
import { OPDSEntry, OPDSLink } from '@src/types/opds';
import { opdsClient } from '@src/api/opdsClient';

/**
 * Extract a URL from an OPDS entry's links by rel type.
 */
function getUrlForRel(links: OPDSLink[], rel: string): string | undefined {
  return links.find((l) => l.rel === rel)?.href;
}

export default function CatalogScreen() {
  const { feedId } = useLocalSearchParams<{ feedId: string }>();
  const router = useRouter();
  const { feeds, grimooryUrl } = useLibraryStore();
  const { theme } = useAppStore();

  const [entries, setEntries] = useState<OPDSEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedTitle, setFeedTitle] = useState<string>('');

  const colors = theme === 'dark' ? EINK_COLORS.dark : EINK_COLORS.light;

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      setError(null);

      const fullBaseUrl = gremoeryToBaseUrl(grimooryUrl);

      if (!feedId) {
        // Show list of all configured feeds
        setFeedTitle('Booklore Feeds');
        setLoading(false);
        return;
      }

      try {
        // Try to fetch as a feed path from the OPDS server
        opdsClient.setBaseUrl(fullBaseUrl);
        const feed = await opdsClient.getFeed(feedId);

        if (feed.entries && feed.entries.length > 0) {
          setEntries(feed.entries);
        }

        // If we got publications from the feed, use those
        if (feed.publications && feed.publications.length > 0) {
          // Convert publications to OPDSEntry-like format for rendering
          const pubEntries: OPDSEntry[] = feed.publications.map((pub) => ({
            id: pub.id,
            title: pub.title,
            authors: pub.authors?.map((a) => a.name),
            publisher: pub.metadata?.publisher,
            summary: pub.summary,
            links: pub.links,
          }));
          setEntries(pubEntries);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed');
        // Fallback: try to find a matching feed by ID
        const matchedFeed = feeds.find((f) => f.id === feedId);
        if (matchedFeed) {
          setFeedTitle(matchedFeed.title);
          setEntries([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (grimooryUrl) {
      loadFeed();
    } else {
      setLoading(false);
      setError('No Grimoory URL configured. Set it in Settings.');
    }
  }, [feedId, grimooryUrl, feeds]);

  const handleFeedPress = useCallback(
    (feed: CatalogFeed) => {
      router.push({
        pathname: '/catalog/[feedId]',
        params: { feedId: feed.id },
      });
    },
    [router]
  );

  const handleBookPress = useCallback(
    (entry: OPDSEntry) => {
      const downloadUrl = getUrlForRel(entry.links, 'http://opds-spec.org/download')
        || getUrlForRel(entry.links, 'alternate')
        || getUrlForRel(entry.links, 'successor')
        || getUrlForRel(entry.links, '');

      router.push({
        pathname: '/reader/[bookId]',
        params: {
          bookId: entry.id || entry.title,
          bookTitle: entry.title,
          downloadUrl: downloadUrl || '',
        },
      });
    },
    [router]
  );

  const renderFeedItem = ({ item }: { item: CatalogFeed }) => (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() => handleFeedPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.cardTitle, { color: colors.primary }]} numberOfLines={1}>
        {item.title}
      </Text>
      {item.description && (
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderBookItem = ({ item }: { item: OPDSEntry }) => {
    const authorStr = item.authors?.join(', ');
    const publisherStr = item.publisher;

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.border }]}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {authorStr && (
          <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
            {authorStr}
          </Text>
        )}
        {publisherStr && (
          <Text style={[styles.publisher, { color: colors.textSecondary }]} numberOfLines={1}>
            {publisherStr}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'dark-content' : 'light-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (feedId) {
              router.back();
            } else {
              router.push('/library');
            }
          }}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>{'\u2190 Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {feedTitle || (feedId ? 'Catalog' : 'Booklore Feeds')}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : (
        !feedId ? (
          <FlatList
            data={feeds}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              feeds.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    CATALOG FEEDS
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              feeds.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No feeds configured. Add one in Settings.
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            data={entries}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              entries.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    BOOKS ({entries.length})
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              entries.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No books found in this catalog.
                  </Text>
                </View>
              ) : null
            }
          />
        )
      )}
    </SafeAreaView>
  );
}

function gremoeryToBaseUrl(url: string): string {
  if (!url) return '';
  // Remove API paths if present
  return url.replace(/\/api\/.*$/, '').replace(/\/+$/, '');
}

const EINK_COLORS = {
  dark: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#000000',
    border: '#CCCCCC',
    error: '#FF0000',
  },
  light: {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#999999',
    primary: '#FFFFFF',
    border: '#333333',
    error: '#FF4444',
  },
};

const EINK_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: EINK_SPACING.md,
    paddingVertical: EINK_SPACING.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingRight: EINK_SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: EINK_SPACING.sm,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: EINK_SPACING.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: EINK_SPACING.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: EINK_SPACING.sm,
  },
  section: {
    marginBottom: EINK_SPACING.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: EINK_SPACING.sm,
    paddingVertical: EINK_SPACING.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    padding: EINK_SPACING.md,
    marginBottom: EINK_SPACING.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: EINK_SPACING.xs,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  author: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: EINK_SPACING.xs / 2,
  },
  publisher: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: EINK_SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});