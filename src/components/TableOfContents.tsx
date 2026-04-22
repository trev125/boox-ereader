/**
 * TableOfContents component for e-ink display.
 * Displays the book's table of contents with navigation.
 */
import React from 'react';
import { Text, View, Pressable, StyleSheet, FlatList } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface TOCItem {
  id: string;
  title: string;
  href: string;
  subitems?: TOCItem[];
}

export interface TableOfContentsProps {
  visible: boolean;
  items: TOCItem[];
  onClose: () => void;
  onSelect: (item: TOCItem) => void;
}

export function TableOfContents({
  visible,
  items,
  onClose,
  onSelect,
}: TableOfContentsProps) {
  const colors = EINK_COLORS.light;

  const renderItem = ({ item, level = 0 }: { item: TOCItem; level?: number }) => (
    <View style={[styles.item, { marginLeft: level * EINK_SPACING.lg }]}>
      <Pressable
        onPress={() => onSelect(item)}
        style={[
          styles.button,
          {
            borderColor: colors.border,
            backgroundColor: '#FFFFFF',
          },
        ]}
      >
        <Text style={[styles.title, { color: '#000000' }]} numberOfLines={2}>
          {item.title}
        </Text>
      </Pressable>
      {item.subitems?.map((subitem) => (
        <View key={subitem.id} style={styles.subitem}>
          <View style={styles.subitemIndicator} />
          {renderItem({ item: subitem, level: level + 1 })}
        </View>
      ))}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TABLE OF CONTENTS</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        renderItem={({ item }) => renderItem({ item })}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export function TOCSlideOver({
  visible,
  items,
  onClose,
  onSelect,
}: {
  visible: boolean;
  items: TOCItem[];
  onClose: () => void;
  onSelect: (item: TOCItem) => void;
}) {
  return (
    <View style={styles.slideOverContainer}>
      <Pressable style={styles.slideOverToggle} onPress={onClose}>
        <Text style={styles.slideOverToggleText}>☰ TOC</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: EINK_SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  closeButton: {
    padding: EINK_SPACING.sm,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  list: {
    padding: EINK_SPACING.sm,
  },
  item: {
    marginBottom: EINK_SPACING.sm,
  },
  button: {
    padding: EINK_SPACING.md,
    borderWidth: 1,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  subitem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: EINK_SPACING.xs,
  },
  subitemIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: '#000000',
    marginRight: EINK_SPACING.sm,
    marginTop: 4,
  },
  slideOverContainer: {
    position: 'absolute',
    top: 50,
    left: EINK_SPACING.sm,
    zIndex: 10,
  },
  slideOverToggle: {
    padding: EINK_SPACING.sm,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    minHeight: MIN_TOUCH_TARGET,
  },
  slideOverToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default TableOfContents;
