/**
 * Reader screen for EPUB books.
 * Handles EPUB rendering, page turning, settings, and annotations.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReaderStore, type ChapterInfo } from '@src/lib/store/useReaderStore';
import { useAppStore, type ReaderSettings } from '@src/lib/store/useAppStore';
import { useLibraryStore } from '@src/lib/store/useLibraryStore';
import { EINK_COLORS, EINK_SPACING } from '@src/lib/theme';
import { screenRefresh } from '@src/utils/screenRefresh';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * EPUB View component - renders EPUB content via a WebView with epub.js
 */
function EPubView({
  bookId,
  cfi,
  settings,
  onProgress,
  onChapters,
  onSelection,
}: {
  bookId: string;
  cfi?: string;
  settings: ReaderSettings;
  onProgress?: (cfi: string, pct: number) => void;
  onChapters?: (chapters: ChapterInfo[]) => void;
  onSelection?: (cfi: string, rect: { x: number; y: number; width: number; height: number }, text: string) => void;
}) {
  const webViewRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<number>(0);

  const book = useLibraryStore((s) => s.books.find((b) => b.id === bookId));

  // Build the epub.js HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: ${100 + settings.hMargin}%;
      height: ${100 + settings.vMargin}%;
      overflow: hidden;
    }
    body {
      font-family: '${settings.fontFamily}', serif;
      font-size: ${settings.fontSize}px;
      line-height: ${settings.lineHeight};
      letter-spacing: ${settings.letterSpacing}px;
      word-spacing: ${settings.wordSpacing}px;
      text-align: justify;
      padding: 20px;
      box-sizing: border-box;
    }
    /* E-Ink optimized: no smooth scrolling, harsh contrasts */
    * {
      -webkit-font-smoothing: none;
      -moz-osx-font-smoothing: none;
      text-rendering: optimizeLegibility;
    }
    /* High contrast for e-ink */
    p, li, div {
      color: #000000;
      margin: 0.8em 0;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #000000;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #000000;
      text-decoration: underline;
    }
    /* No animations for e-ink */
    * {
      transition: none !important;
      -webkit-transition: none !important;
    }
  </style>
</head>
<body>
  <div id="book-container"></div>
  <script>
    // Injected epub.js content - simplified version without external deps
    // In production, this would load epub.js from a local asset
    document.addEventListener('DOMContentLoaded', function() {
      const container = document.getElementById('book-container');
      container.innerHTML = '<p>Loading EPUB content...</p><p>Book: ' + '${bookId}' + '</p>';
      
      // Notify React that loading is complete
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('loaded');
      }
      
      // Handle long press for selection
      let touchStartTime = 0;
      let touchStartPos = { x: 0, y: 0 };
      let longPressTimer = null;
      
      document.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        longPressTimer = setTimeout(handleLongPress, 500);
      });
      
      document.addEventListener('touchend', function() {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      });
      
      function handleLongPress() {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const text = selection.toString().trim();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'selection',
              text: text,
              rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
              cfi: ''
            }));
          }
        }
      }
      
      // Send progress updates
      setInterval(function() {
        if (window.ReactNativeWebView) {
          const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'progress',
            percentage: Math.round(scrollPercent),
            location: window.scrollY
          }));
        }
      }, 1000);
    });
  </script>
</body>
</html>`;

  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // In a full implementation, this would:
        // 1. Fetch the EPUB file
        // 2. Load it with epub.js
        // 3. Render to the WebView
        // For now, we show a placeholder
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (webViewRef.current && webViewRef.current.injectJavaScript) {
      const js = direction === 'next'
        ? 'window.scrollTo(0, window.scrollY + window.innerHeight); false;'
        : 'window.scrollTo(0, window.scrollY - window.innerHeight); false;';
      webViewRef.current.injectJavaScript(js);
    }
  }, []);

  const handleTouch = useCallback((x: number) => {
    if (x < SCREEN_WIDTH / 3) {
      handleNavigation('prev');
    } else if (x > (SCREEN_WIDTH * 2) / 3) {
      handleNavigation('next');
    }
    // Center third is reserved for UI controls
  }, [handleNavigation]);

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonDark]}
          onPress={() => {
            // Reload
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.loadingText}>Loading EPUB...</Text>
        </View>
      ) : (
        <>
          {Platform.OS === 'web' ? (
            <iframe
              srcDoc={html}
              style={styles.webView}
              onError={() => setError('Failed to load EPUB viewer')}
            />
          ) : (
            // @ts-expect-error WebView may not be in scope without import
            <WebView
              ref={webViewRef}
              source={{ html }}
              style={styles.webView}
              onMessage={(e: { nativeEvent: { data: string } }) => {
                try {
                  const data = JSON.parse(e.nativeEvent.data);
                  if (data.type === 'loaded') {
                    setIsLoading(false);
                  } else if (data.type === 'progress') {
                    setLocation(data.location);
                    if (onProgress) {
                      onProgress(data.cfi || '', data.percentage);
                    }
                  } else if (data.type === 'selection') {
                    if (onSelection) {
                      onSelection(data.cfi || '', data.rect, data.text);
                    }
                  }
                } catch {
                  // Ignore parse errors
                }
              }}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
            />
          )}
        </>
      )}
    </View>
  );
}

/**
 * Reader overlay controls - top bar
 */
function ReaderTopBar({
  onOpenSettings,
  onOpenTOC,
  onRefreshScreen,
  onClose,
}: {
  onOpenSettings: () => void;
  onOpenTOC: () => void;
  onRefreshScreen: () => void;
  onClose: () => void;
}) {
  const colors = EINK_COLORS.dark;

  return (
    <View style={[styles.topBar, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={onClose} style={styles.topBarButton}>
        <Text style={[styles.topBarText, { color: colors.text }]}>✕</Text>
      </TouchableOpacity>
      <Text style={[styles.topBarTitle, { color: colors.text }]}>Reader</Text>
      <View style={styles.topBarActions}>
        <TouchableOpacity onPress={onOpenTOC} style={styles.topBarButton}>
          <Text style={[styles.topBarText, { color: colors.text }]}>{'≡'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenSettings} style={styles.topBarButton}>
          <Text style={[styles.topBarText, { color: colors.text }]}>{'Aa'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefreshScreen} style={styles.topBarButton}>
          <Text style={[styles.topBarText, { color: colors.text }]}>{'↻'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Reader settings panel
 */
function ReaderSettingsPanel({
  settings,
  onSettingsChange,
  onClose,
}: {
  settings: ReaderSettings;
  onSettingsChange: (settings: Partial<ReaderSettings>) => void;
  onClose: () => void;
}) {
  const colors = EINK_COLORS.dark;
  const spacing = EINK_SPACING;

  return (
    <Modal visible animationType="fade" transparent={false} statusBarTranslucent={true}>
      <View style={[styles.settingsContainer, { backgroundColor: colors.background }]}>
        <View style={styles.settingsHeader}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>Reading Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* Font Family */}
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Font</Text>
            {['Bookerly', 'Arial', 'Georgia', 'Times New Roman', 'Courier New'].map((font) => (
              <TouchableOpacity
                key={font}
                style={[
                  styles.settingButton,
                  settings.fontFamily === font && styles.settingButtonActive,
                  {
                    borderColor: colors.border,
                    backgroundColor: settings.fontFamily === font ? colors.text : colors.background,
                  },
                ]}
                onPress={() => onSettingsChange({ fontFamily: font })}
              >
                <Text
                  style={[
                    styles.settingButtonText,
                    {
                      color: settings.fontFamily === font ? colors.background : colors.text,
                      fontFamily: font === 'Bookerly' ? 'serif' : font,
                    },
                  ]}
                >
                  {font}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Font Size */}
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Font Size: {settings.fontSize}px</Text>
            <View style={styles.sliderRow}>
              <Text style={[styles.sliderValue, { color: colors.text }]}>A</Text>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      backgroundColor: colors.text,
                      width: `${((settings.fontSize - 10) / 32) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.sliderValue, { color: colors.text }]}>A</Text>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ fontSize: Math.max(10, settings.fontSize - 1) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ fontSize: Math.min(42, settings.fontSize + 1) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>{'+'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Line Height */}
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Line Height: {settings.lineHeight}</Text>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ lineHeight: Math.max(1, settings.lineHeight - 0.1) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>-</Text>
              </TouchableOpacity>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      backgroundColor: colors.text,
                      width: `${((settings.lineHeight - 1) / 3) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ lineHeight: Math.min(4, settings.lineHeight + 0.1) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>{'+'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Letter Spacing */}
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Letter Spacing: {settings.letterSpacing}px</Text>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ letterSpacing: Math.max(-2, settings.letterSpacing - 1) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>-</Text>
              </TouchableOpacity>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      backgroundColor: colors.text,
                      width: `${((settings.letterSpacing + 2) / 10) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ letterSpacing: Math.max(10, settings.letterSpacing + 1) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>{'+'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Horizontal Margin */}
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Horizontal Margin: {settings.hMargin}px</Text>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ hMargin: Math.max(0, settings.hMargin - 4) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>-</Text>
              </TouchableOpacity>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      backgroundColor: colors.text,
                      width: `${(settings.hMargin / 80) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ hMargin: Math.min(80, settings.hMargin + 4) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>{'+'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vertical Margin */}
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Vertical Margin: {settings.vMargin}px</Text>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ vMargin: Math.max(0, settings.vMargin - 4) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>-</Text>
              </TouchableOpacity>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      backgroundColor: colors.text,
                      width: `${(settings.vMargin / 80) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.sliderButton, { backgroundColor: colors.text }]}
                onPress={() => onSettingsChange({ vMargin: Math.min(80, settings.vMargin + 4) })}
              >
                <Text style={[styles.sliderButtonText, { color: colors.background }]}>{'+'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

/**
 * Table of Contents panel
 */
function TOCPanel({
  chapters,
  onSelect,
  onClose,
}: {
  chapters: ChapterInfo[];
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const colors = EINK_COLORS.dark;

  return (
    <Modal visible animationType="fade" transparent={false} statusBarTranslucent={true}>
      <View style={[styles.tocContainer, { backgroundColor: colors.background }]}>
        <View style={styles.tocHeader}>
          <Text style={[styles.tocTitle, { color: colors.text }]}>Contents</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.tocContent}>
          {chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id || index}
                style={[styles.tocItem, { borderBottomColor: colors.border }]}
                onPress={() => onSelect(index)}
              >
                <Text style={[styles.tocItemText, { color: colors.text }]}>{chapter.title}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.text }]}>No chapters available</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

/**
 * Dictionary popup overlay
 */
function DictionaryPopup({
  text,
  rect,
  onClose,
}: {
  text: string;
  rect: { x: number; y: number; width: number; height: number };
  onClose: () => void;
}) {
  const colors = EINK_COLORS.dark;
  const [isSearching, setIsSearching] = useState(false);
  const [definition, setDefinition] = useState<string | null>(null);

  const handleLookup = useCallback(async () => {
    setIsSearching(true);
    try {
      // Placeholder for dictionary lookup
      // In production, this would call a dictionary API or local database
      setDefinition(`Dictionary lookup for: "${text}"\n\nDefinition would appear here.`);
    } catch {
      setDefinition('Could not find definition.');
    } finally {
      setIsSearching(false);
    }
  }, [text]);

  // Position the popup
  const popupX = Math.min(rect.x, SCREEN_WIDTH - 280);
  const popupY = Math.min(rect.y + rect.height + 10, SCREEN_HEIGHT - 200);

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
        <View
          style={[
            styles.dictionaryPopup,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              left: popupX,
              top: popupY,
            },
          ]}
        >
          <View style={styles.dictionaryHeader}>
            <Text style={[styles.dictionaryWord, { color: colors.text }]}>"{text}"</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>{'✕'}</Text>
            </TouchableOpacity>
          </View>
          {isSearching ? (
            <Text style={[styles.dictionaryBody, { color: colors.text }]}>Searching...</Text>
          ) : definition ? (
            <Text style={[styles.dictionaryBody, { color: colors.text }]}>{definition}</Text>
          ) : (
            <TouchableOpacity
              style={[styles.lookupButton, { backgroundColor: colors.primary }]}
              onPress={handleLookup}
            >
              <Text style={[styles.lookupButtonText, { color: colors.background }]}>Look Up</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Main reader screen component
 */
export default function ReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.bookId as string;

  // Reader store
  const readerState = useReaderStore((s) => s.reader);
  const startReading = useReaderStore((s) => s.startReading);
  const closeReader = useReaderStore((s) => s.closeReader);
  const setChapters = useReaderStore((s) => s.setChapters);
  const navigateToChapter = useReaderStore((s) => s.navigateToChapter);
  const updateProgress = useReaderStore((s) => s.updateProgress);
  const setSelection = useReaderStore((s) => s.setSelection);
  const clearSelection = useReaderStore((s) => s.clearSelection);

  // App store (settings)
  const appSettings = useAppStore((s) => s.reader);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<{
    text: string;
    rect: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Apply settings from store to reader
  useEffect(() => {
    if (appSettings) {
      startReading(bookId);
    }
  }, [bookId, appSettings, startReading]);

  const handleProgress = useCallback(
    (cfi: string, pct: number) => {
      updateProgress({ currentCfi: cfi, percentage: pct, lastReadAt: Date.now() });
    },
    [updateProgress]
  );

  const handleChapters = useCallback(
    (chapters: ChapterInfo[]) => {
      setChapters(chapters);
    },
    [setChapters]
  );

  const handleSelection = useCallback(
    (cfi: string, rect: { x: number; y: number; width: number; height: number }, text: string) => {
      setSelection(cfi, rect, text);
      setDictionaryData({ text, rect });
      setShowDictionary(true);
    },
    [setSelection]
  );

  const handleScreenRefresh = useCallback(async () => {
    await screenRefresh();
  }, []);

  const handleClose = useCallback(() => {
    closeReader();
    router.back();
  }, [closeReader, router]);

  const handleTOCSelect = useCallback(
    (index: number) => {
      navigateToChapter(index);
      setShowTOC(false);
    },
    [navigateToChapter]
  );

  const handleSettingsChange = useCallback(
    (settings: Partial<ReaderSettings>) => {
      // Settings are applied directly to the EPUB via CSS injection
      // The parent component would re-render with new settings
    },
    []
  );

  if (!bookId) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No book specified</Text>
        <TouchableOpacity style={[styles.button, styles.buttonDark]} onPress={handleClose}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ReaderTopBar
        onOpenSettings={() => setShowSettings(true)}
        onOpenTOC={() => setShowTOC(true)}
        onRefreshScreen={handleScreenRefresh}
        onClose={handleClose}
      />

      <EPubView
        bookId={bookId}
        cfi={readerState.progress?.currentCfi}
        settings={appSettings}
        onProgress={handleProgress}
        onChapters={handleChapters}
        onSelection={handleSelection}
      />

      {/* Progress indicator - bottom */}
      <View style={styles.progressIndicator}>
        <Text style={styles.progressText}>
          {readerState.progress
            ? `${Math.round(readerState.progress.percentage)}%`
            : '0%'}
        </Text>
      </View>

      {/* Modals */}
      {showSettings && (
        <ReaderSettingsPanel
          settings={appSettings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showTOC && (
        <TOCPanel
          chapters={readerState.toc}
          onSelect={handleTOCSelect}
          onClose={() => setShowTOC(false)}
        />
      )}

      {showDictionary && dictionaryData && (
        <DictionaryPopup
          text={dictionaryData.text}
          rect={dictionaryData.rect}
          onClose={() => {
            setShowDictionary(false);
            clearSelection();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 2,
  },
  buttonDark: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  topBarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 4,
  },
  // Settings panel
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  settingsContent: {
    flex: 1,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
  },
  settingButtonActive: {
    borderWidth: 2,
  },
  settingButtonText: {
    fontSize: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
  },
  sliderFill: {
    height: '100%',
  },
  sliderButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  // TOC panel
  tocContainer: {
    flex: 1,
    padding: 16,
  },
  tocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tocTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  tocContent: {
    flex: 1,
  },
  tocItem: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tocItemText: {
    fontSize: 16,
  },
  // Dictionary popup
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dictionaryPopup: {
    position: 'absolute',
    width: 280,
    maxHeight: 200,
    padding: 16,
    borderWidth: 2,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  dictionaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dictionaryWord: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
  dictionaryBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  lookupButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  lookupButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Progress indicator
  progressIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  // Common
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
});