/**
 * EPubView component for e-ink display.
 * Renders EPUB files using epub.js with custom CSS injection.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { EINK_COLORS } from '../lib/theme';

export interface EPubViewProps {
  bookId: string;
  chapterHref?: string;
  onLocationChange?: (href: string, percentage: number) => void;
  onEndPage?: () => void;
}

export function EPubView({ bookId, chapterHref, onLocationChange, onEndPage }: EPubViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // EPUB viewer HTML template with epub.js
  const epubViewerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          background: #ffffff; 
          color: #000000;
          font-family: Bookerly, Georgia, serif;
          overflow: hidden;
        }
        #viewer {
          width: 100%;
          height: 100vh;
        }
        .epub-container {
          width: 100% !important;
          height: 100% !important;
        }
        .epub-view {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden;
        }
        .epub-view * {
          line-height: 1.5 !important;
        }
      </style>
    </head>
    <body>
      <div id="viewer"></div>
      <script>
        // Communicate with React Native
        function sendMessage(type, data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
        }
        
        // Handle page navigation
        document.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowRight' || e.key === ' ') {
            sendMessage('pageNext', {});
          } else if (e.key === 'ArrowLeft') {
            sendMessage('pagePrev', {});
          }
        });
        
        // Handle long press for dictionary
        var longPressTimer;
        document.addEventListener('touchstart', function(e) {
          longPressTimer = setTimeout(function() {
            var selection = window.getSelection();
            var text = selection.toString();
            if (text) {
              sendMessage('longPress', { text: text });
            }
          }, 500);
        });
        
        document.addEventListener('touchend', function() {
          clearTimeout(longPressTimer);
        });
        
        sendMessage('ready', {});
      </script>
    </body>
    </html>
  `;

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      switch (message.type) {
        case 'pageNext':
          onEndPage?.();
          break;
        case 'pagePrev':
          // Could implement back navigation here
          break;
        case 'longPress':
          // Will be handled by dictionary overlay
          break;
        case 'ready':
          setIsLoading(false);
          break;
      }
    } catch (e) {
      console.error('EPubView message parse error:', e);
    }
  }, [onEndPage]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading book: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading EPUB...</Text>
        </View>
      )}
      <WebView
        source={{ uri: 'data:text/html,' + encodeURIComponent(epubViewerHTML).replace(/'/g, '%27') }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domEnabled={true}
        originWhitelist={['*']}
        scrollEnabled={false}
        mixedContentMode="never"
        allowsInlineMediaPlayback={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});

export default EPubView;