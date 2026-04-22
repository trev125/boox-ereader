/**
 * TextHighlightOverlay component for e-ink display.
 * Highlights selected text and shows action menu.
 */
import React, { useState } from 'react';
import { Text, View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SelectionInfo {
  start: number;
  end: number;
  text: string;
}

export interface TextHighlightOverlayProps {
  onTextLongPress: (
    start: number,
    end: number,
    text: string,
    position: { x: number; y: number }
  ) => void;
  children: React.ReactNode;
}

export function TextHighlightOverlay({
  onTextLongPress,
  children,
}: TextHighlightOverlayProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

export interface SelectionToolbarProps {
  visible: boolean;
  selection?: SelectionInfo;
  onCopy: () => void;
  onDictionary: () => void;
  onBookmark: () => void;
  onHighlight?: () => void;
}

export function SelectionToolbar({
  visible,
  selection,
  onCopy,
  onDictionary,
  onBookmark,
  onHighlight,
}: SelectionToolbarProps) {
  if (!visible || !selection) return null;

  const actions = [
    { label: 'COPY', action: onCopy, testId: 'copy-btn' },
    { label: 'DICT', action: onDictionary, testId: 'dict-btn' },
    { label: 'BM', action: onBookmark, testId: 'bookmark-btn' },
  ];

  if (onHighlight) {
    actions.push({ label: 'HL', action: onHighlight, testId: 'highlight-btn' });
  }

  return (
    <View style={styles.toolbar}>
      {actions.map((item) => (
        <Pressable
          key={item.label}
          onPress={item.action}
          style={[styles.toolbarButton, { borderColor: '#000000' }]}
          testID={item.testId}
        >
          <Text style={styles.toolbarButtonText}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export interface HighlightAnnotationProps {
  start: number;
  end: number;
  color?: string;
}

export function HighlightAnnotation({ start, end }: HighlightAnnotationProps) {
  return (
    <View style={styles.highlightContainer}>
      <View
        style={[
          styles.highlightBox,
          { left: start, right: SCREEN_WIDTH - end },
        ]}
      />
    </View>
  );
}

export default TextHighlightOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingVertical: EINK_SPACING.sm,
    paddingBottom: EINK_SPACING.md,
  },
  toolbarButton: {
    paddingVertical: EINK_SPACING.sm,
    paddingHorizontal: EINK_SPACING.md,
    borderWidth: 1,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  toolbarButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  highlightContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  highlightBox: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});