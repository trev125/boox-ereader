/**
 * DictionaryPopup component for e-ink display.
 * Triggered by long-press gesture on text in the reader.
 */
import React from 'react';
import { Text, View, Pressable, StyleSheet, Modal } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface DictionaryEntry {
  word: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
  synonyms?: string[];
}

export interface DictionaryPopupProps {
  visible: boolean;
  selectedText: string;
  position: { x: number; y: number };
  entries: DictionaryEntry[];
  onClose: () => void;
  onLookup: (word: string) => Promise<DictionaryEntry[]>;
}

export function DictionaryPopup({
  visible,
  selectedText,
  position,
  entries,
  onClose,
  onLookup,
}: DictionaryPopupProps) {
  const colors = EINK_COLORS.dark;

  const handleLookup = async () => {
    if (selectedText) {
      await onLookup(selectedText);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <View style={styles.overlay}>
        <View style={[
          styles.popup,
          {
            left: Math.min(position.x, 300),
            top: Math.min(position.y, 200),
          },
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.word}>{selectedText || 'Unknown word'}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Lookup button */}
          {!selectedText || entries.length === 0 ? (
            <Pressable onPress={handleLookup} style={styles.lookupButton}>
              <Text style={styles.lookupButtonText}>LOOKUP</Text>
            </Pressable>
          ) : (
            <>
              {/* Definitions */}
              <View style={styles.entriesContainer}>
                {entries.map((entry, index) => (
                  <View key={index} style={styles.entry}>
                    <Text style={styles.partOfSpeech}>{entry.partOfSpeech}</Text>
                    <Text style={styles.definition}>{entry.definition}</Text>
                    {entry.example && (
                      <Text style={styles.example}>"{entry.example}"</Text>
                    )}
                    {entry.synonyms && entry.synonyms.length > 0 && (
                      <Text style={styles.synonyms}>
                        Synonyms: {entry.synonyms.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function TextSelectionOverlay({
  visible,
  selection,
  onSelect,
  onCopy,
  onDictionary,
  onBookmark,
}: {
  visible: boolean;
  selection?: { start: number; end: number; text: string };
  onSelect?: (start: number, end: number, text: string) => void;
  onCopy?: () => void;
  onDictionary?: () => void;
  onBookmark?: () => void;
}) {
  if (!visible || !selection) return null;

  return (
    <View style={styles.selectionBar}>
      <Pressable
        onPress={() => selection && onSelect?.(selection.start, selection.end, selection.text)}
        style={styles.selectionButton}
      >
        <Text style={styles.selectionButtonText}>SEL</Text>
      </Pressable>
      <Pressable onPress={onCopy} style={styles.selectionButton}>
        <Text style={styles.selectionButtonText}>COPY</Text>
      </Pressable>
      <Pressable onPress={onDictionary} style={styles.selectionButton}>
        <Text style={styles.selectionButtonText}>DICT</Text>
      </Pressable>
      <Pressable onPress={onBookmark} style={styles.selectionButton}>
        <Text style={styles.selectionButtonText}>BM</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    position: 'absolute',
    width: 280,
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: EINK_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  word: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: EINK_SPACING.sm,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  lookupButton: {
    margin: EINK_SPACING.md,
    padding: EINK_SPACING.md,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  lookupButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  entriesContainer: {
    padding: EINK_SPACING.md,
    maxHeight: 300,
  },
  entry: {
    marginBottom: EINK_SPACING.md,
  },
  partOfSpeech: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#333333',
    marginBottom: 2,
  },
  definition: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  example: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#333333',
    marginLeft: EINK_SPACING.sm,
  },
  synonyms: {
    fontSize: 12,
    color: '#333333',
    marginLeft: EINK_SPACING.sm,
    marginTop: 2,
  },
  selectionBar: {
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
  },
  selectionButton: {
    paddingVertical: EINK_SPACING.sm,
    paddingHorizontal: EINK_SPACING.md,
    borderWidth: 1,
    borderColor: '#000000',
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default DictionaryPopup;