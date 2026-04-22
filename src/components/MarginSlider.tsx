/**
 * MarginSlider component for e-ink display.
 * Horizontal and vertical margin sliders for EPUB rendering.
 */
import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface MarginSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}

export function MarginSlider({ label, value, min, max, step = 1, unit = 'px', onValueChange }: MarginSliderProps) {
  const colors = EINK_COLORS.dark;

  const handleIncrease = () => {
    if (value < max) {
      onValueChange(Math.min(max, value + step));
    }
  };

  const handleDecrease = () => {
    if (value > min) {
      onValueChange(Math.max(min, value - step));
    }
  };

  const progress = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}{unit}
        </Text>
      </View>
      <View style={styles.sliderContainer}>
        {/* Background track */}
        <View style={styles.track} />
        {/* Progress fill */}
        <View style={[styles.progress, { width: `${progress}%` }]} />
        {/* Decrease button */}
        <Pressable
          onPress={handleDecrease}
          style={[styles.button, styles.decreaseButton]}
          disabled={value <= min}
        >
          <Text style={[styles.buttonText, value <= min && styles.disabledText]}>-</Text>
        </Pressable>
        {/* Increase button */}
        <Pressable
          onPress={handleIncrease}
          style={[styles.button, styles.increaseButton]}
          disabled={value >= max}
        >
          <Text style={[styles.buttonText, value >= max && styles.disabledText]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ReaderMarginControls({
  horizontalMargin,
  verticalMargin,
  onHorizontalMarginChange,
  onVerticalMarginChange,
}: {
  horizontalMargin: number;
  verticalMargin: number;
  onHorizontalMarginChange: (value: number) => void;
  onVerticalMarginChange: (value: number) => void;
}) {
  return (
    <View style={styles.controlsContainer}>
      <MarginSlider
        label="Horizontal Margin"
        value={horizontalMargin}
        min={0}
        max={60}
        step={5}
        unit="px"
        onValueChange={onHorizontalMarginChange}
      />
      <MarginSlider
        label="Vertical Margin"
        value={verticalMargin}
        min={0}
        max={60}
        step={5}
        unit="px"
        onValueChange={onVerticalMarginChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: EINK_SPACING.md,
    borderWidth: 1,
    borderColor: EINK_COLORS.dark.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: EINK_SPACING.sm,
  },
  label: {
    color: EINK_COLORS.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    color: EINK_COLORS.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EINK_SPACING.sm,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: EINK_COLORS.dark.cardBorder,
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 8,
    backgroundColor: EINK_COLORS.dark.text,
  },
  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: EINK_COLORS.dark.text,
  },
  decreaseButton: {
    borderRadius: 0,
  },
  increaseButton: {
    borderRadius: 0,
  },
  buttonText: {
    color: EINK_COLORS.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.3,
  },
  controlsContainer: {
    gap: EINK_SPACING.sm,
  },
});

export default MarginSlider;