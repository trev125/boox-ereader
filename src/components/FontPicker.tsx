/**
 * FontPicker component for e-ink display.
 * Allows users to select font family, size, and line height.
 */
import React from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface FontFamily {
  name: string;
  family: string;
  isSystem?: boolean;
}

export const SYSTEM_FONTS: FontFamily[] = [
  { name: 'Bookerly', family: 'Bookerly, Georgia, serif' },
  { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Times', family: '"Times New Roman", Times, serif' },
  { name: 'Courier', family: '"Courier New", Courier, monospace' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { name: 'Palatino', family: '"Palatino Linotype", Palatino, serif' },
];

export interface FontPickerProps {
  selectedFont: FontFamily;
  fontSize: number;
  lineHeight: number;
  onFontSelect: (font: FontFamily) => void;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
}

export function FontPicker({
  selectedFont,
  fontSize,
  lineHeight,
  onFontSelect,
  onFontSizeChange,
  onLineHeightChange,
}: FontPickerProps) {
  const colors = EINK_COLORS.dark;

  const handleFontSizeIncrease = () => {
    if (fontSize < 32) {
      onFontSizeChange(Math.min(32, fontSize + 1));
    }
  };

  const handleFontSizeDecrease = () => {
    if (fontSize > 8) {
      onFontSizeChange(Math.max(8, fontSize - 1));
    }
  };

  const handleLineHeightIncrease = () => {
    if (lineHeight < 3.0) {
      onLineHeightChange(Math.min(3.0, lineHeight + 0.1));
    }
  };

  const handleLineHeightDecrease = () => {
    if (lineHeight > 1.0) {
      onLineHeightChange(Math.max(1.0, lineHeight - 0.1));
    }
  };

  return (
    <View style={styles.container}>
      {/* Font Family Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Family</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontScroll}>
          {SYSTEM_FONTS.map((font) => (
            <Pressable
              key={font.name}
              onPress={() => onFontSelect(font)}
              style={[
                styles.fontButton,
                selectedFont.name === font.name && styles.fontButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.fontButtonLabel,
                  { fontFamily: font.family, fontSize: 14 },
                  selectedFont.name === font.name && styles.fontButtonLabelSelected,
                ]}
              >
                {font.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Font Size Control */}
      <View style={styles.controlRow}>
        <Text style={styles.controlLabel}>Font Size</Text>
        <View style={styles.controlButtons}>
          <Pressable
            onPress={handleFontSizeDecrease}
            style={[styles.smallButton, fontSize <= 8 && styles.disabledButton]}
          >
            <Text style={[styles.smallButtonText, fontSize <= 8 && styles.disabledText]}>A-</Text>
          </Pressable>
          <Text style={styles.controlValue}>{fontSize}</Text>
          <Pressable
            onPress={handleFontSizeIncrease}
            style={[styles.smallButton, fontSize >= 32 && styles.disabledButton]}
          >
            <Text style={[styles.smallButtonText, fontSize >= 32 && styles.disabledText]}>A+</Text>
          </Pressable>
        </View>
      </View>

      {/* Line Height Control */}
      <View style={styles.controlRow}>
        <Text style={styles.controlLabel}>Line Height</Text>
        <View style={styles.controlButtons}>
          <Pressable
            onPress={handleLineHeightDecrease}
            style={[styles.smallButton, lineHeight <= 1.0 && styles.disabledButton]}
          >
            <Text style={[styles.smallButtonText, lineHeight <= 1.0 && styles.disabledText]}>-</Text>
          </Pressable>
          <Text style={styles.controlValue}>{lineHeight.toFixed(1)}</Text>
          <Pressable
            onPress={handleLineHeightIncrease}
            style={[styles.smallButton, lineHeight >= 3.0 && styles.disabledButton]}
          >
            <Text style={[styles.smallButtonText, lineHeight >= 3.0 && styles.disabledText]}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function FontSizePicker({
  fontSize,
  onFontSizeChange,
}: {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}) {
  const colors = EINK_COLORS.dark;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Font Size</Text>
      <View style={styles.sizeSelector}>
        {[10, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
          <Pressable
            key={size}
            onPress={() => onFontSizeChange(size)}
            style={[
              styles.sizeButton,
              fontSize === size && styles.sizeButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.sizeButtonText,
                { fontSize: size },
                fontSize === size && styles.sizeButtonTextSelected,
              ]}
            >
              A
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: EINK_SPACING.md,
    borderWidth: 1,
    borderColor: EINK_COLORS.dark.cardBorder,
  },
  section: {
    marginBottom: EINK_SPACING.md,
  },
  sectionTitle: {
    color: EINK_COLORS.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: EINK_SPACING.sm,
  },
  fontScroll: {
    maxHeight: 60,
  },
  fontButton: {
    paddingVertical: EINK_SPACING.sm,
    paddingHorizontal: EINK_SPACING.md,
    marginRight: EINK_SPACING.sm,
    borderWidth: 2,
    borderColor: EINK_COLORS.dark.cardBorder,
    minHeight: MIN_TOUCH_TARGET,
  },
  fontButtonSelected: {
    backgroundColor: EINK_COLORS.dark.text,
    borderColor: EINK_COLORS.dark.text,
  },
  fontButtonLabel: {
    color: EINK_COLORS.dark.text,
  },
  fontButtonLabelSelected: {
    color: EINK_COLORS.dark.background,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: EINK_SPACING.xs,
  },
  controlLabel: {
    color: EINK_COLORS.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EINK_SPACING.sm,
  },
  controlValue: {
    color: EINK_COLORS.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  smallButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: EINK_COLORS.dark.text,
  },
  smallButtonText: {
    color: EINK_COLORS.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledText: {
    opacity: 0.3,
  },
  sizeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EINK_SPACING.sm,
  },
  sizeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: EINK_COLORS.dark.cardBorder,
  },
  sizeButtonSelected: {
    backgroundColor: EINK_COLORS.dark.text,
    borderColor: EINK_COLORS.dark.text,
  },
  sizeButtonText: {
    color: EINK_COLORS.dark.text,
    fontWeight: 'bold',
  },
  sizeButtonTextSelected: {
    color: EINK_COLORS.dark.background,
  },
});

export default FontPicker;