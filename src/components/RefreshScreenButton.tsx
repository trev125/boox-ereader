/**
 * RefreshScreenButton component for e-ink display.
 * Triggers full-screen white/black flash for ghosting clearance.
 */
import React, { useState, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface RefreshScreenButtonProps {
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

export function RefreshScreenButton({ onRefresh, isRefreshing = false }: RefreshScreenButtonProps) {
  const [isFlashVisible, setIsFlashVisible] = useState(false);
  const [flashColor, setFlashColor] = useState<'white' | 'black'>('white');

  const handleRefresh = useCallback(async () => {
    // White flash
    setFlashColor('white');
    setIsFlashVisible(true);
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Black flash
    setFlashColor('black');
    
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    // White flash again
    setFlashColor('white');
    
    try {
      await onRefresh();
    } finally {
      // Final white flash
      setFlashColor('white');
      await new Promise((resolve) => setTimeout(resolve, 200));
      setIsFlashVisible(false);
    }
  }, [onRefresh]);

  return (
    <View>
      <Pressable
        onPress={handleRefresh}
        disabled={isRefreshing}
        style={styles.button}
      >
        {isRefreshing ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.buttonText}>REFRESH</Text>
        )}
      </Pressable>

      {isFlashVisible && (
        <View
          style={[
            styles.flashOverlay,
            { backgroundColor: flashColor === 'white' ? '#FFFFFF' : '#000000' },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: EINK_SPACING.sm,
    paddingHorizontal: EINK_SPACING.lg,
    borderWidth: 2,
    borderColor: '#000000',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});

export default RefreshScreenButton;